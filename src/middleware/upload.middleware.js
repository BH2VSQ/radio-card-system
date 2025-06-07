const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError } = require('../utils/error.util');

// 确保上传目录存在
const createUploadDir = (dir) => {
  const uploadDir = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据文件类型选择不同的目录
    let uploadDir = 'uploads';
    
    if (req.originalUrl.includes('/eyeball-cards')) {
      uploadDir = 'uploads/eyeball';
    } else if (req.originalUrl.includes('/cards')) {
      uploadDir = 'uploads/cards';
    }
    
    // 确保目录存在
    createUploadDir(uploadDir);
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(createError(400, '只允许上传图片和视频文件'));
  }
};

// 创建上传中间件
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 默认5MB
  },
  fileFilter: fileFilter
});

module.exports = { upload };

