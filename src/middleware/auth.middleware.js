const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error.util');
const User = require('../models/user.model');

/**
 * 认证中间件
 * 验证请求头中的JWT令牌，并将用户信息添加到req对象
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    // 获取请求头中的Authorization
    const authHeader = req.headers.authorization;
    
    // 检查Authorization是否存在
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, '未提供访问令牌'));
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.id).select('-password');
    
    // 检查用户是否存在
    if (!user) {
      return next(createError(401, '用户不存在或已被禁用'));
    }
    
    // 检查用户是否激活
    if (!user.isActive) {
      return next(createError(401, '用户账号已被禁用'));
    }
    
    // 将用户信息添加到req对象
    req.user = user;
    
    // 继续下一个中间件
    next();
  } catch (error) {
    // 处理JWT错误
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, '无效的访问令牌'));
    }
    
    // 处理JWT过期错误
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, '访问令牌已过期'));
    }
    
    // 处理其他错误
    next(error);
  }
};

/**
 * 管理员权限中间件
 * 检查用户是否具有管理员权限
 */
exports.adminMiddleware = (req, res, next) => {
  // 检查用户是否存在
  if (!req.user) {
    return next(createError(401, '未授权访问'));
  }
  
  // 检查用户是否为管理员
  if (req.user.role !== 'admin') {
    return next(createError(403, '没有权限执行此操作'));
  }
  
  // 继续下一个中间件
  next();
};

