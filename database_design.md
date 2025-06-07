# 业余无线电卡片管理入库系统 - 数据库设计

## 1. 数据库概述

本系统采用MongoDB作为数据库，主要考虑以下因素：

1. **灵活的数据模型**：业余无线电卡片的信息格式可能多样化，MongoDB的文档模型能够灵活适应不同的数据结构。
2. **良好的扩展性**：随着系统功能的扩展，MongoDB可以轻松地添加新的字段和集合。
3. **高性能**：MongoDB对于读写操作有良好的性能表现，适合卡片管理系统的查询需求。
4. **与Node.js的良好集成**：MongoDB与Node.js生态系统有很好的集成，通过Mongoose可以方便地进行对象文档映射。

## 2. 数据模型设计

### 2.1 用户模型（User）

用户模型用于存储系统用户的信息，包括管理员和普通用户。

```javascript
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的电子邮箱地址']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    trim: true
  },
  callsign: {
    type: String,
    trim: true
  },
  qth: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});
```

### 2.2 卡片模型（Card）

卡片模型是系统的核心数据模型，用于存储业余无线电QSL卡片的详细信息。

```javascript
const CardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callsign: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  qth: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    index: true
  },
  contactDate: {
    type: Date,
    required: true,
    index: true
  },
  frequency: {
    type: Number,
    required: true
  },
  band: {
    type: String,
    trim: true,
    index: true
  },
  mode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  rstSent: {
    type: String,
    trim: true
  },
  rstReceived: {
    type: String,
    trim: true
  },
  qslStatus: {
    type: String,
    enum: ['pending', 'sent', 'received', 'confirmed'],
    default: 'pending',
    index: true
  },
  imageUrls: [{
    type: String
  }],
  qrCode: {
    type: String
  },
  rfidTag: {
    uid: {
      type: String,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['MIFARE Classic', 'MIFARE Ultralight', 'NTAG213', 'NTAG215', 'NTAG216', 'other'],
      default: 'other'
    },
    lastRead: {
      type: Date
    },
    lastWrite: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lost', 'damaged'],
      default: 'active'
    }
  },
  notes: {
    type: String
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引
CardSchema.index({ location: '2dsphere' });
CardSchema.index({ userId: 1, callsign: 1 });
CardSchema.index({ userId: 1, contactDate: -1 });
CardSchema.index({ 'rfidTag.uid': 1 });
```

### 2.3 分类模型（Category）

分类模型用于对卡片进行分类管理，支持层级分类结构。

```javascript
const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 创建索引
CategorySchema.index({ userId: 1, name: 1 });
CategorySchema.index({ parentId: 1 });
```

### 2.4 标签模型（Tag）

标签模型用于为卡片添加灵活的标签，便于快速筛选和查找。

```javascript
const TagSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#1890ff'
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 创建索引
TagSchema.index({ userId: 1, name: 1 }, { unique: true });
```

### 2.5 日志模型（Log）

日志模型用于记录系统操作日志，便于审计和问题排查。

```javascript
const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'register', 'export', 'import', 'other']
  },
  target: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  detail: {
    type: String
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// 创建索引
LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ action: 1 });
LogSchema.index({ target: 1, targetId: 1 });
```

### 2.6 设置模型（Setting）

设置模型用于存储系统全局设置和用户个人设置。

```javascript
const SettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引
SettingSchema.index({ userId: 1, key: 1 }, { unique: true });
SettingSchema.index({ isSystem: 1, key: 1 });
```

### 2.7 导入导出任务模型（ImportExportTask）

导入导出任务模型用于记录和管理数据导入导出任务。

```javascript
const ImportExportTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['import', 'export'],
    required: true
  },
  format: {
    type: String,
    enum: ['csv', 'excel', 'pdf', 'json'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  filePath: {
    type: String
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  processedRecords: {
    type: Number,
    default: 0
  },
  errorRecords: {
    type: Number,
    default: 0
  },
  errorDetails: {
    type: String
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

// 创建索引
ImportExportTaskSchema.index({ userId: 1, createdAt: -1 });
ImportExportTaskSchema.index({ status: 1 });
```

