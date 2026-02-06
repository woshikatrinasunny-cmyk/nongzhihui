const express = require('express');
const router = express.Router();

// 内存存储浏览历史
const historyStore = new Map();

// 添加浏览历史
router.post('/add', async (req, res) => {
  try {
    const { userId, resourceId } = req.body;

    if (!userId || !resourceId) {
      return res.status(400).json({ code: -1, message: '参数不完整' });
    }

    if (!historyStore.has(userId)) {
      historyStore.set(userId, []);
    }

    const userHistory = historyStore.get(userId);
    // 移除已有记录（去重）
    const idx = userHistory.findIndex(h => h.resourceId === resourceId);
    if (idx !== -1) userHistory.splice(idx, 1);
    // 添加到最前面
    userHistory.unshift({ resourceId, viewTime: new Date() });
    // 最多保留100条
    if (userHistory.length > 100) userHistory.length = 100;

    res.json({ code: 0, message: '记录成功' });
  } catch (error) {
    console.error('添加历史记录失败:', error);
    res.status(500).json({ code: -1, message: '服务器错误', error: error.message });
  }
});

// 获取浏览历史列表
router.get('/list', async (req, res) => {
  try {
    const { userId, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ code: -1, message: '请先登录' });
    }

    const userHistory = historyStore.get(userId) || [];
    const skip = (page - 1) * pageSize;
    const list = userHistory.slice(skip, skip + parseInt(pageSize));

    res.json({
      code: 0,
      data: {
        list,
        total: userHistory.length,
        hasMore: skip + list.length < userHistory.length
      }
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取列表失败', error: error.message });
  }
});

// 清空浏览历史
router.delete('/clear', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) historyStore.delete(userId);
    res.json({ code: 0, message: '清空成功' });
  } catch (error) {
    res.status(500).json({ code: -1, message: '清空失败', error: error.message });
  }
});

module.exports = router;
