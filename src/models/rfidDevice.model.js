const mongoose = require('mongoose');

const RfidDeviceSchema = new mongoose.Schema({
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
  deviceType: {
    type: String,
    enum: ['USB', 'Bluetooth', 'Network', 'Serial', 'Other'],
    default: 'USB'
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  connectionInfo: {
    port: {
      type: String,
      trim: true
    },
    baudRate: {
      type: Number
    },
    ipAddress: {
      type: String,
      trim: true
    },
    port: {
      type: Number
    },
    macAddress: {
      type: String,
      trim: true
    },
    other: {
      type: String,
      trim: true
    }
  },
  supportedCardTypes: [{
    type: String,
    enum: ['MIFARE Classic', 'MIFARE Ultralight', 'NTAG213', 'NTAG215', 'NTAG216', 'Other'],
    default: 'Other'
  }],
  isConnected: {
    type: Boolean,
    default: false
  },
  lastConnected: {
    type: Date
  },
  lastDisconnected: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'maintenance'],
    default: 'inactive'
  },
  firmwareVersion: {
    type: String,
    trim: true
  },
  settings: {
    readTimeout: {
      type: Number,
      default: 5000
    },
    writeTimeout: {
      type: Number,
      default: 5000
    },
    autoReconnect: {
      type: Boolean,
      default: true
    },
    beepOnSuccess: {
      type: Boolean,
      default: true
    },
    beepOnError: {
      type: Boolean,
      default: true
    },
    ledOnSuccess: {
      type: Boolean,
      default: true
    },
    ledOnError: {
      type: Boolean,
      default: true
    },
    customSettings: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// 创建索引
RfidDeviceSchema.index({ userId: 1, name: 1 });
RfidDeviceSchema.index({ userId: 1, isConnected: 1 });
RfidDeviceSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('RfidDevice', RfidDeviceSchema);