### 2.8 通知模型（Notification）

通知模型用于存储和管理系统通知和用户消息。

```javascript
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'card', 'user', 'other'],
    default: 'system'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 创建索引
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
```

## 3. 数据关系

### 3.1 用户与卡片

- 一个用户可以拥有多张卡片（一对多关系）
- 通过卡片模型中的`userId`字段关联到用户

### 3.2 用户与分类

- 一个用户可以创建多个分类（一对多关系）
- 通过分类模型中的`userId`字段关联到用户

### 3.3 用户与标签

- 一个用户可以创建多个标签（一对多关系）
- 通过标签模型中的`userId`字段关联到用户

### 3.4 卡片与分类

- 一张卡片可以属于多个分类，一个分类可以包含多张卡片（多对多关系）
- 通过卡片模型中的`categories`数组字段实现多对多关系

### 3.5 卡片与标签

- 一张卡片可以有多个标签，一个标签可以应用于多张卡片（多对多关系）
- 通过卡片模型中的`tags`数组字段实现多对多关系

### 3.6 分类的层级关系

- 分类之间可以形成层级关系（树形结构）
- 通过分类模型中的`parentId`字段实现层级关系

## 4. 索引策略

为了提高查询性能，系统在各个集合上创建了以下索引：

### 4.1 用户集合索引

- `username`：唯一索引，提高用户名查询性能
- `email`：唯一索引，提高邮箱查询性能

### 4.2 卡片集合索引

- `userId`和`callsign`：复合索引，提高特定用户下按呼号查询的性能
- `userId`和`contactDate`：复合索引，提高特定用户下按联络日期排序的性能
- `callsign`、`country`、`band`、`mode`、`qslStatus`：单字段索引，提高按这些字段筛选的性能
- `location`：地理空间索引，支持地理位置查询
- `categories`和`tags`：多键索引，提高按分类和标签筛选的性能

### 4.3 分类集合索引

- `userId`和`name`：复合索引，提高特定用户下按分类名称查询的性能
- `parentId`：单字段索引，提高查询子分类的性能

### 4.4 标签集合索引

- `userId`和`name`：唯一复合索引，确保特定用户下标签名称的唯一性

### 4.5 日志集合索引

- `userId`和`createdAt`：复合索引，提高查询特定用户的操作日志并按时间排序的性能
- `action`和`target`：单字段索引，提高按操作类型和目标筛选的性能

## 5. 数据验证与约束

系统使用Mongoose提供的验证功能，对数据进行验证和约束：

### 5.1 字段验证

- 必填字段：使用`required: true`标记必填字段
- 字符串长度：使用`minlength`和`maxlength`限制字符串长度
- 数值范围：使用`min`和`max`限制数值范围
- 枚举值：使用`enum`限制字段值在指定范围内
- 正则表达式：使用`match`验证字段格式（如邮箱格式）

### 5.2 唯一性约束

- 用户名和邮箱：在用户集合中设置唯一索引，确保用户名和邮箱的唯一性
- 标签名称：在标签集合中设置用户ID和标签名称的唯一复合索引，确保同一用户下标签名称的唯一性

### 5.3 引用完整性

- 使用Mongoose中间件在删除用户时级联删除相关的卡片、分类和标签
- 使用Mongoose中间件在删除分类时更新相关卡片的分类引用
- 使用Mongoose中间件在删除标签时更新相关卡片的标签引用

## 6. 数据迁移与版本控制

为了支持系统的迭代更新和数据模型的演化，系统将采用以下策略：

### 6.1 数据迁移

- 使用MongoDB的更新操作符（如`$set`、`$unset`、`$rename`）进行数据迁移
- 对于复杂的迁移，编写专门的迁移脚本
- 在系统启动时检查数据库版本，并自动执行必要的迁移

