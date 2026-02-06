const app = getApp();
const { get, delete: del } = require('../../utils/request.js');

Page({
  data: {
    historyList: [],
    loading: false,
    fixedUserId: 'test_user'
  },

  onShow() {
    this.fetchHistory();
  },

  onPullDownRefresh() {
    this.fetchHistory();
  },

  fetchHistory() {
    this.setData({ loading: true });
    
    get('/api/history/list', {
      userId: this.data.fixedUserId,
      page: 1,
      pageSize: 50
    })
      .then(res => {
        this.setData({ historyList: res.data.list });
      })
      .catch(err => {
        console.error('加载历史记录失败：', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      });
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空所有浏览历史？',
      success: (res) => {
        if (res.confirm) {
          del('/history/clear', { userId: this.data.fixedUserId })
            .then(() => {
              this.setData({ historyList: [] });
              wx.showToast({ title: '已清空', icon: 'success' });
            })
            .catch(() => {
              wx.showToast({ title: '清空失败', icon: 'none' });
            });
        }
      }
    });
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});