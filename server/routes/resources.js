const express = require('express');
const router = express.Router();
const webSearch = require('../services/web-search');
const recommendation = require('../services/recommendation');
const contentFetcher = require('../services/content-fetcher');

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

// 独立的正文抓取接口
router.get('/fetch-content', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.json({ code: -1, data: { content: '' } });
    }
    const { content, fullTitle } = await contentFetcher.fetch(url);
    res.json({ code: 0, data: { content, fullTitle } });
  } catch (error) {
    console.error('[正文抓取API] 失败:', error.message);
    res.json({ code: -1, data: { content: '' } });
  }
});

// 获取资源详情（含正文抓取）
router.get('/:id', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = resourceCache.get(String(resourceId));
    
    if (!resource) {
      return res.status(404).json({ code: -1, message: '资源不存在，请返回重试' });
    }

    // 如果还没有正文内容，尝试从原始 URL 抓取
    if (!resource.content && resource.sourceUrl) {
      try {
        const { content, fullTitle } = await contentFetcher.fetch(resource.sourceUrl);
        if (content) {
          resource.content = content;
          // 如果抓到了更好的标题，也更新
          if (fullTitle && fullTitle.length > resource.title.length) {
            resource.fullTitle = fullTitle;
          }
          // 更新缓存
          resourceCache.set(String(resourceId), resource);
        }
      } catch (err) {
        console.error('[详情] 正文抓取失败:', err.message);
      }
    }
    
    res.json({ code: 0, data: resource });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

// 获取相关资源（使用推荐服务）
router.get('/:id/related', async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = resourceCache.get(String(resourceId));
    
    if (!resource) {
      return res.json({ code: 0, data: [] });
    }

    // 先尝试从缓存池中用推荐服务计算
    const pool = Array.from(resourceCache.values());
    let related = recommendation.getRecommendations(resource, pool, 6);

    // 如果缓存池推荐不足，补充网络搜索结果
    if (related.length < 3) {
      const keyword = categoryKeywords[resource.category] || resource.tags?.[0] || '涉农资源';
      const result = await searchWithTimeout(keyword, { category: resource.category, pageSize: 10 }, 8000);
      cacheResources(result.list);
      const expandedPool = [...pool, ...result.list];
      related = recommendation.getRecommendations(resource, expandedPool, 6);
    }

    res.json({ code: 0, data: related });
  } catch (error) {
    console.error('[相关资源] 失败:', error.message);
    res.json({ code: 0, data: [] });
  }
});

module.exports = router;
