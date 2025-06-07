const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  type: {
    type: String,
    enum: ['eyeball', 'achievement', 'award', 'other'],
    default: 'eyeball'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  templateId: {
    type: String,
    required: true
  },
  data: {
    callsign: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      trim: true
    },
    eventName: {
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
      }
    }],
    verificationMethod: {
      type: String,
      trim: true
    },
    additionalInfo: {
      type: String,
      trim: true
    },
    customFields: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  }
}, {
  timestamps: true
});

// 创建索引
CertificateSchema.index({ userId: 1, cardId: 1 });
CertificateSchema.index({ userId: 1, type: 1 });
CertificateSchema.index({ userId: 1, 'data.callsign': 1 });
CertificateSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Certificate', CertificateSchema);

