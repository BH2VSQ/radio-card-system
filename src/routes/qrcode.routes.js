const express = require('express');
const router = express.Router();
const { 
  generateQrCode,
  scanQrCode,
  getCardQrCode
} = require('../controllers/qrcode.controller');

// 生成二维码
router.post('/generate', generateQrCode);

// 扫描识别二维码
router.post('/scan', scanQrCode);

// 获取卡片二维码
router.get('/:cardId', getCardQrCode);

module.exports = router;

