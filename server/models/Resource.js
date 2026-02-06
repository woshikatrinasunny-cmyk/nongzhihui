const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['law', 'policy', 'tech', 'culture'],
    index: true
  },
  source: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String
  },
  tags: [{
    type: String,
    index: true
  }],
  attachments: [{
    name: String,
    url: String,
    size: String
  }],
  publishTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  collectCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  }
}, {
  timestamps: true
});

// 全文搜索索引
resourceSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
