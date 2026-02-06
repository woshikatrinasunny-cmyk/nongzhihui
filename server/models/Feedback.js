const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  contact: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved'],
    default: 'pending',
    index: true
  },
  reply: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
