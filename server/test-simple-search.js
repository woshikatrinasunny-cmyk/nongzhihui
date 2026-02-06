/**
 * 简单搜索测试 - 直接测试路由
 */

const express = require('express');
const aggregator = require('./services/aggregator');

const app = express();

// 简单的搜索路由
app.get('/test-search', async (req, res) => {
  console.log('收到搜索请求');
  
  try {
    const keyword = req.query.keyword || '农业';
    console.log('搜索关键词:', keyword);
    
    const result = await aggregator.searchLocal(keyword, {
      page: 1,
      pageSize: 10,
      sortBy: 'relevance'
    });
    
    console.log('搜索完成，结果数:', result.total);
    
    res.json({
      code: 0,
      data: {
        list: result.list,
        total: result.total,
        hasMore: false
      }
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      code: -1,
      message: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log(`测试地址: http://localhost:${PORT}/test-search?keyword=农业`);
});
