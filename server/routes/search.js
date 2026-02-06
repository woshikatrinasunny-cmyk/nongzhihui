const express = require('express');
const router = express.Router();
const webSearch = require('../services/web-search');
const aggregator = require('../services/aggregator');

// 搜索接口 - 使用真实网络搜索
router.get('/', async (req, res) => {
  try {
    const { 
      keyword, 
      category,
      sortBy = 'relevance',
      page = 1, 
      pageSize = 10
    } = req.query;
    
    if (!keyword) {
      return res.json({
        code: 0,
        data: { list: [], total: 0, hasMore: false }
      });
    }

    console.log('[搜索路由] 关键词:', keyword, '分类:', category);

    // 同时搜索网络和本地
    const [webResult, localResult] = await Promise.allSettled([
      webSearch.search(keyword, { category, page: parseInt(page), pageSize: parseInt(pageSize) }),
      aggregator.searchLocal(keyword, { category, sortBy, page: parseInt(page), pageSize: parseInt(pageSize) })
    ]);

    // 合并结果：网络结果优先
    let list = [];
    let total = 0;

    if (webResult.status === 'fulfilled' && webResult.value.list.length > 0) {
      list = list.concat(webResult.value.list);
      total += webResult.value.total;
      console.log('[搜索路由] 网络搜索返回', webResult.value.list.length, '条');
    }

    if (localResult.status === 'fulfilled' && localResult.value.list.length > 0) {
      list = list.concat(localResult.value.list);
      total += localResult.value.total;
      console.log('[搜索路由] 本地搜索返回', localResult.value.list.length, '条');
    }

    // 去重
    const seen = new Set();
    list = list.filter(item => {
      const key = item.title.substring(0, 20);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 分页
    const finalList = list.slice(0, parseInt(pageSize));

    console.log('[搜索路由] 最终返回', finalList.length, '条结果');

    res.json({
      code: 0,
      data: {
        list: finalList,
        total: list.length,
        hasMore: list.length > parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('[搜索路由] 搜索失败:', error);
    res.status(500).json({
      code: -1,
      message: '搜索失败',
      error: error.message
    });
  }
});

// 仅搜索本地资源
router.get('/local', async (req, res) => {
  try {
    const { keyword, category, sortBy = 'relevance', page = 1, pageSize = 20 } = req.query;
    
    if (!keyword) {
      return res.json({ code: 0, data: { list: [], total: 0 } });
    }
    
    const result = await aggregator.searchLocal(keyword, {
      category, sortBy, page: parseInt(page), pageSize: parseInt(pageSize)
    });
    
    res.json({
      code: 0,
      data: {
        list: result.list,
        total: result.total,
        hasMore: (page * pageSize) < result.total
      }
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '搜索失败', error: error.message });
  }
});

// 获取热门搜索关键词
router.get('/hot', async (req, res) => {
  try {
    res.json({
      code: 0,
      data: [
        { id: 1, keyword: '农村土地承包法' },
        { id: 2, keyword: '乡村振兴政策' },
        { id: 3, keyword: '农业补贴' },
        { id: 4, keyword: '种植技术' },
        { id: 5, keyword: '农产品质量安全' }
      ]
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

module.exports = router;
