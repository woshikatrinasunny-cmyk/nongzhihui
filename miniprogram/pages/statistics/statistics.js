const app = getApp();
const { get } = require('../../utils/request.js');

Page({
  data: {
    platformStats: {
      totalResources: 0,
      totalViews: 0,
      totalCollects: 0
    },
    categoryStats: [],
    hotTags: [],
    userStats: {
      collectCount: 0,
      historyCount: 0
    },
    fixedUserId: 'test_user'
  },

  onLoad() {
    this.loadPlatformStats();
    this.loadHotTags();
    this.loadUserStats();
  },

  loadPlatformStats() {
    get('/api/statistics/platform')
      .then(res => {
        this.setData({
          platformStats: res.data,
          categoryStats: res.data.categoryStats || []
        });
      })
      .catch(err => {
        console.error('加载平台统计失败：', err);
      });
  },

  loadHotTags() {
    get('/api/statistics/hot-tags', { limit: 10 })
      .then(res => {
        this.setData({ hotTags: res.data });
      })
      .catch(err => {
        console.error('加载热门标签失败：', err);
      });
  },

  loadUserStats() {
    get(`/api/statistics/user/${this.data.fixedUserId}`)
      .then(res => {
        this.setData({ userStats: res.data });
      })
      .catch(err => {
        console.error('加载用户统计失败：', err);
      });
  },

  getCategoryName(category) {
    const map = {
      law: '法律法规',
      policy: '政策文件',
      tech: '农技手册',
      culture: '乡土文献'
    };
    return map[category] || category;
  },

  searchTag(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(tag)}`
    });
  }
});
