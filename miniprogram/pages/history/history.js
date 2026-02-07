const localData = require('../../utils/local-data.js');

Page({
  data: {
    historyList: [],
    loading: false
  },

  onShow() {
    this.setData({ historyList: localData.getHistory() });
  },

  onPullDownRefresh() {
    this.setData({ historyList: localData.getHistory() });
    wx.stopPullDownRefresh();
  },

  clearHistory() {
    wx.showModal({
      title: '提示', content: '确定清空所有浏览历史？',
      success: (res) => {
        if (res.confirm) {
          localData.clearHistory();
          this.setData({ historyList: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  }
});
