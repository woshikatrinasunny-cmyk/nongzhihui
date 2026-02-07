/**
 * 小程序端真实网络搜索服务
 * 通过 Render 上部署的后端 API 代理搜索（后端聚合百度+Bing）
 * 
 * 后端地址: https://nongzhihui-api.onrender.com
 * 搜索接口: GET /api/search?keyword=xxx&category=xxx&sortBy=xxx&page=1&pageSize=10
 * 联想词:   GET /api/search/suggestions?prefix=xxx
 * 
 * 微信小程序后台需添加合法域名: https://nongzhihui-api.onrender.com
 * （开发阶段可勾选"不校验合法域名"）
 */

const API_BASE = 'https://nongzhihui-api.onrender.com';

// ====== 缓存 ======
const _cache = {};
const CACHE_EXPIRY = 10 * 60 * 1000; // 10分钟

function getCache(key) {
  const c = _cache[key];
  if (c && Date.now() - c.ts < CACHE_EXPIRY) return c.data;
  return null;
}
function setCache(key, data) {
  _cache[key] = { data, ts: Date.now() };
}

/**
 * 全网搜索（通过后端代理）
 */
function search(keyword, options = {}) {
  const { category, sortBy = 'relevance', page = 1, pageSize = 10 } = options;

  const cacheKey = `${keyword}:${category}:${sortBy}:${page}`;
  const cached = getCache(cacheKey);
  if (cached) return Promise.resolve(cached);

  const params = [
    `keyword=${encodeURIComponent(keyword)}`,
    `page=${page}`,
    `pageSize=${pageSize}`,
    `sortBy=${sortBy}`
  ];
  if (category) params.push(`category=${category}`);

  const url = `${API_BASE}/api/search?${params.join('&')}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      timeout: 15000,
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          const result = res.data.data;
          setCache(cacheKey, result);
          resolve(result);
        } else {
          console.error('[WebSearch] API返回异常:', res.statusCode, res.data);
          reject(new Error('搜索API返回异常'));
        }
      },
      fail(err) {
        console.error('[WebSearch] 请求失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取搜索联想词（通过后端）
 */
function getRemoteSuggestions(prefix) {
  if (!prefix || !prefix.trim()) return Promise.resolve([]);

  return new Promise((resolve) => {
    wx.request({
      url: `${API_BASE}/api/search/suggestions?prefix=${encodeURIComponent(prefix)}`,
      method: 'GET',
      timeout: 5000,
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          resolve(res.data.data || []);
        } else {
          resolve([]);
        }
      },
      fail() { resolve([]); }
    });
  });
}

/**
 * 检测后端是否可用
 */
function checkAvailability() {
  return new Promise((resolve) => {
    wx.request({
      url: `${API_BASE}/api/search/hot`,
      method: 'GET',
      timeout: 8000,
      success(res) {
        resolve(res.statusCode === 200);
      },
      fail() { resolve(false); }
    });
  });
}

module.exports = { search, getRemoteSuggestions, checkAvailability, API_BASE };
