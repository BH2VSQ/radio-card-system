const mongoose = require('mongoose');

// 数据库连接管理器
class DatabaseManager {
  constructor() {
    this.connections = new Map();
    this.mainConnection = null;
  }

  // 初始化主数据库连接（用于用户认证和管理）
  async initMainConnection() {
    if (!this.mainConnection) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/radio-card-system';
      this.mainConnection = await mongoose.createConnection(mongoUri);
      console.log('主数据库连接成功');
    }
    return this.mainConnection;
  }

  // 获取或创建用户专属数据库连接
  async getUserConnection(userDatabaseName) {
    if (!userDatabaseName) {
      throw new Error('用户数据库名称不能为空');
    }

    // 如果连接已存在，直接返回
    if (this.connections.has(userDatabaseName)) {
      return this.connections.get(userDatabaseName);
    }

    // 创建新的用户数据库连接
    const mongoBaseUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const userMongoUri = mongoBaseUri.replace(/\/[^\/]*$/, `/${userDatabaseName}`);
    
    try {
      const userConnection = await mongoose.createConnection(userMongoUri);
      this.connections.set(userDatabaseName, userConnection);
      console.log(`用户数据库连接成功: ${userDatabaseName}`);
      
      // 为用户数据库注册模型
      await this.registerUserModels(userConnection);
      
      return userConnection;
    } catch (error) {
      console.error(`用户数据库连接失败: ${userDatabaseName}`, error);
      throw error;
    }
  }

  // 为用户数据库注册模型
  async registerUserModels(connection) {
    // 注册卡片模型
    const CardSchema = require('../models/card.model').schema;
    connection.model('Card', CardSchema);

    // 注册呼号档案模型
    const CallsignProfileSchema = require('../models/callsignProfile.model').schema;
    connection.model('CallsignProfile', CallsignProfileSchema);

    // 注册其他用户相关模型
    const CategorySchema = require('../models/category.model').schema;
    connection.model('Category', CategorySchema);

    const TagSchema = require('../models/tag.model').schema;
    connection.model('Tag', TagSchema);

    const SentCardSchema = require('../models/sentCard.model').schema;
    connection.model('SentCard', SentCardSchema);

    const CertificateSchema = require('../models/certificate.model').schema;
    connection.model('Certificate', CertificateSchema);

    const CertificateTemplateSchema = require('../models/certificateTemplate.model').schema;
    connection.model('CertificateTemplate', CertificateTemplateSchema);

    const RfidDeviceSchema = require('../models/rfidDevice.model').schema;
    connection.model('RfidDevice', RfidDeviceSchema);

    const RfidLogSchema = require('../models/rfidLog.model').schema;
    connection.model('RfidLog', RfidLogSchema);

    const CallsignAssociationSchema = require('../models/callsignAssociation.model').schema;
    connection.model('CallsignAssociation', CallsignAssociationSchema);
  }

  // 获取主数据库连接
  getMainConnection() {
    if (!this.mainConnection) {
      throw new Error('主数据库连接未初始化');
    }
    return this.mainConnection;
  }

  // 关闭用户数据库连接
  async closeUserConnection(userDatabaseName) {
    if (this.connections.has(userDatabaseName)) {
      const connection = this.connections.get(userDatabaseName);
      await connection.close();
      this.connections.delete(userDatabaseName);
      console.log(`用户数据库连接已关闭: ${userDatabaseName}`);
    }
  }

  // 关闭所有连接
  async closeAllConnections() {
    // 关闭所有用户数据库连接
    for (const [dbName, connection] of this.connections) {
      await connection.close();
      console.log(`用户数据库连接已关闭: ${dbName}`);
    }
    this.connections.clear();

    // 关闭主数据库连接
    if (this.mainConnection) {
      await this.mainConnection.close();
      this.mainConnection = null;
      console.log('主数据库连接已关闭');
    }
  }

  // 创建用户数据库并初始化默认数据
  async createUserDatabase(userDatabaseName, userId) {
    try {
      const userConnection = await this.getUserConnection(userDatabaseName);
      
      // 创建默认呼号档案（如果用户在注册时提供了呼号）
      const User = this.getMainConnection().model('User');
      const user = await User.findById(userId);
      
      if (user && user.callsign) {
        const CallsignProfile = userConnection.model('CallsignProfile');
        const defaultProfile = new CallsignProfile({
          userId: userId,
          callsignName: user.callsign,
          qth: user.qth || '',
          isDefault: true,
          isActive: true
        });
        
        await defaultProfile.save();
        
        // 更新用户的默认呼号档案ID
        user.defaultCallsignProfile = defaultProfile._id;
        await user.save();
        
        console.log(`为用户 ${userId} 创建了默认呼号档案: ${user.callsign}`);
      }
      
      return userConnection;
    } catch (error) {
      console.error(`创建用户数据库失败: ${userDatabaseName}`, error);
      throw error;
    }
  }
}

// 导出单例实例
module.exports = new DatabaseManager();

