const CallsignProfile = require('../models/callsignProfile.model');
const User = require('../models/user.model');
const asyncHandler = require('../middleware/async');
const { createError } = require('../utils/error.util');

// @desc    获取所有呼号档案
// @route   GET /api/callsign-profiles
// @access  Private
exports.getCallsignProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await CallsignProfile.find({
    isActive: true
  }).sort({ createdAt: -1 });

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
  const profile = await CallsignProfile.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!profile) {
    return next(createError(404, '呼号档案不存在'));
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
  // 检查呼号是否已存在
  const existingProfile = await CallsignProfile.findOne({
    callsignName: req.body.callsignName.toUpperCase(),
    isActive: true
  });

  if (existingProfile) {
    return next(createError(400, '该呼号档案已存在'));
  }

  // 如果这是第一个呼号档案，自动设为默认
  const profileCount = await CallsignProfile.countDocuments({
    isActive: true
  });

  if (profileCount === 0) {
    req.body.isDefault = true;
  }

  const profile = await CallsignProfile.create(req.body);

  // 如果设置为默认呼号，更新用户模型
  if (profile.isDefault) {
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
  let profile = await CallsignProfile.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!profile) {
    return next(createError(404, '呼号档案不存在'));
  }

  // 如果更新呼号名称，检查是否重复
  if (req.body.callsignName && req.body.callsignName !== profile.callsignName) {
    const existingProfile = await CallsignProfile.findOne({
      callsignName: req.body.callsignName.toUpperCase(),
      isActive: true,
      _id: { $ne: req.params.id }
    });

    if (existingProfile) {
      return next(createError(400, '该呼号档案已存在'));
    }
  }

  profile = await CallsignProfile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // 如果设置为默认呼号，更新用户模型
  if (profile.isDefault) {
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
  const profile = await CallsignProfile.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!profile) {
    return next(createError(404, '呼号档案不存在'));
  }

  // 检查是否有关联的卡片
  const Card = require('../models/card.model');
  const cardCount = await Card.countDocuments({
    callsignProfile: req.params.id
  });

  if (cardCount > 0) {
    return next(createError(400, '无法删除有关联卡片的呼号档案，请先处理相关卡片'));
  }

  // 软删除：设置为非活跃状态
  profile.isActive = false;
  await profile.save();

  // 如果删除的是默认呼号，需要设置新的默认呼号
  if (profile.isDefault) {
    const newDefaultProfile = await CallsignProfile.findOne({
      isActive: true,
      _id: { $ne: req.params.id }
    }).sort({ createdAt: 1 });

    if (newDefaultProfile) {
      newDefaultProfile.isDefault = true;
      await newDefaultProfile.save();

      // 更新用户模型
      await User.findByIdAndUpdate(req.user.id, {
        defaultCallsignProfile: newDefaultProfile._id
      });
    } else {
      // 如果没有其他呼号档案，清除用户的默认呼号
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
  const profile = await CallsignProfile.findOne({
    _id: req.params.id,
    isActive: true
  });

  if (!profile) {
    return next(createError(404, '呼号档案不存在'));
  }

  // 将其他呼号档案的默认状态设为false
  await CallsignProfile.updateMany(
    { _id: { $ne: req.params.id } },
    { isDefault: false }
  );

  // 设置当前呼号档案为默认
  profile.isDefault = true;
  await profile.save();

  // 更新用户模型
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
  const profile = await CallsignProfile.findOne({
    isDefault: true,
    isActive: true
  });

  if (!profile) {
    return next(createError(404, '未找到默认呼号档案'));
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

