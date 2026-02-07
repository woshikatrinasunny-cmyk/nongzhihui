const localData = require('../../utils/local-data.js');
const api = require('../../utils/api.js');

Page({
  data: {
    resourceId: '',
    resource: null,
    isCollected: false,
    relatedResources: [],
    isWebResource: false
  },

  onLoad(options) {
    const id = options.id || '';
    this.setData({ resourceId: id });
    if (!id) return;

    // 先尝试从后端获取（含正文抓取），失败则用本地数据
    api.getResourceById(id).then(({ resource, isWeb }) => {
      if (!resource) return;
      this.setData({
        resource,
        isCollected: localData.isCollected(id),
        isWebResource: isWeb
      });
      wx.setNavigationBarTitle({ title: resource.title });
      localData.addHistory(resource);

      // 加载相关推荐
      if (isWeb) {
        api.getRelatedResources(id).then(list => {
          this.setData({ relatedResources: list });
        });
      } else {
        this.setData({ relatedResources: localData.getRelatedResources(resource, 5) });
      }
    });
  },

  toggleCollect() {
    const { resourceId } = this.data;
    if (!resourceId) return;
    const collected = localData.toggleCollect(resourceId);
    this.setData({ isCollected: collected });
    wx.showToast({ title: collected ? '收藏成功' : '已取消收藏', icon: 'success' });
  },

  shareResource() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
  },

  onShareAppMessage() {
    return {
      title: this.data.resource?.title || '农智汇资源',
      path: `/pages/detail/detail?id=${this.data.resourceId}`
    };
  },

  viewSource() {
    const url = this.data.resource?.sourceUrl;
    if (!url) return wx.showToast({ title: '暂无原文链接', icon: 'none' });
    wx.setClipboardData({ data: url, success: () => wx.showToast({ title: '链接已复制', icon: 'success' }) });
  },

  searchTag(e) {
    const tag = e.currentTarget.dataset.tag;
    if (tag) wx.navigateTo({ url: `/pages/search/search?keyword=${encodeURIComponent(tag)}` });
  },

  viewRelated(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.redirectTo({ url: `/pages/detail/detail?id=${id}` });
  }
});
