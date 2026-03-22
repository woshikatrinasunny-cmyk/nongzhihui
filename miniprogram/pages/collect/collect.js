const localData = require('../../utils/local-data.js');

Page({
  data: {
    favorites: [],
    loading: false
  },

  onShow() {
    this.loadFavorites();
  },

  onPullDownRefresh() {
    this.loadFavorites();
    wx.stopPullDownRefresh();
  },

  loadFavorites() {
    this.setData({ loading: true });
    const favorites = localData.getCollectedResources().map(r => ({
      ...r,
      categoryName: localData.CATEGORY_MAP[r.category] || r.category
    }));
    this.setData({ favorites, loading: false });
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: '我的收藏 - 农智汇',
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
