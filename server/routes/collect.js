const express = require('express');
const router = express.Router();

// 内存存储收藏
const collectStore = new Map();

// 切换收藏状态
router.post('/toggle', async (req, res) => {
  try {
    const { userId, resourceId } = req.body;

    if (!userId || !resourceId) {
      return res.status(400).json({ code: -1, message: '参数不完整' });
    }

    if (!collectStore.has(userId)) {
      collectStore.set(userId, []);
    }

    const userCollects = collectStore.get(userId);
    const idx = userCollects.findIndex(c => String(c.resourceId) === String(resourceId));

    if (idx !== -1) {
      // 取消收藏
      userCollects.splice(idx, 1);
      res.json({ code: 0, message: '已取消收藏', data: { isCollected: false } });
    } else {
      // 添加收藏
      userCollects.unshift({ resourceId, createdAt: new Date() });
      res.json({ code: 0, message: '收藏成功', data: { isCollected: true } });
    }
  } catch (error) {
    console.error('收藏切换失败:', error);
    res.status(500).json({ code: -1, message: '服务器错误', error: error.message });
  }
});

// 获取收藏列表
router.get('/list', async (req, res) => {
  try {
    const { userId, page = 1, pageSize = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ code: -1, message: '请先登录' });
    }

    const userCollects = collectStore.get(userId) || [];
    const skip = (page - 1) * pageSize;
    const list = userCollects.slice(skip, skip + parseInt(pageSize));

    res.json({
      code: 0,
      data: {
        list,
        total: userCollects.length,
        hasMore: skip + list.length < userCollects.length
      }
    });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取列表失败', error: error.message });
  }
});

// 检查收藏状态
router.get('/check', async (req, res) => {
  try {
    const { userId, resourceId } = req.query;
    const userCollects = collectStore.get(userId) || [];
    const isCollected = userCollects.some(c => String(c.resourceId) === String(resourceId));
    res.json({ code: 0, data: { isCollected } });
  } catch (error) {
    res.status(500).json({ code: -1, message: '检查失败', error: error.message });
  }
});

module.exports = router;
