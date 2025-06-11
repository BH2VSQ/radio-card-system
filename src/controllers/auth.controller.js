const User = require('../models/user.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    系统初始化
 * @route   POST /api/auth/initialize
 * @access  Public
 */
exports.initialize = async (req, res, next) => {
  try {
    const { username, password, fullName, callsign } = req.body;

    // 检查系统是否已初始化
    const existingUser = await User.findOne({});
    if (existingUser) {
      return next(createError(400, '系统已经初始化，请直接登录'));
    }

    // 创建管理员用户
    const user = await User.create({
      username,
      password,
      fullName,
      callsign,
      isInitialized: true
    });

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
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return next(createError(401, '无效的凭据'));
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return next(createError(401, '账号已被禁用'));
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
    const user = await User.findById(req.user.id).populate('defaultCallsignProfile');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    检查系统初始化状态
 * @route   GET /api/auth/init-status
 * @access  Public
 */
exports.getInitStatus = async (req, res, next) => {
  try {
    const user = await User.findOne({});
    const isInitialized = !!user;

    res.status(200).json({
      success: true,
      data: {
        isInitialized
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新用户信息
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, callsign } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, callsign },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    修改密码
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError(400, '请提供当前密码和新密码'));
    }

    // 查找用户
    const user = await User.findById(req.user.id).select('+password');

    // 验证当前密码
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(createError(400, '当前密码不正确'));
    }

    // 设置新密码
    user.password = newPassword;
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

  // 用户数据
  const userData = {
    id: user._id,
    username: user.username,
    fullName: user.fullName,
    callsign: user.callsign,
    qth: user.qth,
    lastLogin: user.lastLogin,
    defaultCallsignProfile: user.defaultCallsignProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(statusCode).json({
    success: true,
    data: {
      token,
      user: userData
    }
  });
};

