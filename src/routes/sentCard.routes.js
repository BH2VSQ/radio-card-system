const express = require('express');
const router = express.Router();
const { 
  createSentCard,
  getSentCards,
  getSentCardById,
  updateSentCard,
  deleteSentCard,
  generateQrCode,
  uploadImages,
  deleteImage,
  linkReceivedCard,
  unlinkReceivedCard,
  getSentCardStats,
  exportSentCards,
  findMatchingReceivedCards
} = require('../controllers/sentCard.controller');
const { upload } = require('../middleware/upload.middleware');

// 创建发卡记录
router.post('/', createSentCard);

// 获取发卡列表
router.get('/', getSentCards);

// 获取发卡详情
router.get('/:id', getSentCardById);

// 更新发卡记录
router.put('/:id', updateSentCard);

// 删除发卡记录
router.delete('/:id', deleteSentCard);

// 生成发卡二维码
router.post('/:id/qrcode', generateQrCode);

// 上传发卡图片
router.post('/:id/images', upload.array('images', 5), uploadImages);

// 删除发卡图片
router.delete('/:id/images/:imageIndex', deleteImage);

// 关联收到的回卡
router.post('/:id/link-received-card', linkReceivedCard);

// 解除回卡关联
router.post('/:id/unlink-received-card', unlinkReceivedCard);

// 获取发卡统计
router.get('/stats', getSentCardStats);

// 批量导出发卡记录
router.get('/export', exportSentCards);

// 查找匹配的收卡记录
router.get('/:id/find-matching-received-cards', findMatchingReceivedCards);

module.exports = router;

