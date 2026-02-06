const express = require('express');
const router = express.Router();

// 内存存储反馈
const feedbackStore = [];

// 提交反馈
router.post('/add', async (req, res) => {
  try {
    const { userId, content, contact } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ code: -1, message: '参数不完整' });
    }

    const feedback = {
      _id: Date.now(),
      userId,
      content,
      contact,
      createdAt: new Date()
    };

    feedbackStore.unshift(feedback);

    res.json({ code: 0, message: '提交成功', data: feedback });
  } catch (error) {
    res.status(500).json({ code: -1, message: '提交失败', error: error.message });
  }
});

// 获取用户反馈列表
router.get('/list', async (req, res) => {
  try {
    const { userId, page = 1, pageSize = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ code: -1, message: '请先登录' });
    }

    const userFeedback = feedbackStore.filter(f => f.userId === userId);
    const skip = (page - 1) * pageSize;
    const list = userFeedback.slice(skip, skip + parseInt(pageSize));

    res.json({
      code: 0,
      data: {
        list,
        total: userFeedback.length,
        hasMore: skip + list.length < userFeedback.length
      }
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

module.exports = router;
