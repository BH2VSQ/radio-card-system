const Card = require('../models/card.model');
const SentCard = require('../models/sentCard.model');
const RfidDevice = require('../models/rfidDevice.model');
const RfidLog = require('../models/rfidLog.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    读取RFID标签
 * @route   POST /api/tags/rfid/read
 * @access  Private
 */
exports.readRfidTag = async (req, res, next) => {
  try {
    const { deviceId, tagUid } = req.body;
    
    // 验证输入
    if (!deviceId) {
      return next(createError(400, '缺少设备ID'));
    }
    
    // 检查设备是否存在
    const device = await RfidDevice.findOne({
      _id: deviceId,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 检查设备是否连接
    if (!device.isConnected) {
      return next(createError(400, 'RFID设备未连接'));
    }
    
    // 模拟读取RFID标签
    // 在实际应用中，这里会与RFID硬件设备通信
    let tagData = null;
    let card = null;
    let sentCard = null;
    
    // 如果提供了标签UID，查找关联的卡片
    if (tagUid) {
      // 查找收到的卡片
      card = await Card.findOne({
        'rfidTag.uid': tagUid,
        userId: req.user.id
      });
      
      // 查找发出的卡片
      if (!card) {
        sentCard = await SentCard.findOne({
          'rfidTag.uid': tagUid,
          userId: req.user.id
        });
      }
      
      // 记录日志
      await new RfidLog({
        userId: req.user.id,
        deviceId: device._id,
        operationType: 'read',
        tagUid,
        cardId: card ? card._id : null,
        sentCardId: sentCard ? sentCard._id : null,
        status: card || sentCard ? 'success' : 'info',
        message: card || sentCard ? '成功读取RFID标签并找到关联卡片' : '成功读取RFID标签，但未找到关联卡片',
        details: {
          tagUid,
          deviceName: device.name,
          cardFound: !!card || !!sentCard
        }
      }).save();
      
      // 更新标签最后读取时间
      if (card) {
        card.rfidTag.lastRead = new Date();
        await card.save();
      } else if (sentCard) {
        sentCard.rfidTag.lastRead = new Date();
        await sentCard.save();
      }
      
      // 准备响应数据
      tagData = {
        uid: tagUid,
        lastRead: new Date(),
        cardInfo: card ? {
          id: card._id,
          callsign: card.callsign,
          contactDate: card.contactDate,
          band: card.band,
          mode: card.mode,
          contactType: card.contactType,
          qrCode: card.qrCode
        } : sentCard ? {
          id: sentCard._id,
          callsign: sentCard.callsign,
          contactDate: sentCard.contactDate,
          band: sentCard.band,
          mode: sentCard.mode,
          contactType: sentCard.contactType,
          qrCode: sentCard.qrCode,
          isSentCard: true
        } : null
      };
    } else {
      // 模拟从设备读取标签
      // 在实际应用中，这里会调用设备API读取标签
      return next(createError(400, '未提供标签UID，实际应用中需要从设备读取'));
    }
    
    res.status(200).json({
      success: true,
      data: {
        tagData,
        device: {
          id: device._id,
          name: device.name,
          status: device.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    写入RFID标签
 * @route   POST /api/tags/rfid/write
 * @access  Private
 */
exports.writeRfidTag = async (req, res, next) => {
  try {
    const { deviceId, tagUid, cardId, isSentCard, data } = req.body;
    
    // 验证输入
    if (!deviceId || !tagUid) {
      return next(createError(400, '缺少设备ID或标签UID'));
    }
    
    // 检查设备是否存在
    const device = await RfidDevice.findOne({
      _id: deviceId,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 检查设备是否连接
    if (!device.isConnected) {
      return next(createError(400, 'RFID设备未连接'));
    }
    
    // 如果提供了卡片ID，查找卡片
    let card = null;
    let sentCard = null;
    
    if (cardId) {
      if (isSentCard) {
        sentCard = await SentCard.findOne({
          _id: cardId,
          userId: req.user.id
        });
        
        if (!sentCard) {
          return next(createError(404, '发卡记录不存在'));
        }
      } else {
        card = await Card.findOne({
          _id: cardId,
          userId: req.user.id
        });
        
        if (!card) {
          return next(createError(404, '卡片不存在'));
        }
      }
    }
    
    // 模拟写入RFID标签
    // 在实际应用中，这里会与RFID硬件设备通信
    
    // 更新卡片的RFID标签信息
    if (card) {
      card.rfidTag = {
        uid: tagUid,
        type: data?.type || 'MIFARE Classic',
        lastWrite: new Date(),
        status: 'active'
      };
      await card.save();
    } else if (sentCard) {
      sentCard.rfidTag = {
        uid: tagUid,
        type: data?.type || 'MIFARE Classic',
        lastWrite: new Date(),
        status: 'active'
      };
      await sentCard.save();
    }
    
    // 记录日志
    await new RfidLog({
      userId: req.user.id,
      deviceId: device._id,
      operationType: 'write',
      tagUid,
      cardId: card ? card._id : null,
      sentCardId: sentCard ? sentCard._id : null,
      status: 'success',
      message: '成功写入RFID标签',
      details: {
        tagUid,
        deviceName: device.name,
        cardId: card ? card._id : sentCard ? sentCard._id : null,
        data
      }
    }).save();
    
    res.status(200).json({
      success: true,
      data: {
        tagUid,
        cardInfo: card ? {
          id: card._id,
          callsign: card.callsign,
          rfidTag: card.rfidTag
        } : sentCard ? {
          id: sentCard._id,
          callsign: sentCard.callsign,
          rfidTag: sentCard.rfidTag,
          isSentCard: true
        } : null,
        device: {
          id: device._id,
          name: device.name
        },
        message: '成功写入RFID标签'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    将RFID标签关联到卡片
 * @route   POST /api/tags/rfid/link/:cardId
 * @access  Private
 */
exports.linkRfidToCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { tagUid, deviceId, isSentCard, tagType } = req.body;
    
    // 验证输入
    if (!tagUid) {
      return next(createError(400, '缺少标签UID'));
    }
    
    // 查找卡片
    let card = null;
    let sentCard = null;
    
    if (isSentCard) {
      sentCard = await SentCard.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (!sentCard) {
        return next(createError(404, '发卡记录不存在'));
      }
      
      // 检查标签是否已被使用
      const existingCard = await Card.findOne({
        'rfidTag.uid': tagUid,
        userId: req.user.id
      });
      
      const existingSentCard = await SentCard.findOne({
        'rfidTag.uid': tagUid,
        _id: { $ne: sentCard._id },
        userId: req.user.id
      });
      
      if (existingCard || existingSentCard) {
        return next(createError(400, 'RFID标签已被其他卡片使用'));
      }
      
      // 更新发卡记录的RFID标签信息
      sentCard.rfidTag = {
        uid: tagUid,
        type: tagType || 'MIFARE Classic',
        lastWrite: new Date(),
        status: 'active'
      };
      await sentCard.save();
    } else {
      card = await Card.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (!card) {
        return next(createError(404, '卡片不存在'));
      }
      
      // 检查标签是否已被使用
      const existingCard = await Card.findOne({
        'rfidTag.uid': tagUid,
        _id: { $ne: card._id },
        userId: req.user.id
      });
      
      const existingSentCard = await SentCard.findOne({
        'rfidTag.uid': tagUid,
        userId: req.user.id
      });
      
      if (existingCard || existingSentCard) {
        return next(createError(400, 'RFID标签已被其他卡片使用'));
      }
      
      // 更新卡片的RFID标签信息
      card.rfidTag = {
        uid: tagUid,
        type: tagType || 'MIFARE Classic',
        lastWrite: new Date(),
        status: 'active'
      };
      await card.save();
    }
    
    // 记录日志
    if (deviceId) {
      const device = await RfidDevice.findOne({
        _id: deviceId,
        userId: req.user.id
      });
      
      if (device) {
        await new RfidLog({
          userId: req.user.id,
          deviceId: device._id,
          operationType: 'link',
          tagUid,
          cardId: card ? card._id : null,
          sentCardId: sentCard ? sentCard._id : null,
          status: 'success',
          message: '成功关联RFID标签到卡片',
          details: {
            tagUid,
            deviceName: device.name,
            cardId: card ? card._id : sentCard ? sentCard._id : null
          }
        }).save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        tagUid,
        cardInfo: card ? {
          id: card._id,
          callsign: card.callsign,
          rfidTag: card.rfidTag
        } : sentCard ? {
          id: sentCard._id,
          callsign: sentCard.callsign,
          rfidTag: sentCard.rfidTag,
          isSentCard: true
        } : null,
        message: '成功关联RFID标签到卡片'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    解除RFID标签与卡片的关联
 * @route   POST /api/tags/rfid/unlink/:cardId
 * @access  Private
 */
exports.unlinkRfidFromCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { deviceId, isSentCard } = req.body;
    
    // 查找卡片
    let card = null;
    let sentCard = null;
    let tagUid = null;
    
    if (isSentCard) {
      sentCard = await SentCard.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (!sentCard) {
        return next(createError(404, '发卡记录不存在'));
      }
      
      // 保存标签UID用于日志
      tagUid = sentCard.rfidTag?.uid;
      
      // 清除RFID标签信息
      sentCard.rfidTag = undefined;
      await sentCard.save();
    } else {
      card = await Card.findOne({
        _id: cardId,
        userId: req.user.id
      });
      
      if (!card) {
        return next(createError(404, '卡片不存在'));
      }
      
      // 保存标签UID用于日志
      tagUid = card.rfidTag?.uid;
      
      // 清除RFID标签信息
      card.rfidTag = undefined;
      await card.save();
    }
    
    // 记录日志
    if (deviceId && tagUid) {
      const device = await RfidDevice.findOne({
        _id: deviceId,
        userId: req.user.id
      });
      
      if (device) {
        await new RfidLog({
          userId: req.user.id,
          deviceId: device._id,
          operationType: 'unlink',
          tagUid,
          cardId: card ? card._id : null,
          sentCardId: sentCard ? sentCard._id : null,
          status: 'success',
          message: '成功解除RFID标签与卡片的关联',
          details: {
            tagUid,
            deviceName: device.name,
            cardId: card ? card._id : sentCard ? sentCard._id : null
          }
        }).save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        message: '成功解除RFID标签与卡片的关联',
        cardInfo: card ? {
          id: card._id,
          callsign: card.callsign
        } : sentCard ? {
          id: sentCard._id,
          callsign: sentCard.callsign,
          isSentCard: true
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取RFID标签信息
 * @route   GET /api/tags/rfid/:uid
 * @access  Private
 */
exports.getRfidTagInfo = async (req, res, next) => {
  try {
    const { uid } = req.params;
    
    // 查找关联的卡片
    const card = await Card.findOne({
      'rfidTag.uid': uid,
      userId: req.user.id
    });
    
    // 查找关联的发卡记录
    const sentCard = await SentCard.findOne({
      'rfidTag.uid': uid,
      userId: req.user.id
    });
    
    // 获取标签操作日志
    const logs = await RfidLog.find({
      tagUid: uid,
      userId: req.user.id
    })
    .sort({ timestamp: -1 })
    .limit(10);
    
    if (!card && !sentCard) {
      return next(createError(404, '未找到与此RFID标签关联的卡片'));
    }
    
    res.status(200).json({
      success: true,
      data: {
        tagUid: uid,
        cardInfo: card ? {
          id: card._id,
          callsign: card.callsign,
          contactDate: card.contactDate,
          band: card.band,
          mode: card.mode,
          contactType: card.contactType,
          qrCode: card.qrCode,
          rfidTag: card.rfidTag
        } : null,
        sentCardInfo: sentCard ? {
          id: sentCard._id,
          callsign: sentCard.callsign,
          contactDate: sentCard.contactDate,
          band: sentCard.band,
          mode: sentCard.mode,
          contactType: sentCard.contactType,
          qrCode: sentCard.qrCode,
          rfidTag: sentCard.rfidTag
        } : null,
        logs: logs.map(log => ({
          id: log._id,
          operationType: log.operationType,
          status: log.status,
          message: log.message,
          timestamp: log.timestamp
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新RFID标签状态
 * @route   PUT /api/tags/rfid/:uid/status
 * @access  Private
 */
exports.updateRfidTagStatus = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { status } = req.body;
    
    // 验证状态
    if (!['active', 'inactive', 'lost', 'damaged'].includes(status)) {
      return next(createError(400, '无效的状态值'));
    }
    
    // 查找关联的卡片
    const card = await Card.findOne({
      'rfidTag.uid': uid,
      userId: req.user.id
    });
    
    // 查找关联的发卡记录
    const sentCard = await SentCard.findOne({
      'rfidTag.uid': uid,
      userId: req.user.id
    });
    
    if (!card && !sentCard) {
      return next(createError(404, '未找到与此RFID标签关联的卡片'));
    }
    
    // 更新标签状态
    if (card) {
      card.rfidTag.status = status;
      await card.save();
    }
    
    if (sentCard) {
      sentCard.rfidTag.status = status;
      await sentCard.save();
    }
    
    res.status(200).json({
      success: true,
      data: {
        tagUid: uid,
        status,
        message: '成功更新RFID标签状态',
        cardInfo: card ? {
          id: card._id,
          callsign: card.callsign,
          rfidTag: card.rfidTag
        } : null,
        sentCardInfo: sentCard ? {
          id: sentCard._id,
          callsign: sentCard.callsign,
          rfidTag: sentCard.rfidTag
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

