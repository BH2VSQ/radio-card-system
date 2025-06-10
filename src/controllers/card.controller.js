const Card = require('../models/card.model');
const { AppError } = require('../utils/error.util');

// 获取所有卡片
const getAllCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, tag } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (search) {
      query.$or = [
        { callsign: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { qth: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: ['category', 'tags']
    };
    
    const cards = await Card.paginate(query, options);
    
    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个卡片
const getCardById = async (req, res, next) => {
  try {
    const card = await Card.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate(['category', 'tags']);
    
    if (!card) {
      throw new AppError('卡片不存在', 404);
    }
    
    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// 创建卡片
const createCard = async (req, res, next) => {
  try {
    const cardData = {
      ...req.body,
      userId: req.user.id
    };
    
    const card = new Card(cardData);
    await card.save();
    
    res.status(201).json({
      success: true,
      data: card,
      message: '卡片创建成功'
    });
  } catch (error) {
    next(error);
  }
};

// 更新卡片
const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate(['category', 'tags']);
    
    if (!card) {
      throw new AppError('卡片不存在', 404);
    }
    
    res.json({
      success: true,
      data: card,
      message: '卡片更新成功'
    });
  } catch (error) {
    next(error);
  }
};

// 删除卡片
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!card) {
      throw new AppError('卡片不存在', 404);
    }
    
    res.json({
      success: true,
      message: '卡片删除成功'
    });
  } catch (error) {
    next(error);
  }
};

// 批量导入卡片
const importCards = async (req, res, next) => {
  try {
    const { cards } = req.body;
    
    if (!Array.isArray(cards) || cards.length === 0) {
      throw new AppError('请提供有效的卡片数据', 400);
    }
    
    // 为每个卡片添加用户ID
    const cardsWithUserId = cards.map(card => ({
      ...card,
      userId: req.user.id
    }));
    
    const result = await Card.insertMany(cardsWithUserId, { ordered: false });
    
    res.json({
      success: true,
      data: {
        imported: result.length,
        total: cards.length
      },
      message: `成功导入 ${result.length} 张卡片`
    });
  } catch (error) {
    next(error);
  }
};

// 导出卡片
const exportCards = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    
    const cards = await Card.find({ userId: req.user.id })
      .populate(['category', 'tags'])
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // 转换为CSV格式
      const csvData = cards.map(card => ({
        呼号: card.callsign,
        姓名: card.name,
        QTH: card.qth,
        日期: card.date,
        时间: card.time,
        频率: card.frequency,
        模式: card.mode,
        RST发送: card.rstSent,
        RST接收: card.rstReceived,
        备注: card.notes
      }));
      
      res.json({
        success: true,
        data: csvData,
        format: 'csv'
      });
    } else {
      res.json({
        success: true,
        data: cards,
        format: 'json'
      });
    }
  } catch (error) {
    next(error);
  }
};

// 获取卡片统计
const getCardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const stats = await Card.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalCards: { $sum: 1 },
          uniqueCallsigns: { $addToSet: '$callsign' },
          modeStats: {
            $push: '$mode'
          },
          frequencyStats: {
            $push: '$frequency'
          }
        }
      },
      {
        $project: {
          totalCards: 1,
          uniqueCallsigns: { $size: '$uniqueCallsigns' },
          modeStats: 1,
          frequencyStats: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats[0] || {
        totalCards: 0,
        uniqueCallsigns: 0,
        modeStats: [],
        frequencyStats: []
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  importCards,
  exportCards,
  getCardStats
};

