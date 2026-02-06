const express = require('express');
const router = express.Router();
const aggregator = require('../services/aggregator');

// 获取平台统计数据
router.get('/platform', async (req, res) => {
  try {
    const allData = aggregator.getAllMockData();

    const categoryStats = {};
    let totalViews = 0;
    let totalCollects = 0;

    allData.forEach(item => {
      const cat = item.category || 'other';
      if (!categoryStats[cat]) categoryStats[cat] = 0;
      categoryStats[cat]++;
      totalViews += item.viewCount || 0;
      totalCollects += item.collectCount || 0;
    });

    res.json({
      code: 0,
      data: {
        totalResources: allData.length,
        totalViews,
        totalCollects,
        categoryStats: Object.entries(categoryStats).map(([k, v]) => ({ _id: k, count: v }))
      }
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

// 获取热门标签
router.get('/hot-tags', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const allData = aggregator.getAllMockData();

    const tagCount = {};
    allData.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    res.json({ code: 0, data: tags });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

// 获取用户统计
router.get('/user/:userId', async (req, res) => {
  try {
    res.json({
      code: 0,
      data: {
        collectCount: 0,
        historyCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

// 获取趋势数据
router.get('/trends', async (req, res) => {
  try {
    const allData = aggregator.getAllMockData();
    const dailyStats = {};

    allData.forEach(item => {
      const date = new Date(item.publishTime).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    const result = Object.entries(dailyStats)
      .map(([date, count]) => ({ _id: date, count }))
      .sort((a, b) => a._id.localeCompare(b._id));

    res.json({ code: 0, data: result });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

module.exports = router;
