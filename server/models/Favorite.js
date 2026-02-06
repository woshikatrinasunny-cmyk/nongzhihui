// server/models/Favorite.js
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String, // 对应微信OpenID，保持不变
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
    index: true // 新增索引，提升关联查询速度
  }
  // 删掉collectTime，用timestamps自动生成，无需手动定义
}, {
  timestamps: true // 核心：开启后自动生成createdAt/updatedAt（Date类型）
});

// 复合唯一索引，防止重复收藏（保持不变）
favoriteSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);