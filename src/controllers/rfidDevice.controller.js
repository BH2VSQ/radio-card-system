const RfidDevice = require('../models/rfidDevice.model');
const RfidLog = require('../models/rfidLog.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    创建RFID设备
 * @route   POST /api/rfid-devices
 * @access  Private
 */
exports.createRfidDevice = async (req, res, next) => {
  try {
    const { 
      name, 
      deviceType, 
      model, 
      serialNumber, 
      connectionInfo, 
      supportedCardTypes,
      firmwareVersion,
      settings,
      notes
    } = req.body;
    
    // 验证输入
    if (!name) {
      return next(createError(400, '设备名称是必填项'));
    }
    
    // 检查设备名称是否已存在
    const existingDevice = await RfidDevice.findOne({
      userId: req.user.id,
      name
    });
    
    if (existingDevice) {
      return next(createError(400, '设备名称已存在'));
    }
    
    // 创建设备
    const device = new RfidDevice({
      userId: req.user.id,
      name,
      deviceType: deviceType || 'USB',
      model,
      serialNumber,
      connectionInfo: connectionInfo || {},
      supportedCardTypes: supportedCardTypes || ['MIFARE Classic'],
      firmwareVersion,
      settings: settings || {},
      notes
    });
    
    await device.save();
    
    // 记录日志
    await new RfidLog({
      userId: req.user.id,
      deviceId: device._id,
      operationType: 'connect',
      status: 'info',
      message: '创建RFID设备',
      details: {
        deviceName: device.name,
        deviceType: device.deviceType
      }
    }).save();
    
    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取RFID设备列表
 * @route   GET /api/rfid-devices
 * @access  Private
 */
exports.getRfidDevices = async (req, res, next) => {
  try {
    const { status, type, search, sort, order } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.deviceType = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 排序
    const sortField = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };
    
    // 执行查询
    const devices = await RfidDevice.find(query).sort(sortOptions);
    
    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取RFID设备详情
 * @route   GET /api/rfid-devices/:id
 * @access  Private
 */
exports.getRfidDeviceById = async (req, res, next) => {
  try {
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新RFID设备
 * @route   PUT /api/rfid-devices/:id
 * @access  Private
 */
exports.updateRfidDevice = async (req, res, next) => {
  try {
    const { 
      name, 
      deviceType, 
      model, 
      serialNumber, 
      connectionInfo, 
      supportedCardTypes,
      firmwareVersion,
      settings,
      notes,
      status
    } = req.body;
    
    // 查找设备
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 如果更改了名称，检查是否与其他设备重名
    if (name && name !== device.name) {
      const existingDevice = await RfidDevice.findOne({
        userId: req.user.id,
        name,
        _id: { $ne: device._id }
      });
      
      if (existingDevice) {
        return next(createError(400, '设备名称已存在'));
      }
    }
    
    // 更新设备
    if (name) device.name = name;
    if (deviceType) device.deviceType = deviceType;
    if (model) device.model = model;
    if (serialNumber) device.serialNumber = serialNumber;
    if (connectionInfo) device.connectionInfo = { ...device.connectionInfo, ...connectionInfo };
    if (supportedCardTypes) device.supportedCardTypes = supportedCardTypes;
    if (firmwareVersion) device.firmwareVersion = firmwareVersion;
    if (settings) device.settings = { ...device.settings, ...settings };
    if (notes !== undefined) device.notes = notes;
    if (status) device.status = status;
    
    await device.save();
    
    // 记录日志
    await new RfidLog({
      userId: req.user.id,
      deviceId: device._id,
      operationType: 'connect',
      status: 'info',
      message: '更新RFID设备',
      details: {
        deviceName: device.name,
        deviceType: device.deviceType,
        updatedFields: Object.keys(req.body)
      }
    }).save();
    
    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除RFID设备
 * @route   DELETE /api/rfid-devices/:id
 * @access  Private
 */
exports.deleteRfidDevice = async (req, res, next) => {
  try {
    // 查找设备
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 记录日志
    await new RfidLog({
      userId: req.user.id,
      deviceId: device._id,
      operationType: 'disconnect',
      status: 'info',
      message: '删除RFID设备',
      details: {
        deviceName: device.name,
        deviceType: device.deviceType
      }
    }).save();
    
    // 删除设备
    await device.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {
        message: 'RFID设备已删除'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    连接RFID设备
 * @route   POST /api/rfid-devices/:id/connect
 * @access  Private
 */
exports.connectRfidDevice = async (req, res, next) => {
  try {
    // 查找设备
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 模拟连接设备
    // 在实际应用中，这里会与RFID硬件设备通信
    
    // 更新设备状态
    device.isConnected = true;
    device.lastConnected = new Date();
    device.status = 'active';
    await device.save();
    
    // 记录日志
    await new RfidLog({
      userId: req.user.id,
      deviceId: device._id,
      operationType: 'connect',
      status: 'success',
      message: '连接RFID设备',
      details: {
        deviceName: device.name,
        deviceType: device.deviceType,
        connectionTime: device.lastConnected
      }
    }).save();
    
    res.status(200).json({
      success: true,
      data: {
        device,
        message: 'RFID设备已连接'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    断开RFID设备连接
 * @route   POST /api/rfid-devices/:id/disconnect
 * @access  Private
 */
exports.disconnectRfidDevice = async (req, res, next) => {
  try {
    // 查找设备
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 模拟断开设备连接
    // 在实际应用中，这里会与RFID硬件设备通信
    
    // 更新设备状态
    device.isConnected = false;
    device.lastDisconnected = new Date();
    device.status = 'inactive';
    await device.save();
    
    // 记录日志
    await new RfidLog({
      userId: req.user.id,
      deviceId: device._id,
      operationType: 'disconnect',
      status: 'success',
      message: '断开RFID设备连接',
      details: {
        deviceName: device.name,
        deviceType: device.deviceType,
        disconnectionTime: device.lastDisconnected
      }
    }).save();
    
    res.status(200).json({
      success: true,
      data: {
        device,
        message: 'RFID设备已断开连接'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取RFID设备状态
 * @route   GET /api/rfid-devices/:id/status
 * @access  Private
 */
exports.getRfidDeviceStatus = async (req, res, next) => {
  try {
    // 查找设备
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 模拟获取设备状态
    // 在实际应用中，这里会与RFID硬件设备通信
    
    res.status(200).json({
      success: true,
      data: {
        id: device._id,
        name: device.name,
        isConnected: device.isConnected,
        status: device.status,
        lastConnected: device.lastConnected,
        lastDisconnected: device.lastDisconnected
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取RFID设备日志
 * @route   GET /api/rfid-devices/:id/logs
 * @access  Private
 */
exports.getRfidDeviceLogs = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, status, operationType } = req.query;
    
    // 查找设备
    const device = await RfidDevice.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!device) {
      return next(createError(404, 'RFID设备不存在'));
    }
    
    // 构建查询条件
    const query = {
      userId: req.user.id,
      deviceId: device._id
    };
    
    if (status) {
      query.status = status;
    }
    
    if (operationType) {
      query.operationType = operationType;
    }
    
    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 执行查询
    const logs = await RfidLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 获取总数
    const total = await RfidLog.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