### 6.2 版本控制

- 在设置集合中存储数据库版本信息
- 每次系统更新时，检查并更新数据库版本
- 保留迁移历史记录，便于回滚和审计

## 7. 数据备份与恢复

为了确保数据安全，系统将实现以下备份与恢复策略：

### 7.1 自动备份

- 定期（如每日）自动备份数据库
- 备份文件包含时间戳，便于识别和管理
- 保留一定数量的历史备份，自动清理过期备份

### 7.2 手动备份

- 提供管理员手动触发备份的功能
- 支持导出特定集合或整个数据库

### 7.3 数据恢复

- 提供从备份文件恢复数据的功能
- 支持选择性恢复特定集合或整个数据库

## 8. 性能优化策略

为了确保系统在数据量增长时仍能保持良好的性能，系统将采用以下优化策略：

### 8.1 查询优化

- 合理使用索引，避免全集合扫描
- 使用投影（Projection）减少返回的字段数量
- 使用分页限制返回的文档数量
- 使用聚合管道优化复杂查询

### 8.2 写入优化

- 使用批量操作减少数据库交互次数
- 适当使用`bulkWrite`操作提高写入效率
- 对于非关键更新，考虑使用异步更新

### 8.3 连接池管理

- 配置合适的连接池大小，避免连接资源不足或过度占用
- 监控连接池状态，及时调整参数

### 8.4 缓存策略

- 使用内存缓存（如Redis）缓存热点数据
- 实现缓存失效机制，确保数据一致性

## 9. 安全措施

为了保护数据安全，系统将实现以下安全措施：

### 9.1 数据加密

- 用户密码使用bcrypt等算法加密存储
- 敏感信息（如API密钥）加密存储

### 9.2 访问控制

- 实现基于角色的访问控制（RBAC）
- 对数据库操作进行权限检查
- 使用中间件验证API请求的权限

### 9.3 防注入攻击

- 使用Mongoose的参数化查询，避免NoSQL注入
- 对用户输入进行严格验证和过滤

### 9.4 审计日志

- 记录关键操作的审计日志
- 定期审查日志，发现异常行为

## 10. 总结

本文档详细设计了业余无线电卡片管理入库系统的数据库模型，包括用户、卡片、分类、标签等核心实体的数据结构，以及它们之间的关系。同时，文档还规划了索引策略、数据验证、版本控制、备份恢复和性能优化等方面的内容，为系统的实现提供了全面的数据库设计指导。

通过合理的数据库设计，系统将能够高效地存储和管理业余无线电卡片信息，支持二维码标签管理和分类整理等核心功能，并为后续功能扩展提供良好的数据基础。



### 2.9 RFID设备模型（RfidDevice）

RFID设备模型用于管理系统中的RFID读写设备。

```javascript
const RfidDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  deviceType: {
    type: String,
    enum: ['reader', 'reader-writer'],
    default: 'reader-writer'
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  connectionType: {
    type: String,
    enum: ['usb', 'serial', 'network', 'bluetooth'],
    default: 'usb'
  },
  connectionParams: {
    port: {
      type: String,
      trim: true
    },
    baudRate: {
      type: Number
    },
    ipAddress: {
      type: String,
      trim: true
    },
    macAddress: {
      type: String,
      trim: true
    }
  },
  supportedCardTypes: [{
    type: String,
    enum: ['MIFARE Classic', 'MIFARE Ultralight', 'NTAG213', 'NTAG215', 'NTAG216', 'other']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastConnected: {
    type: Date
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// 创建索引
RfidDeviceSchema.index({ userId: 1, name: 1 });
RfidDeviceSchema.index({ status: 1 });
```

### 2.10 RFID操作日志模型（RfidOperationLog）

RFID操作日志模型用于记录RFID设备的操作历史。

