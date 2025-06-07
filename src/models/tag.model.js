const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#1890ff'
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 创建索引
TagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema);

