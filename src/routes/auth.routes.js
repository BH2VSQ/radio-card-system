const express = require('express');
const router = express.Router();
const { 
  initialize,
  login, 
  logout, 
  getMe, 
  getInitStatus,
  updateProfile,
  changePassword
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// 检查系统初始化状态
router.get('/init-status', getInitStatus);

// 系统初始化
router.post('/initialize', initialize);

// 用户登录
router.post('/login', login);

// 用户登出
router.post('/logout', authMiddleware, logout);

// 获取当前用户信息
router.get('/me', authMiddleware, getMe);

// 更新用户信息
router.put('/profile', authMiddleware, updateProfile);

// 修改密码
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;

