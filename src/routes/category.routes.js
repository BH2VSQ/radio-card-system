const express = require('express');
const router = express.Router();
const { 
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryPath,
  getCategoryChildren,
  getCategoryDescendants,
  moveCategory
} = require('../controllers/category.controller');

// 创建分类
router.post('/', createCategory);

// 获取分类列表
router.get('/', getCategories);

// 获取分类详情
router.get('/:id', getCategoryById);

// 更新分类
router.put('/:id', updateCategory);

// 删除分类
router.delete('/:id', deleteCategory);

// 获取分类路径
router.get('/:id/path', getCategoryPath);

// 获取子分类
router.get('/:id/children', getCategoryChildren);

// 获取所有后代分类
router.get('/:id/descendants', getCategoryDescendants);

// 移动分类
router.post('/:id/move', moveCategory);

module.exports = router;