```javascript
const RfidOperationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RfidDevice',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  tagUid: {
    type: String,
    trim: true,
    required: true
  },
  operationType: {
    type: String,
    enum: ['read', 'write', 'detect', 'error'],
    required: true
  },
  operationResult: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  errorMessage: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 创建索引
RfidOperationLogSchema.index({ userId: 1, createdAt: -1 });
RfidOperationLogSchema.index({ deviceId: 1, createdAt: -1 });
RfidOperationLogSchema.index({ tagUid: 1 });
RfidOperationLogSchema.index({ operationType: 1, operationResult: 1 });
```


### 3.7 用户与RFID设备

- 一个用户可以拥有多个RFID设备（一对多关系）
- 通过RFID设备模型中的`userId`字段关联到用户

### 3.8 RFID设备与操作日志

- 一个RFID设备可以产生多条操作日志（一对多关系）
- 通过RFID操作日志模型中的`deviceId`字段关联到RFID设备

### 3.9 卡片与RFID标签

- 一张卡片可以绑定一个RFID标签（一对一关系）
- 通过卡片模型中的`rfidTag`嵌入式文档存储RFID标签信息

### 3.10 RFID操作日志与卡片

- 一条RFID操作日志可以关联到一张卡片（多对一关系）
- 通过RFID操作日志模型中的`cardId`字段关联到卡片


### 4.6 RFID设备集合索引

- `userId`和`name`：复合索引，提高特定用户下按设备名称查询的性能
- `status`：单字段索引，提高按设备状态筛选的性能

### 4.7 RFID操作日志集合索引

- `userId`和`createdAt`：复合索引，提高查询特定用户的操作日志并按时间排序的性能
- `deviceId`和`createdAt`：复合索引，提高查询特定设备的操作日志并按时间排序的性能
- `tagUid`：单字段索引，提高按RFID标签UID查询的性能
- `operationType`和`operationResult`：复合索引，提高按操作类型和结果筛选的性能


### 2.11 EYEBALL卡模型扩展

为了支持EYEBALL卡（目视确认卡）的记录存档，我们在卡片模型中添加了专门的字段：

```javascript
// 在CardSchema中添加eyeballInfo字段
eyeballInfo: {
  isEyeball: {
    type: Boolean,
    default: false,
    index: true
  },
  meetingType: {
    type: String,
    enum: ['hamfest', 'convention', 'club_meeting', 'personal_visit', 'field_day', 'contest', 'other'],
    trim: true
  },
  meetingLocation: {
    type: String,
    trim: true
  },
  meetingDate: {
    type: Date
  },
  meetingName: {
    type: String,
    trim: true
  },
  witnesses: [{
    name: {
      type: String,
      trim: true
    },
    callsign: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  }],
  verificationMethod: {
    type: String,
    enum: ['in_person', 'photo', 'video', 'third_party', 'other'],
    default: 'in_person'
  },
  verificationDetails: {
    type: String
  },
  verificationMedia: [{
    type: String // 存储照片或视频的URL
  }]
}

// 添加相关索引
CardSchema.index({ 'eyeballInfo.isEyeball': 1 });
CardSchema.index({ 'eyeballInfo.meetingDate': 1 });
CardSchema.index({ 'eyeballInfo.meetingType': 1 });
```

EYEBALL卡模型扩展包含以下主要字段：

1. **isEyeball**: 标识该卡片是否为EYEBALL卡
2. **meetingType**: 目视确认的场合类型（如业余无线电大会、俱乐部会议、个人访问等）
3. **meetingLocation**: 目视确认的地点
4. **meetingDate**: 目视确认的日期（可能与通联日期不同）
5. **meetingName**: 会议或活动的名称
6. **witnesses**: 证人信息，包括姓名、呼号和联系方式
7. **verificationMethod**: 验证方式（如面对面、照片、视频等）
8. **verificationDetails**: 验证的详细说明
9. **verificationMedia**: 验证媒体（如照片或视频的URL）

通过这些字段，系统可以详细记录EYEBALL卡的特殊信息，支持EYEBALL卡的管理和查询功能。


## 11. 卡片种类与发卡功能扩展

