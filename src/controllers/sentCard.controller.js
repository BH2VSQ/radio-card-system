const SentCard = require('../models/sentCard.model');
const { AppError } = require('../utils/error.util');

// 获取所有发出的卡片
const getAllSentCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (search) {
      query.$or = [
        { callsign: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { qth: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const sentCards = await SentCard.paginate(query, options);
    
    res.json({
      success: true,
      data: sentCards
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个发出的卡片
const getSentCardById = async (req, res, next) => {
  try {
    const sentCard = await SentCard.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!sentCard) {
      throw new AppError('发卡记录不存在', 404);
    }
    
    res.json({
      success: true,
      data: sentCard
    });
  } catch (error) {
    next(error);
  }
};

// 创建发卡记录
const createSentCard = async (req, res, next) => {
  try {
    const sentCardData = {
      ...req.body,
      userId: req.user.id
    };
    
    const sentCard = new SentCard(sentCardData);
    await sentCard.save();
    
    res.status(201).json({
      success: true,
      data: sentCard,
      message: '发卡记录创建成功'
    });
  } catch (error) {
    next(error);
  }
};

// 更新发卡记录
const updateSentCard = async (req, res, next) => {
  try {
    const sentCard = await SentCard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sentCard) {
      throw new AppError('发卡记录不存在', 404);
    }
    
    res.json({
      success: true,
      data: sentCard,
      message: '发卡记录更新成功'
    });
  } catch (error) {
    next(error);
  }
};

// 删除发卡记录
const deleteSentCard = async (req, res, next) => {
  try {
    const sentCard = await SentCard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!sentCard) {
      throw new AppError('发卡记录不存在', 404);
    }
    
    res.json({
      success: true,
      message: '发卡记录删除成功'
    });
  } catch (error) {
    next(error);
  }
};

// 批量发卡
const batchSendCards = async (req, res, next) => {
  try {
    const { cards } = req.body;
    
    if (!Array.isArray(cards) || cards.length === 0) {
      throw new AppError('请提供有效的发卡数据', 400);
    }
    
    // 为每个发卡记录添加用户ID
    const cardsWithUserId = cards.map(card => ({
      ...card,
      userId: req.user.id,
      status: 'pending'
    }));
    
    const result = await SentCard.insertMany(cardsWithUserId, { ordered: false });
    
    res.json({
      success: true,
      data: {
        sent: result.length,
        total: cards.length
      },
      message: `成功创建 ${result.length} 条发卡记录`
    });
  } catch (error) {
    next(error);
  }
};

// 更新发卡状态
const updateSentCardStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    
    const sentCard = await SentCard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        status,
        trackingNumber,
        notes,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!sentCard) {
      throw new AppError('发卡记录不存在', 404);
    }
    
    res.json({
      success: true,
      data: sentCard,
      message: '发卡状态更新成功'
    });
  } catch (error) {
    next(error);
  }
};

// 获取发卡统计
const getSentCardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await SentCard.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = {
      pending: 0,
      sent: 0,
      delivered: 0,
      confirmed: 0,
      failed: 0
    };
    
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });
    
    const totalSent = await SentCard.countDocuments({ userId });
    
    res.json({
      success: true,
      data: {
        total: totalSent,
        statusStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSentCards,
  getSentCardById,
  createSentCard,
  updateSentCard,
  deleteSentCard,
  batchSendCards,
  updateSentCardStatus,
  getSentCardStats
};

