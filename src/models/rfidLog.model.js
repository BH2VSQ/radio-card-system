const mongoose = require('mongoose');

const RfidLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RfidDevice',
    required: true
  },
  operationType: {
    type: String,
    enum: ['read', 'write', 'link', 'unlink', 'connect', 'disconnect', 'error'],
    required: true
  },
  tagUid: {
    type: String,
    trim: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  sentCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SentCard'
  },
  status: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  message: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建索引
RfidLogSchema.index({ userId: 1, timestamp: -1 });
RfidLogSchema.index({ deviceId: 1, timestamp: -1 });
RfidLogSchema.index({ tagUid: 1, timestamp: -1 });
RfidLogSchema.index({ cardId: 1, timestamp: -1 });
RfidLogSchema.index({ sentCardId: 1, timestamp: -1 });
RfidLogSchema.index({ operationType: 1, status: 1 });

module.exports = mongoose.model('RfidLog', RfidLogSchema);

