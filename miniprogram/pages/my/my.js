const app = getApp();

Page({
  data: {
    userInfo: null,
    hasLogin: false,
    menuItems: [
      { id: 'collect', name: '我的收藏', emoji: '⭐', url: '/pages/collect/collect' },
      { id: 'history', name: '浏览历史', emoji: '🕒', url: '/pages/history/history' },
      { id: 'feedback', name: '意见反馈', emoji: '💬', url: '/pages/feedback/feedback' },
      { id: 'about', name: '关于我们', emoji: 'ℹ️', url: '/pages/about/about' }
    ]
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = app.globalData.userInfo;
    const token = app.globalData.token;
    
    this.setData({
      userInfo: userInfo,
      hasLogin: !!(userInfo && token)
    });
  },

  // 点击头像登录
  getUserProfile() {
    // 先进行微信登录获取 openid
    app.wxLogin()
      .then(() => {
        // 登录成功后获取用户信息
        return app.getUserProfile();
      })
      .then((userInfo) => {
        this.setData({
          userInfo: userInfo,
          hasLogin: true
        });
        wx.showToast({ title: '登录成功', icon: 'success' });
      })
      .catch((err) => {
        console.error('登录失败:', err);
        wx.showToast({ title: '登录失败', icon: 'none' });
      });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({
            userInfo: null,
            hasLogin: false
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  // pages/my/my.js
  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    
    // 某些页面需要登录
    const needLoginPages = ['/pages/collect/collect', '/pages/history/history'];
    
    if (needLoginPages.includes(url) && !this.data.hasLogin) {
      wx.showModal({
        title: '提示',
        content: '该功能需要登录后使用',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            this.getUserProfile();
          }
        }
      });
      return;
    }
    
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error("跳转失败:", err);
      }
    });
  },

});
