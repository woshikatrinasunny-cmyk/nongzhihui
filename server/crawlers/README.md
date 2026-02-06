# 涉农资源爬虫系统

## 概述

本目录包含用于爬取各大涉农平台资源的爬虫脚本。

## 爬虫列表

### 已实现
- `gov-crawler.js` - 中国政府网爬虫
- `moa-crawler.js` - 农业农村部爬虫
- `npc-crawler.js` - 全国人大网爬虫

### 计划中
- 各省农业厅网站爬虫
- 学术资源爬虫（知网、万方等）
- 农业问答社区爬虫

## 使用方法

### 安装依赖

```bash
cd server
npm install axios cheerio
```

### 运行单个爬虫

```bash
node crawlers/gov-crawler.js
```

### 定时任务

使用 `node-cron` 设置定时爬取：

```javascript
const cron = require('node-cron');

// 每天凌晨2点执行
cron.schedule('0 2 * * *', () => {
  console.log('开始定时爬取...');
  // 执行爬虫
});
```

## 爬虫规范

### 1. 遵守 robots.txt

每个爬虫都应该检查目标网站的 robots.txt 文件。

### 2. 请求频率控制

- 请求间隔至少 1 秒
- 使用随机延迟避免被识别
- 设置合理的超时时间

### 3. User-Agent 设置

使用真实的浏览器 User-Agent：

```javascript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

### 4. 错误处理

- 记录所有错误到日志
- 失败重试机制（最多3次）
- 优雅降级

### 5. 数据清洗

- 去除HTML标签
- 统一日期格式
- 提取关键信息

## 数据存储

爬取的数据存储到 MongoDB：

```javascript
const Resource = require('../models/Resource');

await Resource.create({
  title: '...',
  summary: '...',
  content: '...',
  category: 'law',
  source: '中国政府网',
  sourceUrl: '...',
  publishTime: new Date(),
  tags: ['...']
});
```

## 监控和日志

### 爬取日志

```javascript
const CrawlLog = require('../models/CrawlLog');

await CrawlLog.create({
  crawler: 'gov-crawler',
  status: 'success',
  itemsCount: 10,
  duration: 5000,
  errors: []
});
```

### 性能指标

- 爬取成功率
- 平均响应时间
- 数据质量评分

## 注意事项

1. **法律合规**：确保爬取行为符合相关法律法规
2. **版权尊重**：标注资源来源，不侵犯版权
3. **服务器负载**：避免对目标服务器造成过大压力
4. **数据更新**：定期检查和更新爬虫逻辑

## API 对接

对于提供官方 API 的平台，优先使用 API 而非爬虫：

- 国家政务服务平台 API
- 农业大数据平台 API
- 开放数据 API

## 故障排查

### 爬虫失败

1. 检查网络连接
2. 验证目标网站是否可访问
3. 检查网站结构是否变化
4. 查看错误日志

### 数据质量问题

1. 检查数据清洗逻辑
2. 验证字段映射
3. 人工抽查样本

## 联系方式

如有问题，请联系开发团队。
