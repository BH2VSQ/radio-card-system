const mongoose = require('mongoose');

// 卡片编号计数器模型
const CardCounterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  receivedCount: {
    type: Number,
    default: 0
  },
  sentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const CardCounter = mongoose.model('CardCounter', CardCounterSchema);

const CardSchema = new mongoose.Schema({
  // 卡片编号（自动生成）
  cardNumber: {
    type: String,
    unique: true,
    index: true
  },
  // 关联的呼号档案
  callsignProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallsignProfile',
    required: true,
    index: true
  },
  // 卡片类型
  cardType: {
    type: String,
    enum: ['received', 'sent'],
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

// 生成卡片编号的函数
async function generateCardNumber(cardType) {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // 获取年份后两位
  
  // 查找或创建当年的计数器
  let counter = await CardCounter.findOne({ year: currentYear });
  if (!counter) {
    counter = new CardCounter({ year: currentYear });
  }
  
  // 根据卡片类型递增计数器
  let sequenceNumber;
  if (cardType === 'received') {
    counter.receivedCount += 1;
    sequenceNumber = counter.receivedCount;
  } else {
    counter.sentCount += 1;
    sequenceNumber = counter.sentCount;
  }
  
  await counter.save();
  
  // 生成序号（6位，不足补0）
  const paddedSequence = sequenceNumber.toString().padStart(6, '0');
  
  // 生成类型标识
  const typeCode = cardType === 'received' ? 'RC' : 'TC';
  
  // 生成16位随机16进制编码
  const randomHex = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  // 组合最终编号
  return `${yearSuffix}${paddedSequence}${typeCode}${randomHex}`;
}

// 保存前自动生成卡片编号
CardSchema.pre('save', async function(next) {
  if (this.isNew && !this.cardNumber) {
    try {
      this.cardNumber = await generateCardNumber(this.cardType);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// 创建索引
CardSchema.index({ location: '2dsphere' });
CardSchema.index({ callsign: 1 });
CardSchema.index({ contactDate: -1 });
CardSchema.index({ callsignProfile: 1 });
CardSchema.index({ cardType: 1 });
CardSchema.index({ 'rfidTag.uid': 1 });
CardSchema.index({ 'eyeballInfo.isEyeball': 1 });
CardSchema.index({ 'eyeballInfo.meetingDate': 1 });
CardSchema.index({ 'eyeballInfo.meetingType': 1 });
CardSchema.index({ contactType: 1 });
CardSchema.index({ sentCard: 1 });

module.exports = mongoose.model('Card', CardSchema);

