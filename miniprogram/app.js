App({
  globalData: {
    pendingCategory: null // 用于跨页面传递分类信息
  },

  onLaunch() {
    this.checkUpdate();
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
