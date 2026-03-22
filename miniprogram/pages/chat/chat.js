var api = require('../../utils/api.js');

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToId: '',
    sessionId: '',
    thinkingText: '正在思考...'
  },

  onLoad: function() {
    var sid = 'mp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    this.setData({
      sessionId: sid,
      messages: [{
        id: 'welcome',
        isUser: false,
        content: '你好！我是农智汇·耒阳方言农业智能助手 👋\n\n我经过耒阳方言语料和本地涉农政策数据的微调训练，可以帮你：\n\n🌱 解答农业种植技术问题\n📋 查询耒阳最新惠农政策\n🫒 油茶种植与加工指导\n💰 农业补贴和贷款贴息咨询\n🗣️ 用耒阳方言和你聊天\n\n有么子要问的，尽管讲！',
        time: this.getTime()
      }]
    });
  },

  getTime: function() {
    var d = new Date();
    var h = d.getHours().toString();
    var m = d.getMinutes().toString();
    if (h.length < 2) h = '0' + h;
    if (m.length < 2) m = '0' + m;
    return h + ':' + m;
  },

  onInput: function(e) {
    this.setData({ inputValue: e.detail.value });
  },

  sendMessage: function() {
    var msg = this.data.inputValue.trim();
    if (!msg || this.data.loading) return;

    var that = this;
    var msgId = 'msg_' + Date.now();
    var userMsg = {
      id: msgId,
      isUser: true,
      content: msg,
      time: this.getTime()
    };

    var messages = this.data.messages.concat([userMsg]);
    this.setData({
      messages: messages,
      inputValue: '',
      loading: true,
      scrollToId: 'msg-' + msgId
    });

    wx.request({
      url: api.API_BASE + '/api/chat/send',
      method: 'POST',
      data: {
        message: msg,
        sessionId: that.data.sessionId
      },
      timeout: 60000,
      success: function(res) {
        var reply = '抱歉，暂时无法回答，请稍后再试。';
        if (res.data && res.data.data && res.data.data.reply) {
          reply = res.data.data.reply;
          if (res.data.data.sessionId) {
            that.setData({ sessionId: res.data.data.sessionId });
          }
        }
        var replyId = 'msg_' + Date.now();
        var botMsg = {
          id: replyId,
          isUser: false,
          content: reply,
          time: that.getTime()
        };
        that.setData({
          messages: that.data.messages.concat([botMsg]),
          loading: false,
          scrollToId: 'msg-' + replyId
        });
      },
      fail: function() {
        var replyId = 'msg_' + Date.now();
        var botMsg = {
          id: replyId,
          isUser: false,
          content: '网络连接出现问题，请稍后再试。',
          time: that.getTime()
        };
        that.setData({
          messages: that.data.messages.concat([botMsg]),
          loading: false,
          scrollToId: 'msg-' + replyId
        });
      }
    });
  },

  quickAsk: function(e) {
    var q = e.currentTarget.dataset.q;
    this.setData({ inputValue: q });
    this.sendMessage();
  },

  clearChat: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清除所有对话记录？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: api.API_BASE + '/api/chat/clear',
            method: 'POST',
            data: { sessionId: that.data.sessionId }
          });
          var sid = 'mp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          that.setData({
            sessionId: sid,
            messages: [{
              id: 'welcome2',
              isUser: false,
              content: '对话已清除，有么子要问的，尽管讲！',
              time: that.getTime()
            }]
          });
        }
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: '耒阳方言农业智能助手 - 农智汇',
      path: '/pages/chat/chat'
    };
  },

  onShareTimeline: function() {
    return {
      title: '耒阳方言农业智能助手 - 农智汇',
      query: ''
    };
  }
});
