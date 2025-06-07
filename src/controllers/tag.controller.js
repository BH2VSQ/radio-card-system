const Tag = require('../models/tag.model');
const Card = require('../models/card.model');
const SentCard = require('../models/sentCard.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    创建标签
 * @route   POST /api/tags
 * @access  Private
 */
exports.createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    // 检查标签名称是否已存在
    const existingTag = await Tag.findOne({ 
      userId: req.user.id,
      name
    });

    if (existingTag) {
      return next(createError(400, '标签名称已存在'));
    }

    // 创建标签
    const tag = new Tag({
      userId: req.user.id,
      name,
      color: color || '#1890ff'
    });

    await tag.save();

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取标签列表
 * @route   GET /api/tags
 * @access  Private
 */
exports.getTags = async (req, res, next) => {
  try {
    const { search, sort, order } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // 排序
    const sortField = sort || 'name';
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortField]: sortOrder };

    // 执行查询
    const tags = await Tag.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取标签详情
 * @route   GET /api/tags/:id
 * @access  Private
 */
exports.getTagById = async (req, res, next) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!tag) {
      return next(createError(404, '标签不存在'));
    }

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新标签
 * @route   PUT /api/tags/:id
 * @access  Private
 */
exports.updateTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    // 查找标签
    const tag = await Tag.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!tag) {
      return next(createError(404, '标签不存在'));
    }

    // 如果更改了名称，检查是否与其他标签重名
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ 
        userId: req.user.id,
        name,
        _id: { $ne: tag._id }
      });

      if (existingTag) {
        return next(createError(400, '标签名称已存在'));
      }
    }

    // 更新标签
    if (name) tag.name = name;
    if (color) tag.color = color;

    await tag.save();

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除标签
 * @route   DELETE /api/tags/:id
 * @access  Private
 */
exports.deleteTag = async (req, res, next) => {
  try {
    // 查找标签
    const tag = await Tag.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!tag) {
      return next(createError(404, '标签不存在'));
    }

    // 检查是否有关联的卡片
    const cards = await Card.find({
      tags: tag._id
    });

    const sentCards = await SentCard.find({
      tags: tag._id
    });

    if (cards.length > 0 || sentCards.length > 0) {
      return next(createError(400, '无法删除已被卡片使用的标签'));
    }

    // 删除标签
    await tag.deleteOne();

    res.status(200).json({
      success: true,
      data: {
        message: '标签已删除'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取标签统计
 * @route   GET /api/tags/stats
 * @access  Private
 */
exports.getTagStats = async (req, res, next) => {
  try {
    // 获取所有标签
    const tags = await Tag.find({ userId: req.user.id });
    
    // 统计每个标签的使用次数
    const tagStats = [];
    
    for (const tag of tags) {
      const cardCount = await Card.countDocuments({
        userId: req.user.id,
        tags: tag._id
      });
      
      const sentCardCount = await SentCard.countDocuments({
        userId: req.user.id,
        tags: tag._id
      });
      
      tagStats.push({
        id: tag._id,
        name: tag.name,
        color: tag.color,
        cardCount,
        sentCardCount,
        totalCount: cardCount + sentCardCount
      });
    }
    
    // 按使用次数排序
    tagStats.sort((a, b) => b.totalCount - a.totalCount);
    
    res.status(200).json({
      success: true,
      data: tagStats
    });
  } catch (error) {
    next(error);
  }
};

