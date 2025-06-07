const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe, 
  refreshToken,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// 注册新用户
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 用户登出
router.post('/logout', authMiddleware, logout);

// 获取当前用户信息
router.get('/me', authMiddleware, getMe);

// 刷新令牌
router.post('/refresh-token', refreshToken);

// 忘记密码
router.post('/forgot-password', forgotPassword);

// 重置密码
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;

