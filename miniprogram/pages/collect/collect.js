const app = getApp();
// 新增：引入封装的请求工具（仅加这一行）
const { get } = require('../../utils/request.js');

Page({
  data: {
    favorites: [],
    loading: false
  },

  onShow() {
    this.fetchFavorites();
  },

  // 监听下拉刷新动作（原有功能完全保留）
  onPullDownRefresh() {
    this.fetchFavorites();
  },

  fetchFavorites() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    // 改动1：替换原有wx.request为封装的get工具，修正接口地址为/collect/list
    get('/api/collect/list', {
      userId: userInfo.nickName // 保留你原有的传参方式
    }).then(res => {
      // 改动2：适配后端返回格式，取res.data.list（原有赋值逻辑保留）
      this.setData({ favorites: res.data.list });
    }).catch(() => {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
      wx.stopPullDownRefresh(); // 停止下拉刷新动画（原有功能保留）
    });
  },

  // 核心增补：跳转到文章详情页（原有功能完全保留）
  viewDetail(e) {
    const id = e.currentTarget.dataset.id; // 从 wxml 的 data-id 获取
    if (!id) return;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});