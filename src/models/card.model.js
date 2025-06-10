const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 新增字段：关联的呼号档案
  callsignProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallsignProfile',
    required: true,
    index: true
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
  eyeballInfo: {
    isEyeball: {
      type: Boolean,
      default: false,
      index: true
    },
    meetingType: {
      type: String,
      enum: ['hamfest', 'convention', 'club_meeting', 'personal_visit', 'field_day', 'contest', 'other'],
      trim: true
    },
    meetingLocation: {
      type: String,
      trim: true
    },
    meetingDate: {
      type: Date
    },
    meetingName: {
      type: String,
      trim: true
    },
    witnesses: [{
      name: {
        type: String,
        trim: true
      },
      callsign: {
        type: String,
        trim: true
      },
      contact: {
        type: String,
        trim: true
      }
    }],
    verificationMethod: {
      type: String,
      enum: ['in_person', 'photo', 'video', 'third_party', 'other'],
      default: 'in_person'
    },
    verificationDetails: {
      type: String
    },
    verificationMedia: [{
      type: String // 存储照片或视频的URL
    }]
  },
  sentCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SentCard',
    default: null
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
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引
CardSchema.index({ location: '2dsphere' });
CardSchema.index({ userId: 1, callsign: 1 });
CardSchema.index({ userId: 1, contactDate: -1 });
CardSchema.index({ userId: 1, callsignProfile: 1 });
CardSchema.index({ 'rfidTag.uid': 1 });
CardSchema.index({ 'eyeballInfo.isEyeball': 1 });
CardSchema.index({ 'eyeballInfo.meetingDate': 1 });
CardSchema.index({ 'eyeballInfo.meetingType': 1 });
CardSchema.index({ contactType: 1 });
CardSchema.index({ sentCard: 1 });

module.exports = mongoose.model('Card', CardSchema);

