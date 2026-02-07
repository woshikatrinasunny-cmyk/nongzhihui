/**
 * 正文抓取服务 (Content Fetcher)
 * 从原始网页 URL 抓取完整正文内容
 */

const axios = require('axios');
const cheerio = require('cheerio');

class ContentFetcher {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1小时
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * 抓取网页正文
   * @param {string} url - 原始网页 URL
   * @returns {Promise<{content: string, fullTitle: string}>}
   */
  async fetch(url) {
    if (!url || typeof url !== 'string') {
      return { content: '', fullTitle: '' };
    }

    // 跳过百度跳转链接（无法直接抓取）
    if (url.includes('baidu.com/link')) {
      return { content: '', fullTitle: '' };
    }

    // 检查缓存
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      console.log('[正文抓取] 开始:', url);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9'
        },
        maxRedirects: 3,
        responseType: 'arraybuffer'
      });

      // 处理编码
      const html = this._decodeHtml(response.data, response.headers['content-type']);
      const result = this._extractContent(html, url);

      console.log('[正文抓取] 成功, 正文长度:', result.content.length);

      // 缓存
      this.cache.set(url, { data: result, timestamp: Date.now() });
      if (this.cache.size > 200) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    } catch (err) {
      console.error('[正文抓取] 失败:', url, err.message);
      return { content: '', fullTitle: '' };
    }
  }

  /**
   * 解码 HTML（处理 GBK/GB2312 等中文编码）
   */
  _decodeHtml(buffer, contentType) {
    // 检测编码
    let charset = 'utf-8';
    if (contentType && /charset=([^\s;]+)/i.test(contentType)) {
      charset = RegExp.$1.toLowerCase();
    }

    // 先用 utf-8 试读，检查 meta charset
    const rough = buffer.toString('utf-8');
    const metaMatch = rough.match(/<meta[^>]*charset=["']?([^"'\s;>]+)/i);
    if (metaMatch) {
      charset = metaMatch[1].toLowerCase();
    }

    if (charset === 'utf-8' || charset === 'utf8') {
      return rough;
    }

    // 非 UTF-8 编码，用 TextDecoder
    try {
      const decoder = new TextDecoder(charset);
      return decoder.decode(buffer);
    } catch {
      return rough; // fallback
    }
  }

  /**
   * 从 HTML 中提取正文
   */
  _extractContent(html, url) {
    const $ = cheerio.load(html);

    // 移除无关元素
    $('script, style, nav, header, footer, .nav, .header, .footer, .sidebar, .ad, .advertisement, .comment, .comments, iframe, noscript').remove();

    let fullTitle = $('title').text().trim() || '';
    // 清理标题中的网站名后缀
    fullTitle = fullTitle.replace(/[-_|].*$/, '').trim();

    let content = '';

    // 针对政府网站的特殊选择器
    const govSelectors = [
      '.article-content', '.TRS_Editor', '.pages_content',
      '.content', '#content', '.article', '#article',
      '.text', '#text', '.main-content', '.entry-content',
      '.post-content', '.news-content', '.detail-content',
      '[class*="article"]', '[class*="content"]',
      '.p_content', '.con_txt', '.Section0'
    ];

    for (const sel of govSelectors) {
      const el = $(sel);
      if (el.length > 0) {
        content = this._cleanContent($, el);
        if (content.length > 100) break;
      }
    }

    // 如果没找到，尝试找最大的文本块
    if (content.length < 100) {
      content = this._findLargestTextBlock($);
    }

    // 格式化为 HTML 段落
    if (content) {
      content = this._formatContent(content);
    }

    return { content, fullTitle };
  }

  /**
   * 清理提取的内容
   */
  _cleanContent($, el) {
    // 移除内部的导航、分享等
    el.find('script, style, .share, .tool, .page-nav, .pagination').remove();

    const paragraphs = [];
    el.find('p, div > br').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 10) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length > 0) {
      return paragraphs.join('\n\n');
    }

    // fallback: 直接取文本
    return el.text().trim();
  }

  /**
   * 找最大文本块
   */
  _findLargestTextBlock($) {
    let best = '';
    $('div, article, section, main').each((_, elem) => {
      const text = $(elem).text().trim();
      // 排除太短或太长（可能是整个页面）的
      if (text.length > best.length && text.length > 100 && text.length < 50000) {
        // 检查文本密度（文本长度 / HTML长度）
        const htmlLen = $(elem).html()?.length || 1;
        const density = text.length / htmlLen;
        if (density > 0.3) {
          best = text;
        }
      }
    });
    return best;
  }

  /**
   * 格式化为 HTML 段落
   */
  _formatContent(text) {
    // 按换行分段
    const lines = text.split(/\n+/).filter(l => l.trim().length > 0);
    // 去重连续相同行
    const unique = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 5 && unique[unique.length - 1] !== trimmed) {
        unique.push(trimmed);
      }
    }
    return unique.map(l => `<p>${l}</p>`).join('\n');
  }
}

module.exports = new ContentFetcher();
