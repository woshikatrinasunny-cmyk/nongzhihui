/**
 * 小程序端真实网络搜索服务
 * 使用 Google Custom Search JSON API（每天免费100次）
 * 
 * 配置说明：
 * 1. 前往 https://programmablesearchengine.google.com/ 创建搜索引擎
 *    - 搜索范围选"搜索整个网络"
 * 2. 前往 https://console.cloud.google.com/ 创建 API Key
 *    - 启用 Custom Search API
 * 3. 将 API_KEY 和 SEARCH_ENGINE_ID 填入下方
 * 4. 微信小程序后台添加合法域名: https://www.googleapis.com
 *    （开发阶段可勾选"不校验合法域名"）
 */

// ====== 配置 ======
const CONFIG = {
  API_KEY: 'YOUR_GOOGLE_API_KEY',           // 替换为你的 Google API Key
  SEARCH_ENGINE_ID: 'YOUR_SEARCH_ENGINE_ID', // 替换为你的搜索引擎 ID
  BASE_URL: 'https://www.googleapis.com/customsearch/v1'
};

// ====== 缓存 ======
const _cache = {};
const CACHE_EXPIRY = 30 * 60 * 1000; // 30分钟

function getCache(key) {
  const c = _cache[key];
  if (c && Date.now() - c.ts < CACHE_EXPIRY) return c.data;
  return null;
}
function setCache(key, data) {
  _cache[key] = { data, ts: Date.now() };
}

// ====== 分类映射 ======
const CATEGORY_SUFFIX = {
  law: ' 法律法规',
  policy: ' 政策文件',
  tech: ' 农业技术',
  culture: ' 乡土文化'
};

/**
 * 判断 API 是否已配置
 */
function isConfigured() {
  return CONFIG.API_KEY !== 'YOUR_GOOGLE_API_KEY' && CONFIG.SEARCH_ENGINE_ID !== 'YOUR_SEARCH_ENGINE_ID';
}

/**
 * 搜索涉农资源
 * @param {string} keyword 搜索关键词
 * @param {object} options { category, page, pageSize }
 * @returns {Promise<{list, total, hasMore}>}
 */
function search(keyword, options = {}) {
  const { category, page = 1, pageSize = 10 } = options;

  // 构建搜索词：加上涉农限定 + 分类后缀
  let query = keyword + ' 涉农';
  if (category && CATEGORY_SUFFIX[category]) {
    query = keyword + CATEGORY_SUFFIX[category];
  }

  const cacheKey = `${query}:${page}`;
  const cached = getCache(cacheKey);
  if (cached) return Promise.resolve(cached);

  // Google CSE 参数
  const start = (page - 1) * pageSize + 1; // 1-based
  const params = [
    `key=${CONFIG.API_KEY}`,
    `cx=${CONFIG.SEARCH_ENGINE_ID}`,
    `q=${encodeURIComponent(query)}`,
    `num=${Math.min(pageSize, 10)}`,
    `start=${start}`,
    `lr=lang_zh-CN`,
    `gl=cn`
  ].join('&');

  const url = `${CONFIG.BASE_URL}?${params}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      timeout: 10000,
      success(res) {
        if (res.statusCode !== 200 || !res.data) {
          console.error('[WebSearch] API 错误:', res.statusCode, res.data);
          reject(new Error('搜索API请求失败'));
          return;
        }

        const data = res.data;
        const totalResults = parseInt(data.searchInformation?.totalResults || '0', 10);
        const items = data.items || [];

        const list = items.map((item, idx) => ({
          _id: 'web_' + generateHash(item.title),
          title: cleanText(item.title),
          summary: cleanText(item.snippet || ''),
          category: guessCategory(item.title + ' ' + (item.snippet || '')),
          publishTime: extractDate(item.snippet) || '',
          source: extractSource(item.displayLink || item.link),
          sourceUrl: item.link,
          tags: extractTags(item.title, keyword),
          authority: isOfficialSite(item.link) ? 'official' : 'general',
          platform: 'google',
          platformName: 'Google搜索',
          viewCount: 0,
          collectCount: 0
        }));

        const result = { list, total: Math.min(totalResults, 100), hasMore: totalResults > start + pageSize - 1 };
        setCache(cacheKey, result);
        resolve(result);
      },
      fail(err) {
        console.error('[WebSearch] 请求失败:', err);
        reject(err);
      }
    });
  });
}

// ====== 辅助函数 ======

function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function cleanText(text) {
  return (text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function guessCategory(text) {
  if (/法律|法规|条例|法典|司法|立法|修正|人大/.test(text)) return 'law';
  if (/政策|通知|意见|方案|规划|部署|决定|办法/.test(text)) return 'policy';
  if (/技术|种植|养殖|农技|科技|创新|智能|数字/.test(text)) return 'tech';
  if (/文化|传统|民俗|乡村|非遗|历史/.test(text)) return 'culture';
  return 'policy';
}

function extractSource(link) {
  const map = {
    'www.gov.cn': '中国政府网', 'www.moa.gov.cn': '农业农村部',
    'www.npc.gov.cn': '全国人大网', 'www.moj.gov.cn': '司法部',
    'www.mof.gov.cn': '财政部', 'www.stats.gov.cn': '国家统计局',
    'sousuo.gov.cn': '中国政府网'
  };
  try {
    const host = link.replace(/^https?:\/\//, '').split('/')[0];
    return map[host] || host.replace('www.', '');
  } catch (e) { return '网络来源'; }
}

function isOfficialSite(url) {
  return /\.gov\.cn|\.edu\.cn|\.org\.cn/.test(url || '');
}

function extractDate(text) {
  const m = (text || '').match(/(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  return null;
}

function extractTags(title, keyword) {
  const tags = [keyword];
  [/农业/, /农村/, /乡村/, /土地/, /粮食/, /种植/, /养殖/, /补贴/, /政策/, /法律/, /振兴/]
    .forEach(p => { const m = title.match(p); if (m && !tags.includes(m[0])) tags.push(m[0]); });
  return tags.slice(0, 5);
}

module.exports = { search, isConfigured, CONFIG };
