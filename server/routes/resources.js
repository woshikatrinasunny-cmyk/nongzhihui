const express = require('express');
const router = express.Router();
const webSearch = require('../services/web-search');

// 分类对应的搜索关键词
const categoryKeywords = {
  'law': '涉农法律法规',
  'policy': '农业政策文件',
  'tech': '农业技术推广',
  'culture': '乡土文化文献'
};

// 内存缓存已获取的资源（用于详情页查找）
const resourceCache = new Map();

// 预加载缓存标记
let preloaded = false;

function cacheResources(list) {
  list.forEach(item => {
    if (item._id) {
      resourceCache.set(String(item._id), item);
    }
  });
}

// 带超时的搜索封装
async function searchWithTimeout(keyword, options, timeoutMs = 10000) {
  return Promise.race([
    webSearch.search(keyword, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('搜索超时')), timeoutMs))
  ]);
}

// 服务器启动时预加载首页数据
async function preloadData() {
  if (preloaded) return;
  preloaded = true;
  console.log('[预加载] 开始预加载首页数据...');
  try {
    await Promise.allSettled([
      webSearch.search('涉农热门政策法规', { pageSize: 10 }),
      webSearch.search('农业最新政策', { category: 'policy', pageSize: 10 }),
      webSearch.search('涉农法律法规', { category: 'law', pageSize: 20 }),
      webSearch.search('农业政策文件', { category: 'policy', pageSize: 20 })
    ]);
    console.log('[预加载] 首页数据预加载完成');
  } catch (e) {
    console.error('[预加载] 预加载失败:', e.message);
  }
}

// 启动预加载
setTimeout(preloadData, 1000);

// 获取热门资源
router.get('/hot', async (req, res) => {
  try {
    const result = await searchWithTimeout('涉农热门政策法规', { pageSize: 10 });
    cacheResources(result.list);
    res.json({ code: 0, data: result.list.slice(0, 10) });
  } catch (error) {
    console.error('[热门资源] 失败:', error.message);
    res.json({ code: 0, data: [] });
  }
});

// 获取最新资源
router.get('/latest', async (req, res) => {
  try {
    const { category } = req.query;
    const keyword = category ? categoryKeywords[category] || '农业最新政策' : '农业最新政策';
    const result = await searchWithTimeout(keyword, { category, pageSize: 10 });
    cacheResources(result.list);
    res.json({ code: 0, data: result.list.slice(0, 10) });
  } catch (error) {
    console.error('[最新资源] 失败:', error.message);
    res.json({ code: 0, data: [] });
  }
});

// 获取资源列表（首页 + 分类页用）
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 20 } = req.query;
    const keyword = category ? categoryKeywords[category] || '涉农资源' : '涉农法律政策';
    
    console.log('[资源列表] 关键词:', keyword, '分类:', category, '页码:', page);

    const result = await searchWithTimeout(keyword, {
      category,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    cacheResources(result.list);

    console.log('[资源列表] 返回', result.list.length, '条');

    res.json({
      code: 0,
      data: {
        list: result.list,
        total: result.total,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('[资源列表] 失败:', error.message);
    res.json({
      code: 0,
      data: { list: [], total: 0, hasMore: false }
    });
  }
});

// 获取资源详情
router.get('/:id', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = resourceCache.get(String(resourceId));
    
    if (!resource) {
      return res.status(404).json({ code: -1, message: '资源不存在，请返回重试' });
    }
    
    res.json({ code: 0, data: resource });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

// 获取相关资源
router.get('/:id/related', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = resourceCache.get(String(resourceId));
    
    if (!resource) {
      return res.json({ code: 0, data: [] });
    }
    
    const keyword = categoryKeywords[resource.category] || resource.tags?.[0] || '涉农资源';
    const result = await searchWithTimeout(keyword, { category: resource.category, pageSize: 6 }, 8000);
    const related = result.list.filter(item => String(item._id) !== String(resourceId)).slice(0, 5);
    cacheResources(related);

    res.json({ code: 0, data: related });
  } catch (error) {
    console.error('[相关资源] 失败:', error.message);
    res.json({ code: 0, data: [] });
  }
});

module.exports = router;
