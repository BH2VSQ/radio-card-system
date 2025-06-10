const express = require('express');
const router = express.Router();
const { 
  getAllSentCards,
  getSentCardById,
  createSentCard,
  updateSentCard,
  deleteSentCard,
  batchSendCards,
  updateSentCardStatus,
  getSentCardStats
} = require('../controllers/sentCard.controller');

// 获取发卡统计
router.get('/stats', getSentCardStats);

// 批量发卡
router.post('/batch', batchSendCards);

// 获取发卡列表
router.get('/', getAllSentCards);

// 创建发卡记录
router.post('/', createSentCard);

// 获取发卡详情
router.get('/:id', getSentCardById);

// 更新发卡记录
router.put('/:id', updateSentCard);

// 更新发卡状态
router.patch('/:id/status', updateSentCardStatus);

// 删除发卡记录
router.delete('/:id', deleteSentCard);

module.exports = router;