根据用户需求，我们对系统进行了进一步扩展，添加了卡片种类细分和发卡功能。

### 11.1 卡片种类扩展

在卡片模型中，我们添加了`contactType`字段，用于细分卡片种类：

```javascript
// 在CardSchema中添加contactType字段
contactType: {
  type: String,
  enum: ['satellite', 'shortwave', 'repeater', 'direct', 'eyeball_offline', 'eyeball_online', 'other'],
  default: 'shortwave',
  index: true
},
```

各种类说明：
- `satellite`: 卫星通联
- `shortwave`: 短波通联
- `repeater`: 中继通联
- `direct`: 本地直频通联
- `eyeball_offline`: 线下EYEBALL
- `eyeball_online`: 线上EYEBALL
- `other`: 其他类型

### 11.2 发卡功能

为了支持发卡功能，我们添加了一个新的发卡模型（SentCard）：

```javascript
const SentCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callsign: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  qth: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    index: true
  },
  contactDate: {
    type: Date,
    required: true,
    index: true
  },
  frequency: {
    type: Number,
    required: true
  },
  band: {
    type: String,
    trim: true,
    index: true
  },
  mode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  contactType: {
    type: String,
    enum: ['satellite', 'shortwave', 'repeater', 'direct', 'eyeball_offline', 'eyeball_online', 'other'],
    default: 'shortwave',
    index: true
  },
  rstSent: {
    type: String,
    trim: true
  },
  rstReceived: {
    type: String,
    trim: true
  },
  qslStatus: {
    type: String,
    enum: ['pending', 'sent', 'received', 'confirmed'],
    default: 'pending',
    index: true
  },
  sentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  receivedCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    default: null
  },
  isReceived: {
    type: Boolean,
    default: false,
    index: true
  },
  receivedDate: {
    type: Date
  },
  imageUrls: [{
    type: String
  }],
  qrCode: {
    type: String
  },
  rfidTag: {
    uid: {
      type: String,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['MIFARE Classic', 'MIFARE Ultralight', 'NTAG213', 'NTAG215', 'NTAG216', 'other'],
      default: 'other'
    },
    lastRead: {
      type: Date
    },
    lastWrite: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'lost', 'damaged'],
      default: 'active'
    }
  },
  notes: {
    type: String
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引
SentCardSchema.index({ userId: 1, callsign: 1 });
SentCardSchema.index({ userId: 1, contactDate: -1 });
SentCardSchema.index({ userId: 1, sentDate: -1 });
SentCardSchema.index({ userId: 1, isReceived: 1 });
SentCardSchema.index({ 'rfidTag.uid': 1 });
```

### 11.3 收发卡关联

为了建立收发卡的关联关系，我们在卡片模型（Card）中添加了`sentCard`字段，用于关联到发出的卡片：

```javascript
// 在CardSchema中添加sentCard字段
sentCard: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'SentCard',
  default: null
},
```

同时，在发卡模型（SentCard）中添加了`receivedCard`字段，用于关联到收到的回卡。

### 11.4 数据关系

#### 11.4.1 发卡与收卡关系

- 一张发出的卡片可以关联到一张收到的回卡（一对一关系）
- 通过发卡模型中的`receivedCard`字段和卡片模型中的`sentCard`字段建立双向关联

#### 11.4.2 用户与发卡关系

- 一个用户可以发出多张卡片（一对多关系）
- 通过发卡模型中的`userId`字段关联到用户

### 11.5 RFID标签可选功能

为了支持RFID标签作为可选功能，我们在系统中添加了相关的验证和处理逻辑：

1. 在添加卡片时，RFID标签信息为可选字段
2. 在卡片详情页面中，提供后续添加或更新RFID标签信息的功能
3. 在RFID标签管理界面中，支持批量绑定RFID标签到已有卡片

这样的设计使得用户可以灵活选择是否使用RFID标签功能，既可以在卡片入库时直接写入RFID信息，也可以在后续需要时再添加。

