const app = getApp();
const localData = require('../../utils/local-data.js');

Page({
  data: {
    categories: [
      { id: 'law', name: '法律法规', emoji: '⚖️', color: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)' },
      { id: 'policy', name: '政策文件', emoji: '📋', color: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)' },
      { id: 'tech', name: '农技手册', emoji: '🌾', color: 'linear-gradient(135deg, #66BB6A 0%, #81C784 100%)' },
      { id: 'culture', name: '乡土文献', emoji: '📖', color: 'linear-gradient(135deg, #FFF59D 0%, #FFEE58 100%)' }
    ],
    currentCategory: 'law',
    resourceList: [],
    page: 1,
    pageSize: 20,
    hasMore: false
  },

  onLoad(options) {
    if (options.type) this.setData({ currentCategory: options.type });
    this.loadResources();
  },

  onShow() {
    if (app.globalData.pendingCategory) {
      const category = app.globalData.pendingCategory;
      app.globalData.pendingCategory = null;
      if (category !== this.data.currentCategory) {
        this.setData({ currentCategory: category, page: 1, resourceList: [] });
        this.loadResources();
      }
    }
  },

  loadResources() {
    const result = localData.getResources({
      category: this.data.currentCategory,
      page: this.data.page,
      pageSize: this.data.pageSize
    });
    const newList = this.data.page === 1 ? result.list : [...this.data.resourceList, ...result.list];
    this.setData({ resourceList: newList, hasMore: result.hasMore });
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category, page: 1, resourceList: [] });
    this.loadResources();
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadResources();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, resourceList: [] });
    this.loadResources();
    wx.stopPullDownRefresh();
  }
});
