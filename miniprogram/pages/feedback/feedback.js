const app = getApp();
const { post } = require('../../utils/request.js');

Page({
  data: {
    content: '',
    contact: '',
    loading: false,
    fixedUserId: 'test_user'
  },

  onInputContent(e) {
    this.setData({ content: e.detail.value });
  },

  onInputContact(e) {
    this.setData({ contact: e.detail.value });
  },

  submitFeedback() {
    if (!this.data.content.trim()) {
      return wx.showToast({ title: '请输入反馈内容', icon: 'none' });
    }

    this.setData({ loading: true });
    
    post('/api/feedback/add', {
      userId: this.data.fixedUserId,
      content: this.data.content,
      contact: this.data.contact
    })
      .then(() => {
        wx.showToast({ title: '提交成功，感谢反馈', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      })
      .catch(() => {
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  }
});
