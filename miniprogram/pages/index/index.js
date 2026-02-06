const app = getApp();

Page({
  data: {
    banners: [
      { 
        id: 1, 
        title: '乡村振兴', 
        desc: '助力农业现代化发展',
        emoji: '🌾',
        color1: '#2E7D32',
        color2: '#66BB6A'
      },
      { 
        id: 2, 
        title: '政策解读', 
        desc: '最新涉农政策一手掌握',
        emoji: '📋',
        color1: '#FFB74D',
        color2: '#FFA726'
      },
      { 
        id: 3, 
        title: '农技推广', 
        desc: '科学种植 增产增收',
        emoji: '🌱',
        color1: '#66BB6A',
        color2: '#81C784'
      }
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
    console.log('首页加载');
    this.loadHotResources();
    this.loadLatestPolicies();
  },

  // 加载热门资源
  loadHotResources() {
    wx.request({
      url: `${app.globalData.apiUrl}/api/resources`,
      data: {
        page: 1,
        pageSize: 5
      },
      timeout: 15000,
      success: (res) => {
        console.log('热门资源返回:', res.data);
        if (res.data && res.data.code === 0 && res.data.data.list && res.data.data.list.length > 0) {
          this.setData({
            hotResources: res.data.data.list.map(item => ({
              ...item,
              category: this.getCategoryName(item.category)
            })),
            loading: false
          });
        } else {
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('加载热门资源失败:', err);
        this.setData({ loading: false });
      }
    });
  },

  // 加载最新政策
  loadLatestPolicies() {
    wx.request({
      url: `${app.globalData.apiUrl}/api/resources`,
      data: {
        category: 'policy',
        page: 1,
        pageSize: 5
      },
      timeout: 15000,
      success: (res) => {
        console.log('最新政策返回:', res.data);
        if (res.data && res.data.code === 0 && res.data.data.list && res.data.data.list.length > 0) {
          this.setData({
            latestPolicies: res.data.data.list.map(item => ({
              ...item,
              category: this.getCategoryName(item.category)
            }))
          });
        }
      },
      fail: (err) => {
        console.error('加载最新政策失败:', err);
      }
    });
  },

  getCategoryName(category) {
    const map = {
      'law': '法律法规',
      'policy': '政策文件',
      'tech': '农技手册',
      'culture': '乡土文献'
    };
    return map[category] || category;
  },

  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  navigateTo(e) {
    const dataset = e.currentTarget.dataset;
    const isTab = dataset.istab;
    const category = dataset.category;
    
    if (isTab && category) {
      // 跳转到 tabBar 页面（分类页）
      // 先存储要切换的分类到全局数据
      app.globalData.pendingCategory = category;
      
      wx.switchTab({
        url: '/pages/category/category',
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    } else {
      const url = dataset.url;
      if (url) {
        wx.navigateTo({ 
          url: url,
          fail: (err) => {
            console.error('跳转失败:', err);
            wx.showToast({ title: '页面跳转失败', icon: 'none' });
          }
        });
      }
    }
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${id}`,
        fail: (err) => {
          console.error('跳转失败:', err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    } else {
      wx.showToast({ title: '资源ID不存在', icon: 'none' });
    }
  },

  viewMore(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/category/category?type=${type}`
    });
  }
});
