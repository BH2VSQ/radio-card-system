const Card = require('../models/card.model');
const { createError } = require('../utils/error.util');
const fs = require('fs');
const path = require('path');

/**
 * @desc    创建EYEBALL卡
 * @route   POST /api/eyeball-cards
 * @access  Private
 */
exports.createEyeballCard = async (req, res, next) => {
  try {
    // 确保eyeballInfo.isEyeball为true
    if (req.body.eyeballInfo) {
      req.body.eyeballInfo.isEyeball = true;
    } else {
      req.body.eyeballInfo = { isEyeball: true };
    }

    // 创建新卡片
    const card = new Card({
      ...req.body,
      userId: req.user.id
    });

    // 保存卡片
    await card.save();

    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    将普通卡片转换为EYEBALL卡
 * @route   POST /api/eyeball-cards/:id/convert-to-eyeball
 * @access  Private
 */
exports.convertToEyeball = async (req, res, next) => {
  try {
    // 查找卡片
    const card = await Card.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!card) {
      return next(createError(404, '卡片不存在'));
    }

    // 确保eyeballInfo.isEyeball为true
    if (req.body.eyeballInfo) {
      req.body.eyeballInfo.isEyeball = true;
    } else {
      req.body.eyeballInfo = { isEyeball: true };
    }

    // 更新卡片
    card.eyeballInfo = req.body.eyeballInfo;
    await card.save();

    res.status(200).json({
      success: true,
      data: {
        id: card._id,
        callsign: card.callsign,
        eyeballInfo: card.eyeballInfo,
        updatedAt: card.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新EYEBALL卡信息
 * @route   PUT /api/eyeball-cards/:id
 * @access  Private
 */
exports.updateEyeballInfo = async (req, res, next) => {
  try {
    // 查找卡片
    const card = await Card.findOne({ 
      _id: req.params.id, 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    });
    
    if (!card) {
      return next(createError(404, 'EYEBALL卡不存在'));
    }

    // 确保eyeballInfo.isEyeball为true
    if (req.body.eyeballInfo) {
      req.body.eyeballInfo.isEyeball = true;
    } else {
      return next(createError(400, '缺少eyeballInfo字段'));
    }

    // 保留原有的verificationMedia
    req.body.eyeballInfo.verificationMedia = card.eyeballInfo.verificationMedia || [];

    // 更新卡片
    card.eyeballInfo = req.body.eyeballInfo;
    await card.save();

    res.status(200).json({
      success: true,
      data: {
        id: card._id,
        eyeballInfo: card.eyeballInfo,
        updatedAt: card.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    上传EYEBALL卡验证媒体
 * @route   POST /api/eyeball-cards/:id/media
 * @access  Private
 */
exports.uploadEyeballMedia = async (req, res, next) => {
  try {
    // 查找卡片
    const card = await Card.findOne({ 
      _id: req.params.id, 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    });
    
    if (!card) {
      // 删除上传的文件
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return next(createError(404, 'EYEBALL卡不存在'));
    }

    // 处理上传的文件
    if (!req.files || req.files.length === 0) {
      return next(createError(400, '未上传文件'));
    }

    // 初始化verificationMedia数组（如果不存在）
    if (!card.eyeballInfo.verificationMedia) {
      card.eyeballInfo.verificationMedia = [];
    }

    // 添加文件路径到verificationMedia数组
    req.files.forEach(file => {
      const mediaUrl = `/uploads/eyeball/${file.filename}`;
      card.eyeballInfo.verificationMedia.push(mediaUrl);
    });

    // 保存卡片
    await card.save();

    res.status(200).json({
      success: true,
      data: {
        id: card._id,
        eyeballInfo: {
          verificationMedia: card.eyeballInfo.verificationMedia
        },
        updatedAt: card.updatedAt
      }
    });
  } catch (error) {
    // 删除上传的文件
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    next(error);
  }
};

/**
 * @desc    删除EYEBALL卡验证媒体
 * @route   DELETE /api/eyeball-cards/:id/media/:mediaIndex
 * @access  Private
 */
exports.deleteEyeballMedia = async (req, res, next) => {
  try {
    // 查找卡片
    const card = await Card.findOne({ 
      _id: req.params.id, 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    });
    
    if (!card) {
      return next(createError(404, 'EYEBALL卡不存在'));
    }

    // 检查媒体索引是否有效
    const mediaIndex = parseInt(req.params.mediaIndex);
    if (isNaN(mediaIndex) || mediaIndex < 0 || !card.eyeballInfo.verificationMedia || mediaIndex >= card.eyeballInfo.verificationMedia.length) {
      return next(createError(400, '无效的媒体索引'));
    }

    // 获取要删除的媒体路径
    const mediaPath = card.eyeballInfo.verificationMedia[mediaIndex];
    
    // 从数组中删除媒体路径
    card.eyeballInfo.verificationMedia.splice(mediaIndex, 1);
    
    // 保存卡片
    await card.save();

    // 尝试删除文件（如果存在）
    try {
      const fullPath = path.join(__dirname, '../../', mediaPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error('删除文件失败:', err);
    }

    res.status(200).json({
      success: true,
      data: {
        message: '验证媒体删除成功',
        eyeballInfo: {
          verificationMedia: card.eyeballInfo.verificationMedia
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取EYEBALL卡列表
 * @route   GET /api/eyeball-cards
 * @access  Private
 */
exports.getEyeballCards = async (req, res, next) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = { 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    };

    // 添加筛选条件
    if (req.query.callsign) {
      query.callsign = { $regex: req.query.callsign, $options: 'i' };
    }
    if (req.query.country) {
      query.country = { $regex: req.query.country, $options: 'i' };
    }
    if (req.query.meetingType) {
      query['eyeballInfo.meetingType'] = req.query.meetingType;
    }
    if (req.query.verificationMethod) {
      query['eyeballInfo.verificationMethod'] = req.query.verificationMethod;
    }
    if (req.query.startDate && req.query.endDate) {
      query['eyeballInfo.meetingDate'] = { 
        $gte: new Date(req.query.startDate), 
        $lte: new Date(req.query.endDate) 
      };
    } else if (req.query.startDate) {
      query['eyeballInfo.meetingDate'] = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query['eyeballInfo.meetingDate'] = { $lte: new Date(req.query.endDate) };
    }

    // 搜索关键词
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      query.$or = [
        { callsign: searchRegex },
        { name: searchRegex },
        { country: searchRegex },
        { 'eyeballInfo.meetingName': searchRegex },
        { 'eyeballInfo.meetingLocation': searchRegex }
      ];
    }

    // 排序
    const sortField = req.query.sort || 'eyeballInfo.meetingDate';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // 执行查询
    const cards = await Card.find(query)
      .select('callsign name country contactDate eyeballInfo createdAt')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // 获取总数
    const total = await Card.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cards,
      meta: {
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取EYEBALL卡统计
 * @route   GET /api/eyeball-cards/stats
 * @access  Private
 */
exports.getEyeballCardStats = async (req, res, next) => {
  try {
    // 获取总数
    const total = await Card.countDocuments({ 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    });

    // 按国家统计
    const byCountry = await Card.aggregate([
      { 
        $match: { 
          userId: req.user.id,
          'eyeballInfo.isEyeball': true 
        } 
      },
      { 
        $group: { 
          _id: '$country', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          country: '$_id', 
          count: 1, 
          _id: 0 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // 按会面类型统计
    const byMeetingType = await Card.aggregate([
      { 
        $match: { 
          userId: req.user.id,
          'eyeballInfo.isEyeball': true 
        } 
      },
      { 
        $group: { 
          _id: '$eyeballInfo.meetingType', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          type: '$_id', 
          count: 1, 
          _id: 0 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // 按验证方式统计
    const byVerificationMethod = await Card.aggregate([
      { 
        $match: { 
          userId: req.user.id,
          'eyeballInfo.isEyeball': true 
        } 
      },
      { 
        $group: { 
          _id: '$eyeballInfo.verificationMethod', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          method: '$_id', 
          count: 1, 
          _id: 0 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // 按年份统计
    const byYear = await Card.aggregate([
      { 
        $match: { 
          userId: req.user.id,
          'eyeballInfo.isEyeball': true 
        } 
      },
      { 
        $group: { 
          _id: { $year: '$eyeballInfo.meetingDate' }, 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          year: { $toString: '$_id' }, 
          count: 1, 
          _id: 0 
        } 
      },
      { $sort: { year: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        byCountry,
        byMeetingType,
        byVerificationMethod,
        byYear
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    生成EYEBALL卡证书
 * @route   GET /api/eyeball-cards/:id/certificate
 * @access  Private
 */
exports.generateEyeballCertificate = async (req, res, next) => {
  try {
    // 查找卡片
    const card = await Card.findOne({ 
      _id: req.params.id, 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    });
    
    if (!card) {
      return next(createError(404, 'EYEBALL卡不存在'));
    }

    // 获取证书参数
    const template = req.query.template || 'standard';
    const includeWitnesses = req.query.includeWitnesses !== 'false';
    const includeMedia = req.query.includeMedia !== 'false';
    const language = req.query.language || 'en';

    // TODO: 实现证书生成逻辑
    // 这里需要使用PDF生成库（如PDFKit）来生成证书
    // 由于实现较为复杂，这里仅返回成功消息

    res.status(200).json({
      success: true,
      data: {
        message: '证书生成功能尚未实现',
        card: {
          id: card._id,
          callsign: card.callsign,
          name: card.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    批量导出EYEBALL卡
 * @route   GET /api/eyeball-cards/export
 * @access  Private
 */
exports.exportEyeballCards = async (req, res, next) => {
  try {
    // 获取导出参数
    const format = req.query.format || 'excel';
    const includeMedia = req.query.includeMedia === 'true';
    const includeWitnesses = req.query.includeWitnesses !== 'false';
    
    // 解析筛选条件
    let filter = {};
    if (req.query.filter) {
      try {
        filter = JSON.parse(req.query.filter);
      } catch (err) {
        return next(createError(400, '无效的筛选条件格式'));
      }
    }

    // 构建查询条件
    const query = { 
      userId: req.user.id,
      'eyeballInfo.isEyeball': true 
    };

    // 添加筛选条件
    if (filter.callsign) {
      query.callsign = { $regex: filter.callsign, $options: 'i' };
    }
    if (filter.country) {
      query.country = { $regex: filter.country, $options: 'i' };
    }
    if (filter.meetingType) {
      query['eyeballInfo.meetingType'] = filter.meetingType;
    }
    if (filter.verificationMethod) {
      query['eyeballInfo.verificationMethod'] = filter.verificationMethod;
    }
    if (filter.startDate && filter.endDate) {
      query['eyeballInfo.meetingDate'] = { 
        $gte: new Date(filter.startDate), 
        $lte: new Date(filter.endDate) 
      };
    } else if (filter.startDate) {
      query['eyeballInfo.meetingDate'] = { $gte: new Date(filter.startDate) };
    } else if (filter.endDate) {
      query['eyeballInfo.meetingDate'] = { $lte: new Date(filter.endDate) };
    }

    // 执行查询
    const cards = await Card.find(query);

    // TODO: 实现导出逻辑
    // 这里需要根据format参数生成不同格式的文件
    // 由于实现较为复杂，这里仅返回成功消息

    res.status(200).json({
      success: true,
      data: {
        message: '导出功能尚未实现',
        format,
        count: cards.length
      }
    });
  } catch (error) {
    next(error);
  }
};

