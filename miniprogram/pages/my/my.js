Page({
  data: {
    menuItems: [
      { id: 'collect', name: '我的收藏', emoji: '⭐', url: '/pages/collect/collect' },
      { id: 'history', name: '浏览历史', emoji: '🕒', url: '/pages/history/history' },
      { id: 'feedback', name: '意见反馈', emoji: '💬', url: '/pages/feedback/feedback' },
      { id: 'about', name: '关于我们', emoji: 'ℹ️', url: '/pages/about/about' }
    ]
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('跳转失败:', err);
      }
    });
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: '农智汇 - 涉农知识聚合平台',
      path: '/pages/index/index',
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '农智汇 - 涉农知识聚合平台',
      query: '',
      imageUrl: ''
    };
  }
});
