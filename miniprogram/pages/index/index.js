const localData = require('../../utils/local-data.js');

Page({
  data: {
    banners: [
      { id: 1, title: '乡村振兴', desc: '助力农业现代化发展', emoji: '🌾', color1: '#2E7D32', color2: '#66BB6A' },
      { id: 2, title: '政策解读', desc: '最新涉农政策一手掌握', emoji: '📋', color1: '#FFB74D', color2: '#FFA726' },
      { id: 3, title: '农技推广', desc: '科学种植 增产增收', emoji: '🌱', color1: '#66BB6A', color2: '#81C784' }
    ],
    quickEntries: [
      { id: 1, name: '法律法规', emoji: '⚖️', color1: '#2E7D32', color2: '#43A047', category: 'law', isTab: true },
      { id: 2, name: '政策文件', emoji: '📋', color1: '#FFB74D', color2: '#FFA726', category: 'policy', isTab: true },
      { id: 3, name: '农技手册', emoji: '🌾', color1: '#66BB6A', color2: '#81C784', category: 'tech', isTab: true },
      { id: 4, name: '乡土文献', emoji: '📖', color1: '#FFF59D', color2: '#FFEE58', category: 'culture', isTab: true }
    ],
    hotResources: [],
    latestPolicies: [],
    loading: true
  },

  onLoad() {
    const hot = localData.getHotResources(5).map(r => ({
      ...r, category: localData.CATEGORY_MAP[r.category] || r.category
    }));
    const latest = localData.getLatestPolicies(5).map(r => ({
      ...r, category: localData.CATEGORY_MAP[r.category] || r.category
    }));
    this.setData({ hotResources: hot, latestPolicies: latest, loading: false });
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  navigateTo(e) {
    const { istab, category } = e.currentTarget.dataset;
    if (istab && category) {
      const app = getApp();
      app.globalData.pendingCategory = category;
      wx.switchTab({ url: '/pages/category/category' });
    }
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  viewMore(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({ url: `/pages/category/category?type=${type}` });
  }
});
