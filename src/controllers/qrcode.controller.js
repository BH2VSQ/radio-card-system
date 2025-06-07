const qrcode = require('qrcode');
const Card = require('../models/card.model');
const SentCard = require('../models/sentCard.model');
const { createError } = require('../utils/error.util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 生成卡片编号
 * 格式：年份+类型+序号+随机32位编码
 * @param {string} type - 卡片类型 (RC: 收卡, TC: 发卡)
 * @param {number} sequence - 序号
 * @returns {string} - 卡片编号
 */
const generateCardCode = async (type) => {
  // 获取当前年份
  const year = new Date().getFullYear();
  
  // 确定卡片类型
  const cardType = type === 'sent' ? 'TC' : 'RC';
  
  // 获取序号
  let sequence = 1;
  
  // 根据类型获取最新序号
  if (type === 'sent') {
    const latestCard = await SentCard.findOne().sort({ createdAt: -1 });
    if (latestCard && latestCard.qrCode) {
      const match = latestCard.qrCode.match(/^\d{4}TC(\d{5})/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
  } else {
    const latestCard = await Card.findOne().sort({ createdAt: -1 });
    if (latestCard && latestCard.qrCode) {
      const match = latestCard.qrCode.match(/^\d{4}RC(\d{5})/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }
  }
  
  // 格式化序号为5位数字
  const formattedSequence = sequence.toString().padStart(5, '0');
  
  // 生成32位16进制随机编码
  const randomCode = crypto.randomBytes(16).toString('hex');
  
  // 组合编号
  const cardCode = `${year}${cardType}${formattedSequence}${randomCode}`;
  
  return cardCode;
};

/**
 * @desc    生成二维码
 * @route   POST /api/tags/qrcode/generate
 * @access  Private
 */
exports.generateQrCode = async (req, res, next) => {
  try {
    const { data, size, margin, color, backgroundColor, includeCardInfo, type } = req.body;
    
    // 验证输入
    if (!data) {
      return next(createError(400, '缺少二维码数据'));
    }
    
    // 二维码选项
    const options = {
      width: size || 300,
      margin: margin || 4,
      color: {
        dark: color || '#000000',
        light: backgroundColor || '#ffffff'
      }
    };
    
    // 生成卡片编号
    let cardCode = data;
    if (data.startsWith('card:') || data.startsWith('sentcard:')) {
      const cardType = data.startsWith('sentcard:') ? 'sent' : 'received';
      cardCode = await generateCardCode(cardType);
    }
    
    // 如果包含卡片信息，检查卡片是否存在
    let cardInfo = null;
    if (includeCardInfo && data.startsWith('card:')) {
      const cardId = data.split(':')[1];
      const card = await Card.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (card) {
        cardInfo = {
          callsign: card.callsign,
          contactDate: card.contactDate,
          band: card.band,
          mode: card.mode,
          cardCode
        };
      }
    } else if (includeCardInfo && data.startsWith('sentcard:')) {
      const cardId = data.split(':')[1];
      const sentCard = await SentCard.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (sentCard) {
        cardInfo = {
          callsign: sentCard.callsign,
          contactDate: sentCard.contactDate,
          band: sentCard.band,
          mode: sentCard.mode,
          cardCode
        };
      }
    }
    
    // 生成二维码
    const qrDataURL = await qrcode.toDataURL(cardCode, options);
    
    res.status(200).json({
      success: true,
      data: {
        qrCode: qrDataURL,
        cardCode,
        cardInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    扫描识别二维码
 * @route   POST /api/tags/qrcode/scan
 * @access  Private
 */
exports.scanQrCode = async (req, res, next) => {
  try {
    const { image } = req.body;
    
    // 验证输入
    if (!image) {
      return next(createError(400, '缺少二维码图片'));
    }
    
    // 由于Node.js环境中无法直接解析二维码图片，这里模拟解析过程
    // 实际应用中，可以使用第三方服务或库来解析二维码
    
    // 模拟解析结果
    const result = {
      success: true,
      data: {
        message: '二维码解析功能尚未实现',
        info: '在实际应用中，可以使用第三方服务或库来解析二维码'
      }
    };
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取卡片二维码
 * @route   GET /api/tags/qrcode/:cardId
 * @access  Private
 */
exports.getCardQrCode = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { type, size, margin, color, backgroundColor } = req.query;
    
    // 二维码选项
    const options = {
      width: parseInt(size) || 300,
      margin: parseInt(margin) || 4,
      color: {
        dark: color || '#000000',
        light: backgroundColor || '#ffffff'
      }
    };
    
    // 检查卡片类型
    if (type === 'sent') {
      // 查找发卡记录
      const sentCard = await SentCard.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (!sentCard) {
        return next(createError(404, '发卡记录不存在'));
      }
      
      // 生成卡片编号
      let cardCode = sentCard.qrCode;
      if (!cardCode) {
        cardCode = await generateCardCode('sent');
        sentCard.qrCode = cardCode;
        await sentCard.save();
      }
      
      // 生成二维码
      const qrDataURL = await qrcode.toDataURL(cardCode, options);
      
      res.status(200).json({
        success: true,
        data: {
          qrCode: qrDataURL,
          cardCode,
          cardInfo: {
            id: sentCard._id,
            callsign: sentCard.callsign,
            contactDate: sentCard.contactDate,
            band: sentCard.band,
            mode: sentCard.mode
          }
        }
      });
    } else {
      // 查找卡片
      const card = await Card.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (!card) {
        return next(createError(404, '卡片不存在'));
      }
      
      // 生成卡片编号
      let cardCode = card.qrCode;
      if (!cardCode) {
        cardCode = await generateCardCode('received');
        card.qrCode = cardCode;
        await card.save();
      }
      
      // 生成二维码
      const qrDataURL = await qrcode.toDataURL(cardCode, options);
      
      res.status(200).json({
        success: true,
        data: {
          qrCode: qrDataURL,
          cardCode,
          cardInfo: {
            id: card._id,
            callsign: card.callsign,
            contactDate: card.contactDate,
            band: card.band,
            mode: card.mode
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 生成二维码并保存为文件
 * @param {string} data - 二维码数据
 * @param {string} filePath - 文件保存路径
 * @param {Object} options - 二维码选项
 * @returns {Promise<string>} - 文件路径
 */
exports.generateQrCodeFile = async (data, filePath, options = {}) => {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 二维码选项
    const qrOptions = {
      width: options.size || 300,
      margin: options.margin || 4,
      color: {
        dark: options.color || '#000000',
        light: options.backgroundColor || '#ffffff'
      }
    };
    
    // 生成二维码
    await qrcode.toFile(filePath, data, qrOptions);
    
    return filePath;
  } catch (error) {
    throw error;
  }
};

