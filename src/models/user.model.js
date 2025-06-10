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
  email: {
    type: String,
    required: [true, '电子邮箱是必填项'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的电子邮箱地址']
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
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // 新增字段：用户专属数据库名称
  userDatabaseName: {
    type: String,
    unique: true,
    sparse: true
  },
  // 新增字段：默认呼号档案ID
  defaultCallsignProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallsignProfile',
    default: null
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

// 生成用户专属数据库名称
UserSchema.pre('save', async function(next) {
  if (this.isNew && !this.userDatabaseName) {
    this.userDatabaseName = `radio_card_user_${this._id}`;
  }
  next();
});

// 生成JWT令牌
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, userDb: this.userDatabaseName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// 生成刷新令牌
UserSchema.methods.getRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

// 验证密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成重置密码令牌
UserSchema.methods.getResetPasswordToken = function() {
  // 生成令牌
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 加密令牌并设置到resetPasswordToken字段
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 设置过期时间（1小时）
  this.resetPasswordExpire = Date.now() + 3600000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);

