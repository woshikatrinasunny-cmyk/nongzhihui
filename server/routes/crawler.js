const express = require('express');
const router = express.Router();

// 获取爬虫状态（无数据库模式下返回禁用状态）
router.get('/status', async (req, res) => {
  res.json({
    code: 0,
    data: {
      enabled: false,
      message: '无数据库模式下爬虫已禁用',
      lastRun: null
    }
  });
});

// 获取爬虫日志
router.get('/logs', async (req, res) => {
  res.json({
    code: 0,
    data: { list: [], total: 0 }
  });
});

module.exports = router;
