const express = require('express');
const router = express.Router();
const { 
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  importCards,
  exportCards,
  getCardStats
} = require('../controllers/card.controller');
const { upload } = require('../middleware/upload.middleware');

// 获取卡片列表
router.get('/', getAllCards);

// 获取卡片统计
router.get('/stats', getCardStats);

// 导出卡片
router.get('/export', exportCards);

// 批量导入卡片
router.post('/import', importCards);

// 创建卡片
router.post('/', createCard);

// 获取卡片详情
router.get('/:id', getCardById);

// 更新卡片
router.put('/:id', updateCard);

// 删除卡片
router.delete('/:id', deleteCard);

module.exports = router;

