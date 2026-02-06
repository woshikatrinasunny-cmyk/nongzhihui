/**
 * 真实网络搜索服务
 * 通过搜索引擎获取真实的涉农法政数据
 */

const axios = require('axios');

class WebSearchService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30分钟缓存
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 搜索入口 - 聚合多个来源
   */
  async search(keyword, options = {}) {
    const { category, page = 1, pageSize = 10 } = options;

    // 构建搜索关键词
    let searchQuery = keyword;
    if (category) {
      const categoryMap = {
        'law': '法律法规',
        'policy': '政策文件',
        'tech': '农业技术',
        'culture': '乡土文化'
      };
      searchQuery = `${keyword} ${categoryMap[category] || ''}`;
    }

    // 检查缓存
    const cacheKey = `${searchQuery}:${page}:${pageSize}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[网络搜索] 使用缓存:', cacheKey);
      return cached;
    }

    console.log('[网络搜索] 开始搜索:', searchQuery);

    // 并发搜索多个来源
    const results = await Promise.allSettled([
      this.searchBing(searchQuery, page, pageSize),
      this.searchBaidu(searchQuery, page, pageSize)
    ]);

    // 合并结果
    let allResults = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.length > 0) {
        allResults = allResults.concat(r.value);
        console.log(`[网络搜索] 来源${i}返回${r.value.length}条`);
      } else if (r.status === 'rejected') {
        console.error(`[网络搜索] 来源${i}失败:`, r.reason?.message);
      }
    });

    // 去重（按标题）
    const seen = new Set();
    allResults = allResults.filter(item => {
      const key = item.title.replace(/\s+/g, '').substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 分页
    const start = 0;
    const list = allResults.slice(start, start + pageSize);

    const result = {
      list,
      total: allResults.length,
      hasMore: allResults.length > pageSize
    };

    // 缓存结果
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * Bing搜索
   */
  async searchBing(keyword, page, pageSize) {
    try {
      const offset = (page - 1) * pageSize;
      const url = `https://cn.bing.com/search?q=${encodeURIComponent(keyword + ' site:gov.cn OR site:moa.gov.cn OR site:npc.gov.cn')}&count=${pageSize}&first=${offset + 1}&mkt=zh-CN`;

      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9'
        }
      });

      return this.parseBingResults(response.data, keyword);
    } catch (error) {
      console.error('[Bing搜索] 失败:', error.message);
      return [];
    }
  }

  /**
   * 百度搜索
   */
  async searchBaidu(keyword, page, pageSize) {
    try {
      const pn = (page - 1) * pageSize;
      const url = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword + ' site:gov.cn')}&rn=${pageSize}&pn=${pn}`;

      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Cookie': 'BAIDUID=random' + Date.now()
        }
      });

      return this.parseBaiduResults(response.data, keyword);
    } catch (error) {
      console.error('[百度搜索] 失败:', error.message);
      return [];
    }
  }

  /**
   * 生成稳定的ID（基于标题hash）
   */
  generateId(prefix, title) {
    let hash = 0;
    const str = title || '';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return prefix + '_' + Math.abs(hash);
  }

  /**
   * 解析Bing搜索结果
   */
  parseBingResults(html, keyword) {
    const results = [];
    try {
      // 匹配搜索结果块
      const liRegex = /<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/g;
      let match;

      while ((match = liRegex.exec(html)) !== null) {
        const block = match[1];

        // 提取标题和链接
        const titleMatch = block.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
        if (!titleMatch) continue;

        const sourceUrl = titleMatch[1];
        const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();

        // 提取摘要
        const summaryMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/) ||
                            block.match(/<div class="b_caption"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/);
        const summary = summaryMatch
          ? summaryMatch[1].replace(/<[^>]+>/g, '').trim()
          : '';

        if (!title || title.length < 4) continue;

        results.push({
          _id: this.generateId('bing', title),
          title: this.cleanText(title),
          summary: this.cleanText(summary).substring(0, 200),
          category: this.guessCategory(title + summary),
          publishTime: this.extractDate(block) || new Date().toISOString().split('T')[0],
          source: this.extractSource(sourceUrl),
          sourceUrl: sourceUrl,
          tags: this.extractTags(title, keyword),
          authority: sourceUrl.includes('.gov.cn') ? 'official' : 'general',
          platform: 'bing',
          platformName: 'Bing搜索'
        });
      }
    } catch (e) {
      console.error('[Bing解析] 错误:', e.message);
    }
    return results;
  }

  /**
   * 解析百度搜索结果
   */
  parseBaiduResults(html, keyword) {
    const results = [];
    try {
      // 匹配搜索结果
      const resultRegex = /<div[^>]*class="result[^"]*c-container[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<!--/g;
      let match;

      // 备用：简单匹配标题
      const titleRegex = /<h3[^>]*class="[^"]*t[^"]*"[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
      const summaryRegex = /<span class="content-right_[^"]*">([\s\S]*?)<\/span>/g;

      let titleMatch;
      const titles = [];
      const summaries = [];

      while ((titleMatch = titleRegex.exec(html)) !== null) {
        titles.push({
          url: titleMatch[1],
          title: titleMatch[2].replace(/<[^>]+>/g, '').trim()
        });
      }

      let summaryMatch;
      while ((summaryMatch = summaryRegex.exec(html)) !== null) {
        summaries.push(summaryMatch[1].replace(/<[^>]+>/g, '').trim());
      }

      // 如果没匹配到摘要，尝试另一种模式
      if (summaries.length === 0) {
        const altSummaryRegex = /<span class="[^"]*">\s*([\s\S]{20,300}?)\s*<\/span>/g;
        while ((summaryMatch = altSummaryRegex.exec(html)) !== null) {
          const text = summaryMatch[1].replace(/<[^>]+>/g, '').trim();
          if (text.length > 20 && !text.includes('class=') && !text.includes('function')) {
            summaries.push(text);
          }
        }
      }

      titles.forEach((item, i) => {
        if (!item.title || item.title.length < 4) return;

        results.push({
          _id: this.generateId('baidu', item.title),
          title: this.cleanText(item.title),
          summary: this.cleanText(summaries[i] || '').substring(0, 200),
          category: this.guessCategory(item.title),
          publishTime: new Date().toISOString().split('T')[0],
          source: this.extractSource(item.url),
          sourceUrl: item.url,
          tags: this.extractTags(item.title, keyword),
          authority: 'general',
          platform: 'baidu',
          platformName: '百度搜索'
        });
      });
    } catch (e) {
      console.error('[百度解析] 错误:', e.message);
    }
    return results;
  }

  /**
   * 智能分类
   */
  guessCategory(text) {
    if (/法律|法规|条例|法典|司法|立法|修正|人大/.test(text)) return 'law';
    if (/政策|通知|意见|方案|规划|部署|决定|办法/.test(text)) return 'policy';
    if (/技术|种植|养殖|农技|科技|创新|智能|数字/.test(text)) return 'tech';
    if (/文化|传统|民俗|乡村|非遗|历史/.test(text)) return 'culture';
    return 'policy';
  }

  /**
   * 提取来源
   */
  extractSource(url) {
    try {
      const hostname = new URL(url).hostname;
      const sourceMap = {
        'www.gov.cn': '中国政府网',
        'www.moa.gov.cn': '农业农村部',
        'www.npc.gov.cn': '全国人大网',
        'sousuo.gov.cn': '中国政府网',
        'www.moj.gov.cn': '司法部',
        'www.mof.gov.cn': '财政部',
        'www.stats.gov.cn': '国家统计局'
      };
      return sourceMap[hostname] || hostname.replace('www.', '');
    } catch {
      return '网络来源';
    }
  }

  /**
   * 提取日期
   */
  extractDate(text) {
    const dateMatch = text.match(/(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})/);
    if (dateMatch) {
      return `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    }
    return null;
  }

  /**
   * 提取标签
   */
  extractTags(title, keyword) {
    const tags = [keyword];
    const tagPatterns = [
      /农业/, /农村/, /乡村/, /土地/, /粮食/, /种植/, /养殖/,
      /补贴/, /政策/, /法律/, /法规/, /振兴/, /扶贫/, /脱贫/
    ];
    tagPatterns.forEach(p => {
      const m = title.match(p);
      if (m && !tags.includes(m[0])) tags.push(m[0]);
    });
    return tags.slice(0, 5);
  }

  /**
   * 清理文本
   */
  cleanText(text) {
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 缓存管理
   */
  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
    // 限制缓存大小
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

module.exports = new WebSearchService();
