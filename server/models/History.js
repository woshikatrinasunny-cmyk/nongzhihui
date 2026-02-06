const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// 复合索引，用于查询和去重
historySchema.index({ userId: 1, resourceId: 1 });
historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
