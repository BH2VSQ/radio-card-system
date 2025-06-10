const CallsignProfile = require('../models/callsignProfile.model');
const databaseManager = require('../utils/databaseManager');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    获取用户的所有呼号档案
// @route   GET /api/callsign-profiles
// @access  Private
exports.getCallsignProfiles = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  const profiles = await CallsignProfile.getActiveCallsigns(req.user.id);

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
});

// @desc    获取单个呼号档案
// @route   GET /api/callsign-profiles/:id
// @access  Private
exports.getCallsignProfile = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  const profile = await CallsignProfile.findOne({
    _id: req.params.id,
    userId: req.user.id,
    isActive: true
  });

  if (!profile) {
    return next(new ErrorResponse('呼号档案不存在', 404));
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    创建呼号档案
// @route   POST /api/callsign-profiles
// @access  Private
exports.createCallsignProfile = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  // 添加用户ID到请求体
  req.body.userId = req.user.id;

  // 检查呼号是否已存在
  const existingProfile = await CallsignProfile.findOne({
    userId: req.user.id,
    callsignName: req.body.callsignName.toUpperCase(),
    isActive: true
  });

  if (existingProfile) {
    return next(new ErrorResponse('该呼号档案已存在', 400));
  }

  // 如果这是用户的第一个呼号档案，自动设为默认
  const profileCount = await CallsignProfile.countDocuments({
    userId: req.user.id,
    isActive: true
  });

  if (profileCount === 0) {
    req.body.isDefault = true;
  }

  const profile = await CallsignProfile.create(req.body);

  // 如果设置为默认呼号，更新用户模型
  if (profile.isDefault) {
    const User = databaseManager.getMainConnection().model('User');
    await User.findByIdAndUpdate(req.user.id, {
      defaultCallsignProfile: profile._id
    });
  }

  res.status(201).json({
    success: true,
    data: profile
  });
});

// @desc    更新呼号档案
// @route   PUT /api/callsign-profiles/:id
// @access  Private
exports.updateCallsignProfile = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  let profile = await CallsignProfile.findOne({
    _id: req.params.id,
    userId: req.user.id,
    isActive: true
  });

  if (!profile) {
    return next(new ErrorResponse('呼号档案不存在', 404));
  }

  // 如果更新呼号名称，检查是否重复
  if (req.body.callsignName && req.body.callsignName !== profile.callsignName) {
    const existingProfile = await CallsignProfile.findOne({
      userId: req.user.id,
      callsignName: req.body.callsignName.toUpperCase(),
      isActive: true,
      _id: { $ne: req.params.id }
    });

    if (existingProfile) {
      return next(new ErrorResponse('该呼号档案已存在', 400));
    }
  }

  profile = await CallsignProfile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // 如果设置为默认呼号，更新用户模型
  if (profile.isDefault) {
    const User = databaseManager.getMainConnection().model('User');
    await User.findByIdAndUpdate(req.user.id, {
      defaultCallsignProfile: profile._id
    });
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    删除呼号档案
// @route   DELETE /api/callsign-profiles/:id
// @access  Private
exports.deleteCallsignProfile = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  const profile = await CallsignProfile.findOne({
    _id: req.params.id,
    userId: req.user.id,
    isActive: true
  });

  if (!profile) {
    return next(new ErrorResponse('呼号档案不存在', 404));
  }

  // 检查是否有关联的卡片
  const Card = userConnection.model('Card');
  const cardCount = await Card.countDocuments({
    callsignProfile: req.params.id
  });

  if (cardCount > 0) {
    return next(new ErrorResponse('无法删除有关联卡片的呼号档案，请先处理相关卡片', 400));
  }

  // 软删除：设置为非活跃状态
  profile.isActive = false;
  await profile.save();

  // 如果删除的是默认呼号，需要设置新的默认呼号
  if (profile.isDefault) {
    const newDefaultProfile = await CallsignProfile.findOne({
      userId: req.user.id,
      isActive: true,
      _id: { $ne: req.params.id }
    }).sort({ createdAt: 1 });

    if (newDefaultProfile) {
      newDefaultProfile.isDefault = true;
      await newDefaultProfile.save();

      // 更新用户模型
      const User = databaseManager.getMainConnection().model('User');
      await User.findByIdAndUpdate(req.user.id, {
        defaultCallsignProfile: newDefaultProfile._id
      });
    } else {
      // 如果没有其他呼号档案，清除用户的默认呼号
      const User = databaseManager.getMainConnection().model('User');
      await User.findByIdAndUpdate(req.user.id, {
        defaultCallsignProfile: null
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    设置默认呼号档案
// @route   PUT /api/callsign-profiles/:id/set-default
// @access  Private
exports.setDefaultCallsignProfile = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  const profile = await CallsignProfile.findOne({
    _id: req.params.id,
    userId: req.user.id,
    isActive: true
  });

  if (!profile) {
    return next(new ErrorResponse('呼号档案不存在', 404));
  }

  // 将其他呼号档案的默认状态设为false
  await CallsignProfile.updateMany(
    { userId: req.user.id, _id: { $ne: req.params.id } },
    { isDefault: false }
  );

  // 设置当前呼号档案为默认
  profile.isDefault = true;
  await profile.save();

  // 更新用户模型
  const User = databaseManager.getMainConnection().model('User');
  await User.findByIdAndUpdate(req.user.id, {
    defaultCallsignProfile: profile._id
  });

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    获取默认呼号档案
// @route   GET /api/callsign-profiles/default
// @access  Private
exports.getDefaultCallsignProfile = asyncHandler(async (req, res, next) => {
  const userConnection = await databaseManager.getUserConnection(req.user.userDatabaseName);
  const CallsignProfile = userConnection.model('CallsignProfile');

  const profile = await CallsignProfile.getDefaultCallsign(req.user.id);

  if (!profile) {
    return next(new ErrorResponse('未找到默认呼号档案', 404));
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

