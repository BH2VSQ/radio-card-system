const crypto = require('crypto');
const User = require('../models/user.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    注册新用户
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, callsign, qth } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(createError(400, '用户名或电子邮箱已被注册'));
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      callsign,
      qth
    });

    // 生成令牌
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 返回响应
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    用户登录
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return next(createError(400, '请提供用户名和密码'));
    }

    // 查找用户
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    }).select('+password');

    if (!user) {
      return next(createError(401, '无效的凭据'));
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return next(createError(401, '账号已被禁用，请联系管理员'));
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(createError(401, '无效的凭据'));
    }

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 返回响应
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    用户登出
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        message: '登出成功'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取当前用户信息
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    刷新令牌
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError(400, '请提供刷新令牌'));
    }

    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(createError(401, '无效的刷新令牌'));
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return next(createError(401, '账号已被禁用，请联系管理员'));
    }

    // 生成新令牌
    const token = user.getSignedJwtToken();
    const newRefreshToken = user.getRefreshToken();

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createError(401, '无效的刷新令牌'));
    }
    next(error);
  }
};

/**
 * @desc    忘记密码
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError(400, '请提供电子邮箱地址'));
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, '没有与该电子邮箱关联的用户'));
    }

    // 生成重置令牌
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: 发送重置密码邮件
    // 由于邮件发送功能需要额外配置，这里仅返回重置令牌
    // 实际应用中应该发送邮件，而不是直接返回令牌

    res.status(200).json({
      success: true,
      data: {
        message: '重置密码邮件已发送',
        resetToken // 实际应用中不应返回此字段
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    重置密码
 * @route   PUT /api/auth/reset-password/:resetToken
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    if (!password) {
      return next(createError(400, '请提供新密码'));
    }

    // 加密重置令牌
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 查找用户
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(createError(400, '无效或已过期的重置令牌'));
    }

    // 设置新密码
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // 返回响应
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * 发送令牌响应
 * @param {Object} user - 用户对象
 * @param {number} statusCode - HTTP状态码
 * @param {Object} res - 响应对象
 */
const sendTokenResponse = (user, statusCode, res) => {
  // 生成令牌
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  // 用户数据
  const userData = {
    id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    callsign: user.callsign,
    qth: user.qth,
    role: user.role,
    avatar: user.avatar,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(statusCode).json({
    success: true,
    data: {
      token,
      refreshToken,
      user: userData
    }
  });
};

