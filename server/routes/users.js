const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 内存存储用户
const userStore = new Map();

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ code: -1, message: '缺少登录code' });
    }

    // 使用测试用户（无数据库模式）
    const testUser = {
      openid: 'test_user_' + Date.now(),
      nickName: '测试用户',
      avatarUrl: 'https://via.placeholder.com/100'
    };

    userStore.set(testUser.openid, testUser);

    const token = jwt.sign(
      { openid: testUser.openid },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        userInfo: testUser
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: -1, message: '登录失败', error: error.message });
  }
});

// 更新用户信息
router.post('/update', async (req, res) => {
  try {
    const { openid, nickName, avatarUrl } = req.body;

    if (!openid) {
      return res.status(400).json({ code: -1, message: '缺少用户标识' });
    }

    const user = userStore.get(openid) || { openid };
    if (nickName) user.nickName = nickName;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    userStore.set(openid, user);

    res.json({ code: 0, message: '更新成功', data: user });
  } catch (error) {
    res.status(500).json({ code: -1, message: '更新失败', error: error.message });
  }
});

// 获取用户信息
router.get('/info', async (req, res) => {
  try {
    const { openid } = req.query;

    if (!openid) {
      return res.status(400).json({ code: -1, message: '缺少用户标识' });
    }

    const user = userStore.get(openid);
    if (!user) {
      return res.status(404).json({ code: -1, message: '用户不存在' });
    }

    res.json({ code: 0, data: user });
  } catch (error) {
    res.status(500).json({ code: -1, message: '获取失败', error: error.message });
  }
});

module.exports = router;
