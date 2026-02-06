Page({
  data: {
    appInfo: {
      name: '农智汇',
      version: '1.0.0',
      description: '开源涉农知识聚合平台',
      features: [
        '智能检索涉农法律、政策、技术资源',
        '整合多平台涉农知识资源',
        '基于用户需求的智能推荐',
        '多端适配便捷访问'
      ]
    },
    contact: {
      email: 'support@nongzhihui.com',
      phone: '400-xxx-xxxx',
      wechat: 'nongzhihui_official'
    }
  },

  copyContact(e) {
    const text = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  previewQRCode() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});
