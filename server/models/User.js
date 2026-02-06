const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickName: {
    type: String,
    default: '微信用户'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  gender: {
    type: Number,
    default: 0
  },
  country: {
    type: String,
    default: ''
  },
  province: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'zh_CN'
  },
  lastLoginTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
