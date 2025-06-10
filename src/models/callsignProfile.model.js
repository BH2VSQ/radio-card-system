const mongoose = require('mongoose');

const CallsignProfileSchema = new mongoose.Schema({
  callsignName: {
    type: String,
    required: [true, '呼号名称是必填项'],
    trim: true,
    uppercase: true,
    index: true
  },
  qth: {
    type: String,
    trim: true
  },
  qslAddress: {
    type: String,
    trim: true
  },
  gridSquare: {
    type: String,
    trim: true,
    uppercase: true
  },
  licenseClass: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  equipment: {
    type: String,
    trim: true
  },
  antenna: {
    type: String,
    trim: true
  },
  power: {
    type: Number,
    min: 0
  },
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
  }
}, {
  timestamps: true
});

// 创建索引
CallsignProfileSchema.index({ callsignName: 1 }, { unique: true });
CallsignProfileSchema.index({ isDefault: 1 });
CallsignProfileSchema.index({ location: '2dsphere' });

// 确保只有一个默认呼号
CallsignProfileSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // 如果设置为默认呼号，将其他呼号的默认状态设为false
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// 静态方法：获取默认呼号
CallsignProfileSchema.statics.getDefaultCallsign = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// 静态方法：获取所有活跃呼号
CallsignProfileSchema.statics.getActiveCallsigns = function() {
  return this.find({ isActive: true }).sort({ isDefault: -1, callsignName: 1 });
};

module.exports = mongoose.model('CallsignProfile', CallsignProfileSchema);

