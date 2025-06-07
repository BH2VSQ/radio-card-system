const express = require('express');
const router = express.Router();
const { 
  readRfidTag,
  writeRfidTag,
  linkRfidToCard,
  unlinkRfidFromCard,
  getRfidTagInfo,
  updateRfidTagStatus
} = require('../controllers/rfid.controller');

// 读取RFID标签
router.post('/read', readRfidTag);

// 写入RFID标签
router.post('/write', writeRfidTag);

// 将RFID标签关联到卡片
router.post('/link/:cardId', linkRfidToCard);

// 解除RFID标签与卡片的关联
router.post('/unlink/:cardId', unlinkRfidFromCard);

// 获取RFID标签信息
router.get('/:uid', getRfidTagInfo);

// 更新RFID标签状态
router.put('/:uid/status', updateRfidTagStatus);

module.exports = router;

