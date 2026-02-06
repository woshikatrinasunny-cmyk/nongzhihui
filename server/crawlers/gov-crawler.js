/**
 * 中国政府网爬虫
 * 爬取政策文件和法律法规
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Resource = require('../models/Resource');

class GovCrawler {
  constructor() {
    this.baseUrl = 'http://www.gov.cn';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    this.delay = 2000; // 请求间隔2秒
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 爬取政策列表页
   */
  async crawlPolicyList(page = 1) {
    try {
      console.log(`正在爬取第 ${page} 页...`);
      
      // 注意：这是示例URL，实际需要根据网站结构调整
      const url = `${this.baseUrl}/zhengce/content/index_${page}.htm`;
      
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const items = [];

      // 根据实际网站结构调整选择器
      $('.list_item').each((index, element) => {
        const $item = $(element);
        
        const title = $item.find('.tit a').text().trim();
        const link = $item.find('.tit a').attr('href');
        const date = $item.find('.date').text().trim();
        const summary = $item.find('.txt').text().trim();

        if (title && link) {
          items.push({
            title,
            link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
            date,
            summary
          });
        }
      });

      console.log(`第 ${page} 页爬取完成，获取 ${items.length} 条数据`);
      return items;
    } catch (error) {
      console.error(`爬取第 ${page} 页失败:`, error.message);
      return [];
    }
  }

  /**
   * 爬取详情页
   */
  async crawlDetail(url) {
    try {
      await this.sleep(this.delay);
      
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // 根据实际网站结构调整选择器
      const title = $('.article h1').text().trim();
      const content = $('.article .content').text().trim();
      const publishTime = $('.article .date').text().trim();
      const source = $('.article .source').text().trim() || '中国政府网';

      return {
        title,
        content,
        publishTime: this.parseDate(publishTime),
        source,
        sourceUrl: url
      };
    } catch (error) {
      console.error(`爬取详情页失败 ${url}:`, error.message);
      return null;
    }
  }

  /**
   * 解析日期
   */
  parseDate(dateStr) {
    // 处理各种日期格式
    if (!dateStr) return new Date();
    
    // 示例：2024-01-01 或 2024年01月01日
    const match = dateStr.match(/(\d{4})[-年](\d{1,2})[-月](\d{1,2})/);
    if (match) {
      return new Date(match[1], match[2] - 1, match[3]);
    }
    
    return new Date();
  }

  /**
   * 分类识别
   */
  identifyCategory(title, content) {
    if (title.includes('法') || title.includes('条例') || title.includes('规定')) {
      return 'law';
    }
    if (title.includes('政策') || title.includes('意见') || title.includes('通知')) {
      return 'policy';
    }
    if (title.includes('技术') || title.includes('指南') || title.includes('标准')) {
      return 'tech';
    }
    return 'policy'; // 默认分类
  }

  /**
   * 提取标签
   */
  extractTags(title, content) {
    const tags = [];
    const keywords = ['农业', '农村', '农民', '土地', '种植', '养殖', '补贴', '乡村振兴'];
    
    keywords.forEach(keyword => {
      if (title.includes(keyword) || content.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return tags;
  }

  /**
   * 保存到数据库
   */
  async saveToDatabase(item) {
    try {
      // 检查是否已存在
      const existing = await Resource.findOne({ sourceUrl: item.sourceUrl });
      if (existing) {
        console.log(`资源已存在: ${item.title}`);
        return false;
      }

      // 创建新资源
      await Resource.create({
        title: item.title,
        summary: item.summary || item.content.substring(0, 200),
        content: item.content,
        category: this.identifyCategory(item.title, item.content),
        source: item.source,
        sourceUrl: item.sourceUrl,
        publishTime: item.publishTime,
        tags: this.extractTags(item.title, item.content),
        status: 'published'
      });

      console.log(`保存成功: ${item.title}`);
      return true;
    } catch (error) {
      console.error(`保存失败: ${item.title}`, error.message);
      return false;
    }
  }

  /**
   * 执行爬取任务
   */
  async run(maxPages = 5) {
    console.log('开始爬取中国政府网...');
    
    let totalSaved = 0;
    let totalFailed = 0;

    for (let page = 1; page <= maxPages; page++) {
      // 爬取列表页
      const items = await this.crawlPolicyList(page);
      
      // 爬取每个详情页
      for (const item of items) {
        const detail = await this.crawlDetail(item.link);
        
        if (detail) {
          const saved = await this.saveToDatabase({
            ...item,
            ...detail
          });
          
          if (saved) {
            totalSaved++;
          } else {
            totalFailed++;
          }
        } else {
          totalFailed++;
        }
      }

      // 页面间延迟
      await this.sleep(this.delay);
    }

    console.log(`爬取完成！成功: ${totalSaved}, 失败: ${totalFailed}`);
    return { success: totalSaved, failed: totalFailed };
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nongzhihui')
    .then(async () => {
      console.log('数据库连接成功');
      
      const crawler = new GovCrawler();
      await crawler.run(3); // 爬取3页
      
      mongoose.connection.close();
      process.exit(0);
    })
    .catch(err => {
      console.error('数据库连接失败:', err);
      process.exit(1);
    });
}

module.exports = GovCrawler;
