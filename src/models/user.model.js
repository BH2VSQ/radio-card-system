const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必填项'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [50, '用户名不能超过50个字符']
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少需要6个字符'],
    select: false
  },
  fullName: {
    type: String,
    trim: true
  },
  callsign: {
    type: String,
    trim: true
  },
  qth: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // 默认呼号档案ID
  defaultCallsignProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallsignProfile',
    default: null
  },
  // 系统初始化标志
  isInitialized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 加密密码
UserSchema.pre('save', async function(next) {
  // 只有在密码被修改时才重新加密
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 生成JWT令牌
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// 验证密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

