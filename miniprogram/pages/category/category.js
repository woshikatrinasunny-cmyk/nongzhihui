const app = getApp();

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
    hasMore: true
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ currentCategory: options.type });
    }
    this.loadResources();
  },

  onShow() {
    // 检查是否有待切换的分类
    if (app.globalData.pendingCategory) {
      const category = app.globalData.pendingCategory;
      app.globalData.pendingCategory = null; // 清除标记
      
      if (category !== this.data.currentCategory) {
        this.setData({
          currentCategory: category,
          page: 1,
          resourceList: []
        });
        this.loadResources();
      }
    }
  },

  // 供外部调用的方法，用于切换分类
  selectCategoryByType(type) {
    if (type && type !== this.data.currentCategory) {
      this.setData({
        currentCategory: type,
        page: 1,
        resourceList: []
      });
      this.loadResources();
    }
  },

  loadResources() {
    wx.showLoading({ title: '加载中...' });
    
    wx.request({
      url: `${app.globalData.apiUrl}/api/resources`,
      data: {
        category: this.data.currentCategory,
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      timeout: 15000,
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 0) {
          const list = res.data.data.list || [];
          const newList = this.data.page === 1 ? list : [...this.data.resourceList, ...list];
          this.setData({
            resourceList: newList,
            hasMore: res.data.data.hasMore || false
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      }
    });
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category,
      page: 1,
      resourceList: []
    });
    this.loadResources();
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
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
