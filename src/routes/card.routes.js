const express = require('express');
const router = express.Router();
const { 
  createCard,
  getCards,
  getCardById,
  updateCard,
  deleteCard,
  generateQrCode,
  uploadImages,
  deleteImage,
  linkSentCard,
  unlinkSentCard,
  findMatchingSentCards
} = require('../controllers/card.controller');
const { upload } = require('../middleware/upload.middleware');

// 创建卡片
router.post('/', createCard);

// 获取卡片列表
router.get('/', getCards);

// 获取卡片详情
router.get('/:id', getCardById);

// 更新卡片
router.put('/:id', updateCard);

// 删除卡片
router.delete('/:id', deleteCard);

// 生成二维码
router.post('/:id/qrcode', generateQrCode);

// 上传卡片图片
router.post('/:id/images', upload.array('images', 5), uploadImages);

// 删除卡片图片
router.delete('/:id/images/:imageIndex', deleteImage);

// 关联发卡记录
router.post('/:id/link-sent-card', linkSentCard);

// 解除发卡关联
router.post('/:id/unlink-sent-card', unlinkSentCard);

// 查找匹配的发卡记录
router.get('/:id/find-matching-sent-cards', findMatchingSentCards);

module.exports = router;

