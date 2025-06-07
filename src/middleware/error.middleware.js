/**
 * 错误处理中间件
 */
exports.errorHandler = (err, req, res, next) => {
  // 默认状态码和错误消息
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器错误';

  // 处理Mongoose验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }

  // 处理Mongoose重复键错误
  if (err.code === 11000) {
    statusCode = 400;
    message = '数据已存在，请勿重复添加';
  }

  // 处理Mongoose转换错误
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `无效的${err.path}: ${err.value}`;
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的令牌，请重新登录';
  }

  // 处理JWT过期错误
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期，请重新登录';
  }

  // 处理Multer错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = `文件大小超过限制: ${process.env.MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }

  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'ERROR',
      message: message
    }
  });
};

