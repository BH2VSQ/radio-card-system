require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');

// 导入路由
const authRoutes = require('./routes/auth.routes');
const cardRoutes = require('./routes/card.routes');
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');
const qrcodeRoutes = require('./routes/qrcode.routes');
const rfidRoutes = require('./routes/rfid.routes');
const rfidDeviceRoutes = require('./routes/rfidDevice.routes');
const eyeballCardRoutes = require('./routes/eyeballCard.routes');
const sentCardRoutes = require('./routes/sentCard.routes');
const certificateRoutes = require('./routes/certificate.routes');
const callsignAssociationRoutes = require('./routes/callsignAssociation.routes');
const callsignProfileRoutes = require('./routes/callsignProfile.routes');

// 导入中间件
const { errorHandler } = require('./middleware/error.middleware');
const { authMiddleware } = require('./middleware/auth.middleware');

// 导入证书控制器
const { createDefaultTemplates } = require('./controllers/certificate.controller');

// 创建Express应用
const app = express();

// 初始化数据库连接
async function initializeDatabase() {
  try {
    // 连接MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB连接成功');
    
    // 创建默认证书模板
    createDefaultTemplates();
  } catch (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
}

// 初始化数据库
initializeDatabase();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', authMiddleware, cardRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/tags', authMiddleware, tagRoutes);
app.use('/api/qrcodes', authMiddleware, qrcodeRoutes);
app.use('/api/rfid', authMiddleware, rfidRoutes);
app.use('/api/rfid-devices', authMiddleware, rfidDeviceRoutes);
app.use('/api/eyeball-cards', authMiddleware, eyeballCardRoutes);
app.use('/api/sent-cards', authMiddleware, sentCardRoutes);
app.use('/api/certificates', authMiddleware, certificateRoutes);
app.use('/api/callsign-associations', authMiddleware, callsignAssociationRoutes);
app.use('/api/callsign-profiles', callsignProfileRoutes);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;

