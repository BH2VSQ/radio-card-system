const mongoose = require('mongoose');

const CallsignAssociationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  operatorName: {
    type: String,
    required: true,
    trim: true
  },
  callsigns: [{
    callsign: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    region: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  primaryCallsign: {
    type: String,
    trim: true
  },
  contactInfo: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    social: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// 创建索引
CallsignAssociationSchema.index({ userId: 1, operatorName: 1 });
CallsignAssociationSchema.index({ userId: 1, 'callsigns.callsign': 1 });
CallsignAssociationSchema.index({ userId: 1, primaryCallsign: 1 });

module.exports = mongoose.model('CallsignAssociation', CallsignAssociationSchema);

