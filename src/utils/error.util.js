/**
 * 创建自定义错误对象
 * @param {number} statusCode - HTTP状态码
 * @param {string} message - 错误消息
 * @param {string} code - 错误代码（可选）
 * @returns {Error} 自定义错误对象
 */
exports.createError = (statusCode, message, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  return error;
};

