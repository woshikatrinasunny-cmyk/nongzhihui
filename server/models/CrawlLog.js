const mongoose = require('mongoose');

const crawlLogSchema = new mongoose.Schema({
  crawler: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['running', 'success', 'failed', 'partial'],
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // 毫秒
  },
  itemsCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failedCount: {
    type: Number,
    default: 0
  },
  errors: [{
    url: String,
    message: String,
    timestamp: Date
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// 索引
crawlLogSchema.index({ startTime: -1 });
crawlLogSchema.index({ crawler: 1, status: 1 });

module.exports = mongoose.model('CrawlLog', crawlLogSchema);
