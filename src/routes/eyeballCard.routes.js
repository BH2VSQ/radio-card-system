const express = require('express');
const router = express.Router();
const { 
  createEyeballCard,
  convertToEyeball,
  updateEyeballInfo,
  uploadEyeballMedia,
  deleteEyeballMedia,
  getEyeballCards,
  getEyeballCardStats,
  generateEyeballCertificate,
  exportEyeballCards
} = require('../controllers/eyeballCard.controller');
const { upload } = require('../middleware/upload.middleware');

// 创建EYEBALL卡
router.post('/', createEyeballCard);

// 将普通卡片转换为EYEBALL卡
router.post('/:id/convert-to-eyeball', convertToEyeball);

// 更新EYEBALL卡信息
router.put('/:id', updateEyeballInfo);

// 上传EYEBALL卡验证媒体
router.post('/:id/media', upload.array('media', 5), uploadEyeballMedia);

// 删除EYEBALL卡验证媒体
router.delete('/:id/media/:mediaIndex', deleteEyeballMedia);

// 获取EYEBALL卡列表
router.get('/', getEyeballCards);

// 获取EYEBALL卡统计
router.get('/stats', getEyeballCardStats);

// 生成EYEBALL卡证书
router.get('/:id/certificate', generateEyeballCertificate);

// 批量导出EYEBALL卡
router.get('/export', exportEyeballCards);

module.exports = router;

