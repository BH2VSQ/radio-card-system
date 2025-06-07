const mongoose = require('mongoose');

const CertificateTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['eyeball', 'achievement', 'award', 'other'],
    default: 'eyeball'
  },
  templateHtml: {
    type: String,
    required: true
  },
  templateCss: {
    type: String
  },
  previewImageUrl: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  supportedFields: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'date', 'image', 'signature', 'list', 'boolean'],
      default: 'text'
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: String
    },
    placeholder: {
      type: String
    }
  }],
  paperSize: {
    type: String,
    enum: ['A4', 'Letter', 'A3', 'Legal', 'Custom'],
    default: 'A4'
  },
  orientation: {
    type: String,
    enum: ['portrait', 'landscape'],
    default: 'landscape'
  },
  customWidth: {
    type: Number
  },
  customHeight: {
    type: Number
  },
  margins: {
    top: {
      type: Number,
      default: 10
    },
    right: {
      type: Number,
      default: 10
    },
    bottom: {
      type: Number,
      default: 10
    },
    left: {
      type: Number,
      default: 10
    }
  }
}, {
  timestamps: true
});

// 创建索引
CertificateTemplateSchema.index({ type: 1 });
CertificateTemplateSchema.index({ isDefault: 1 });
CertificateTemplateSchema.index({ userId: 1 });

module.exports = mongoose.model('CertificateTemplate', CertificateTemplateSchema);

