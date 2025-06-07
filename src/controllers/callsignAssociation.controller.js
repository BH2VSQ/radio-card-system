const CallsignAssociation = require('../models/callsignAssociation.model');
const Card = require('../models/card.model');
const SentCard = require('../models/sentCard.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    创建呼号关联
 * @route   POST /api/callsign-associations
 * @access  Private
 */
exports.createCallsignAssociation = async (req, res, next) => {
  try {
    const { operatorName, callsigns, primaryCallsign, contactInfo, notes, tags } = req.body;
    
    // 验证输入
    if (!operatorName) {
      return next(createError(400, '操作员姓名是必填项'));
    }
    
    if (!callsigns || !Array.isArray(callsigns) || callsigns.length === 0) {
      return next(createError(400, '至少需要一个呼号'));
    }
    
    // 检查呼号是否已存在于其他关联中
    const callsignList = callsigns.map(c => c.callsign);
    const existingAssociations = await CallsignAssociation.find({
      userId: req.user.id,
      'callsigns.callsign': { $in: callsignList }
    });
    
    if (existingAssociations.length > 0) {
      const existingCallsigns = [];
      existingAssociations.forEach(assoc => {
        assoc.callsigns.forEach(c => {
          if (callsignList.includes(c.callsign)) {
            existingCallsigns.push(c.callsign);
          }
        });
      });
      
      return next(createError(400, `以下呼号已存在于其他关联中: ${existingCallsigns.join(', ')}`));
    }
    
    // 创建呼号关联
    const association = new CallsignAssociation({
      userId: req.user.id,
      operatorName,
      callsigns: callsigns.map(c => ({
        callsign: c.callsign,
        isActive: c.isActive !== undefined ? c.isActive : true,
        startDate: c.startDate,
        endDate: c.endDate,
        region: c.region,
        notes: c.notes
      })),
      primaryCallsign: primaryCallsign || callsigns[0].callsign,
      contactInfo: contactInfo || {},
      notes,
      tags: tags || []
    });
    
    await association.save();
    
    res.status(201).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取呼号关联列表
 * @route   GET /api/callsign-associations
 * @access  Private
 */
exports.getCallsignAssociations = async (req, res, next) => {
  try {
    const { search, sort, order, page = 1, limit = 10 } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (search) {
      query.$or = [
        { operatorName: { $regex: search, $options: 'i' } },
        { 'callsigns.callsign': { $regex: search, $options: 'i' } },
        { primaryCallsign: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 排序
    const sortField = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };
    
    // 执行查询
    const associations = await CallsignAssociation.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await CallsignAssociation.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: associations,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取呼号关联详情
 * @route   GET /api/callsign-associations/:id
 * @access  Private
 */
exports.getCallsignAssociationById = async (req, res, next) => {
  try {
    const association = await CallsignAssociation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    res.status(200).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新呼号关联
 * @route   PUT /api/callsign-associations/:id
 * @access  Private
 */
exports.updateCallsignAssociation = async (req, res, next) => {
  try {
    const { operatorName, primaryCallsign, contactInfo, notes, tags } = req.body;
    
    // 查找呼号关联
    const association = await CallsignAssociation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    // 更新字段
    if (operatorName) association.operatorName = operatorName;
    if (primaryCallsign) {
      // 检查primaryCallsign是否在callsigns列表中
      const callsignExists = association.callsigns.some(c => c.callsign === primaryCallsign);
      if (!callsignExists) {
        return next(createError(400, '主呼号必须在呼号列表中'));
      }
      association.primaryCallsign = primaryCallsign;
    }
    if (contactInfo) association.contactInfo = { ...association.contactInfo, ...contactInfo };
    if (notes !== undefined) association.notes = notes;
    if (tags) association.tags = tags;
    
    await association.save();
    
    res.status(200).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除呼号关联
 * @route   DELETE /api/callsign-associations/:id
 * @access  Private
 */
exports.deleteCallsignAssociation = async (req, res, next) => {
  try {
    // 查找呼号关联
    const association = await CallsignAssociation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    // 删除呼号关联
    await association.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {
        message: '呼号关联已删除'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    添加呼号到关联
 * @route   POST /api/callsign-associations/:id/callsigns
 * @access  Private
 */
exports.addCallsignToAssociation = async (req, res, next) => {
  try {
    const { callsign, isActive, startDate, endDate, region, notes } = req.body;
    
    // 验证输入
    if (!callsign) {
      return next(createError(400, '呼号是必填项'));
    }
    
    // 查找呼号关联
    const association = await CallsignAssociation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    // 检查呼号是否已存在于当前关联中
    const callsignExists = association.callsigns.some(c => c.callsign === callsign);
    if (callsignExists) {
      return next(createError(400, '呼号已存在于当前关联中'));
    }
    
    // 检查呼号是否已存在于其他关联中
    const existingAssociation = await CallsignAssociation.findOne({
      userId: req.user.id,
      _id: { $ne: association._id },
      'callsigns.callsign': callsign
    });
    
    if (existingAssociation) {
      return next(createError(400, `呼号已存在于其他关联中: ${existingAssociation.operatorName}`));
    }
    
    // 添加呼号
    association.callsigns.push({
      callsign,
      isActive: isActive !== undefined ? isActive : true,
      startDate,
      endDate,
      region,
      notes
    });
    
    await association.save();
    
    res.status(200).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    从关联中移除呼号
 * @route   DELETE /api/callsign-associations/:id/callsigns/:callsign
 * @access  Private
 */
exports.removeCallsignFromAssociation = async (req, res, next) => {
  try {
    const { id, callsign } = req.params;
    
    // 查找呼号关联
    const association = await CallsignAssociation.findOne({
      _id: id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    // 检查是否是最后一个呼号
    if (association.callsigns.length === 1) {
      return next(createError(400, '无法移除最后一个呼号，请直接删除整个关联'));
    }
    
    // 检查是否是主呼号
    if (association.primaryCallsign === callsign) {
      return next(createError(400, '无法移除主呼号，请先更改主呼号'));
    }
    
    // 移除呼号
    association.callsigns = association.callsigns.filter(c => c.callsign !== callsign);
    
    await association.save();
    
    res.status(200).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新呼号状态
 * @route   PUT /api/callsign-associations/:id/callsigns/:callsign/status
 * @access  Private
 */
exports.updateCallsignStatus = async (req, res, next) => {
  try {
    const { id, callsign } = req.params;
    const { isActive, endDate } = req.body;
    
    // 查找呼号关联
    const association = await CallsignAssociation.findOne({
      _id: id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    // 查找呼号
    const callsignIndex = association.callsigns.findIndex(c => c.callsign === callsign);
    if (callsignIndex === -1) {
      return next(createError(404, '呼号不存在于当前关联中'));
    }
    
    // 更新状态
    if (isActive !== undefined) {
      association.callsigns[callsignIndex].isActive = isActive;
    }
    
    if (endDate) {
      association.callsigns[callsignIndex].endDate = endDate;
    }
    
    await association.save();
    
    res.status(200).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    通过呼号搜索关联
 * @route   GET /api/callsign-associations/search/callsign
 * @access  Private
 */
exports.searchByCallsign = async (req, res, next) => {
  try {
    const { callsign } = req.query;
    
    if (!callsign) {
      return next(createError(400, '呼号是必填项'));
    }
    
    // 查找包含该呼号的关联
    const association = await CallsignAssociation.findOne({
      userId: req.user.id,
      'callsigns.callsign': callsign
    });
    
    if (!association) {
      return res.status(200).json({
        success: true,
        data: null,
        message: '未找到包含该呼号的关联'
      });
    }
    
    res.status(200).json({
      success: true,
      data: association
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取关联的所有卡片
 * @route   GET /api/callsign-associations/:id/cards
 * @access  Private
 */
exports.getCardsByAssociationId = async (req, res, next) => {
  try {
    // 查找呼号关联
    const association = await CallsignAssociation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!association) {
      return next(createError(404, '呼号关联不存在'));
    }
    
    // 获取所有关联的呼号
    const callsigns = association.callsigns.map(c => c.callsign);
    
    // 查找收到的卡片
    const receivedCards = await Card.find({
      userId: req.user.id,
      callsign: { $in: callsigns }
    }).sort({ contactDate: -1 });
    
    // 查找发出的卡片
    const sentCards = await SentCard.find({
      userId: req.user.id,
      callsign: { $in: callsigns }
    }).sort({ contactDate: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        association,
        receivedCards,
        sentCards
      }
    });
  } catch (error) {
    next(error);
  }
};

