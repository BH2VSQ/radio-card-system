const express = require('express');
const router = express.Router();
const { 
  createCallsignAssociation,
  getCallsignAssociations,
  getCallsignAssociationById,
  updateCallsignAssociation,
  deleteCallsignAssociation,
  addCallsignToAssociation,
  removeCallsignFromAssociation,
  updateCallsignStatus,
  searchByCallsign,
  getCardsByAssociationId
} = require('../controllers/callsignAssociation.controller');

// 创建呼号关联
router.post('/', createCallsignAssociation);

// 获取呼号关联列表
router.get('/', getCallsignAssociations);

// 获取呼号关联详情
router.get('/:id', getCallsignAssociationById);

// 更新呼号关联
router.put('/:id', updateCallsignAssociation);

// 删除呼号关联
router.delete('/:id', deleteCallsignAssociation);

// 添加呼号到关联
router.post('/:id/callsigns', addCallsignToAssociation);

// 从关联中移除呼号
router.delete('/:id/callsigns/:callsign', removeCallsignFromAssociation);

// 更新呼号状态
router.put('/:id/callsigns/:callsign/status', updateCallsignStatus);

// 通过呼号搜索关联
router.get('/search/callsign', searchByCallsign);

// 获取关联的所有卡片
router.get('/:id/cards', getCardsByAssociationId);

module.exports = router;

