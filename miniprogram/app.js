App({
  globalData: {
    apiUrl: 'http://localhost:3000',
    userInfo: null,
    token: null,
    openid: null,
    pendingCategory: null // 用于跨页面传递分类信息
  },

  onLaunch() {
    // 检查更新
    this.checkUpdate();
    
    // 尝试自动登录
    this.autoLogin();
  },

  // 自动登录
  autoLogin() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
      console.log('自动登录成功');
    } else {
      console.log('未找到登录信息，需要重新登录');
    }
  },

  // 微信登录（开发模式：使用测试用户）
  wxLogin() {
    return new Promise((resolve, reject) => {
      // 开发环境直接使用测试用户
      const testUser = {
        openid: 'test_user_' + Date.now(),
        nickName: '测试用户',
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
      };

      // 保存到全局和本地
      this.globalData.token = 'test_token_' + Date.now();
      this.globalData.userInfo = testUser;
      this.globalData.openid = testUser.openid;

      wx.setStorageSync('token', this.globalData.token);
      wx.setStorageSync('userInfo', testUser);

      resolve(testUser);
    });
  },

  // 获取用户信息（需要用户授权）
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = {
            ...res.userInfo,
            openid: this.globalData.openid || 'test_user_' + Date.now()
          };

          // 更新本地用户信息
          this.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          
          resolve(userInfo);
        },
        fail: reject
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
  }
});
