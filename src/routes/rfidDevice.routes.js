const express = require('express');
const router = express.Router();
const { 
  createRfidDevice,
  getRfidDevices,
  getRfidDeviceById,
  updateRfidDevice,
  deleteRfidDevice,
  connectRfidDevice,
  disconnectRfidDevice,
  getRfidDeviceStatus,
  getRfidDeviceLogs
} = require('../controllers/rfidDevice.controller');

// 创建RFID设备
router.post('/', createRfidDevice);

// 获取RFID设备列表
router.get('/', getRfidDevices);

// 获取RFID设备详情
router.get('/:id', getRfidDeviceById);

// 更新RFID设备
router.put('/:id', updateRfidDevice);

// 删除RFID设备
router.delete('/:id', deleteRfidDevice);

// 连接RFID设备
router.post('/:id/connect', connectRfidDevice);

// 断开RFID设备连接
router.post('/:id/disconnect', disconnectRfidDevice);

// 获取RFID设备状态
router.get('/:id/status', getRfidDeviceStatus);

// 获取RFID设备日志
router.get('/:id/logs', getRfidDeviceLogs);

module.exports = router;

