const localData = require('../../utils/local-data.js');

Page({
  data: {
    content: '',
    contact: '',
    loading: false
  },

  onInputContent(e) { this.setData({ content: e.detail.value }); },
  onInputContact(e) { this.setData({ contact: e.detail.value }); },

  submitFeedback() {
    if (!this.data.content.trim()) {
      return wx.showToast({ title: '请输入反馈内容', icon: 'none' });
    }
    localData.submitFeedback(this.data.content, this.data.contact);
    wx.showToast({ title: '提交成功，感谢反馈', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 1500);
  }
});
