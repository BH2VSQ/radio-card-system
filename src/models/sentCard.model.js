const mongoose = require('mongoose');

const SentCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callsign: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  qth: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    index: true
  },
  contactDate: {
    type: Date,
    required: true,
    index: true
  },
  frequency: {
    type: Number,
    required: true
  },
  band: {
    type: String,
    trim: true,
    index: true
  },
  mode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  contactType: {
    type: String,
    enum: ['satellite', 'shortwave', 'repeater', 'direct', 'eyeball_offline', 'eyeball_online', 'other'],
    default: 'shortwave',
    index: true
  },
  rstSent: {
    type: String,
    trim: true
  },
  rstReceived: {
    type: String,
    trim: true
  },
  qslStatus: {
    type: String,
    enum: ['pending', 'sent', 'received', 'confirmed'],
    default: 'pending',
    index: true
  },
  sentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  receivedCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    default: null
  },
  isReceived: {
    type: Boolean,
    default: false,
    index: true
  },
  receivedDate: {
    type: Date
  },
  imageUrls: [{
    type: String
  }],
  qrCode: {
    type: String,
    trim: true,
    index: true
  },
  rfidTag: {
    uid: {
      type: String,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['MIFARE Classic', 'MIFARE Ultralight', 'NTAG213', 'NTAG215', 'NTAG216', 'other'],
      default: 'other'
    },
    lastRead: {
      type: Date
    },
    lastWrite: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lost', 'damaged'],
      default: 'active'
    }
  },
  notes: {
    type: String
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引
SentCardSchema.index({ userId: 1, callsign: 1 });
SentCardSchema.index({ userId: 1, contactDate: -1 });
SentCardSchema.index({ userId: 1, sentDate: -1 });
SentCardSchema.index({ userId: 1, isReceived: 1 });
SentCardSchema.index({ 'rfidTag.uid': 1 });
SentCardSchema.index({ contactType: 1 });
SentCardSchema.index({ receivedCard: 1 });

module.exports = mongoose.model('SentCard', SentCardSchema);

