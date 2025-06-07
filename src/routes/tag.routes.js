const express = require('express');
const router = express.Router();
const { 
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  getTagStats
} = require('../controllers/tag.controller');

// 创建标签
router.post('/', createTag);

// 获取标签列表
router.get('/', getTags);

// 获取标签详情
router.get('/:id', getTagById);

// 更新标签
router.put('/:id', updateTag);

// 删除标签
router.delete('/:id', deleteTag);

// 获取标签统计
router.get('/stats', getTagStats);

module.exports = router;

