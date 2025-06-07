# 业余无线电卡片管理入库系统 - API设计

## 1. API概述

本文档详细设计了业余无线电卡片管理入库系统的API接口，采用RESTful风格设计，提供JSON格式的数据交换。API接口主要分为用户管理、卡片管理、标签识别（二维码和RFID）、分类管理、标签管理、导入导出和系统设置等模块。

### 1.1 API基础信息

- **基础URL**: `/api`
- **版本控制**: 通过URL路径进行版本控制，如`/api/v1`
- **认证方式**: JWT (JSON Web Token)
- **数据格式**: JSON
- **状态码**:
  - 200: 成功
  - 201: 创建成功
  - 400: 请求错误
  - 401: 未授权
  - 403: 禁止访问
  - 404: 资源不存在
  - 500: 服务器错误

### 1.2 通用响应格式

```json
{
  "success": true/false,
  "data": {}, // 响应数据，成功时返回
  "error": {  // 错误信息，失败时返回
    "code": "ERROR_CODE",
    "message": "错误描述"
  },
  "meta": {   // 元数据，如分页信息
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## 2. 认证接口

### 2.1 用户注册

- **URL**: `/api/auth/register`
- **方法**: `POST`
- **描述**: 注册新用户
- **请求体**:
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "password123",
    "fullName": "张三",
    "callsign": "BG1ABC"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "fullName": "张三",
      "callsign": "BG1ABC",
      "role": "user",
      "createdAt": "2023-06-22T10:00:00Z"
    }
  }
  ```

### 2.2 用户登录

- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录并获取访问令牌
- **请求体**:
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "username": "user123",
        "email": "user@example.com",
        "fullName": "张三",
        "callsign": "BG1ABC",
        "role": "user"
      }
    }
  }
  ```

### 2.3 刷新令牌

- **URL**: `/api/auth/refresh-token`
- **方法**: `POST`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求头**: `Authorization: Bearer <refresh_token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 2.4 修改密码

- **URL**: `/api/auth/change-password`
- **方法**: `PUT`
- **描述**: 修改用户密码
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "currentPassword": "password123",
    "newPassword": "newPassword123"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "密码修改成功"
    }
  }
  ```

### 2.5 忘记密码

- **URL**: `/api/auth/forgot-password`
- **方法**: `POST`
- **描述**: 发送密码重置邮件
- **请求体**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "密码重置邮件已发送"
    }
  }
  ```

### 2.6 重置密码

- **URL**: `/api/auth/reset-password`
- **方法**: `POST`
- **描述**: 使用重置令牌重置密码
- **请求体**:
  ```json
  {
    "token": "reset_token",
    "newPassword": "newPassword123"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "密码重置成功"
    }
  }
  ```

## 3. 用户接口

### 3.1 获取当前用户信息

- **URL**: `/api/users/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "fullName": "张三",
      "callsign": "BG1ABC",
      "qth": "北京",
      "role": "user",
      "avatar": "https://example.com/avatar.jpg",
      "lastLogin": "2023-06-22T10:00:00Z",
      "createdAt": "2023-06-01T10:00:00Z",
      "updatedAt": "2023-06-22T10:00:00Z"
    }
  }
  ```

### 3.2 更新用户信息

- **URL**: `/api/users/me`
- **方法**: `PUT`
- **描述**: 更新当前登录用户的信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "fullName": "李四",
    "callsign": "BG1XYZ",
    "qth": "上海",
    "avatar": "https://example.com/new-avatar.jpg"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "fullName": "李四",
      "callsign": "BG1XYZ",
      "qth": "上海",
      "role": "user",
      "avatar": "https://example.com/new-avatar.jpg",
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 3.3 获取用户列表（管理员）

- **URL**: `/api/users`
- **方法**: `GET`
- **描述**: 获取所有用户的列表（仅管理员可用）
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `search`: 搜索关键词
  - `role`: 角色筛选
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "username": "user123",
        "email": "user@example.com",
        "fullName": "李四",
        "callsign": "BG1XYZ",
        "role": "user",
        "isActive": true,
        "lastLogin": "2023-06-22T10:00:00Z",
        "createdAt": "2023-06-01T10:00:00Z"
      },
      // 更多用户...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "pages": 10
      }
    }
  }
  ```

### 3.4 获取用户详情（管理员）

- **URL**: `/api/users/:id`
- **方法**: `GET`
- **描述**: 获取指定用户的详细信息（仅管理员可用）
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "fullName": "李四",
      "callsign": "BG1XYZ",
      "qth": "上海",
      "role": "user",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "lastLogin": "2023-06-22T10:00:00Z",
      "createdAt": "2023-06-01T10:00:00Z",
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 3.5 更新用户信息（管理员）

- **URL**: `/api/users/:id`
- **方法**: `PUT`
- **描述**: 更新指定用户的信息（仅管理员可用）
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "fullName": "王五",
    "callsign": "BG1ABC",
    "role": "admin",
    "isActive": true
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "fullName": "王五",
      "callsign": "BG1ABC",
      "role": "admin",
      "isActive": true,
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 3.6 删除用户（管理员）

- **URL**: `/api/users/:id`
- **方法**: `DELETE`
- **描述**: 删除指定用户（仅管理员可用）
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "用户删除成功"
    }
  }
  ```

## 4. 卡片接口

### 4.1 创建卡片

- **URL**: `/api/cards`
- **方法**: `POST`
- **描述**: 创建新的卡片记录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "callsign": "JA1ABC",
    "name": "Taro Yamada",
    "qth": "Tokyo, Japan",
    "country": "Japan",
    "contactDate": "2023-06-15T08:30:00Z",
    "frequency": 14.250,
    "band": "20m",
    "mode": "SSB",
    "rstSent": "59",
    "rstReceived": "57",
    "qslStatus": "pending",
    "notes": "First contact with Japan",
    "categories": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
    "tags": ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"],
    "location": {
      "coordinates": [139.6917, 35.6895]
    },
    "isPublic": false
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "userId": "60d21b4667d0d8992e610c85",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Tokyo, Japan",
      "country": "Japan",
      "contactDate": "2023-06-15T08:30:00Z",
      "frequency": 14.250,
      "band": "20m",
      "mode": "SSB",
      "rstSent": "59",
      "rstReceived": "57",
      "qslStatus": "pending",
      "notes": "First contact with Japan",
      "categories": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
      "tags": ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"],
      "location": {
        "type": "Point",
        "coordinates": [139.6917, 35.6895]
      },
      "isPublic": false,
      "createdAt": "2023-06-23T10:00:00Z",
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 4.2 获取卡片列表

- **URL**: `/api/cards`
- **方法**: `GET`
- **描述**: 获取当前用户的卡片列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `search`: 搜索关键词
  - `callsign`: 呼号筛选
  - `country`: 国家筛选
  - `band`: 频段筛选
  - `mode`: 模式筛选
  - `qslStatus`: QSL状态筛选
  - `category`: 分类ID筛选
  - `tag`: 标签ID筛选
  - `startDate`: 联络日期起始
  - `endDate`: 联络日期结束
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        "country": "Japan",
        "contactDate": "2023-06-15T08:30:00Z",
        "band": "20m",
        "mode": "SSB",
        "qslStatus": "pending",
        "categories": [
          {
            "id": "60d21b4667d0d8992e610c86",
            "name": "DX"
          },
          {
            "id": "60d21b4667d0d8992e610c87",
            "name": "Asia"
          }
        ],
        "tags": [
          {
            "id": "60d21b4667d0d8992e610c88",
            "name": "DXCC",
            "color": "#ff0000"
          },
          {
            "id": "60d21b4667d0d8992e610c89",
            "name": "Contest",
            "color": "#00ff00"
          }
        ],
        "createdAt": "2023-06-23T10:00:00Z"
      },
      // 更多卡片...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "pages": 10
      }
    }
  }
  ```

### 4.3 获取卡片详情

- **URL**: `/api/cards/:id`
- **方法**: `GET`
- **描述**: 获取指定卡片的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "userId": "60d21b4667d0d8992e610c85",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Tokyo, Japan",
      "country": "Japan",
      "contactDate": "2023-06-15T08:30:00Z",
      "frequency": 14.250,
      "band": "20m",
      "mode": "SSB",
      "rstSent": "59",
      "rstReceived": "57",
      "qslStatus": "pending",
      "imageUrls": ["https://example.com/card1.jpg", "https://example.com/card2.jpg"],
      "qrCode": "data:image/png;base64,...",
      "rfidTag": {
        "uid": "04A2B3C4D5E6",
        "type": "MIFARE Classic",
        "lastRead": "2023-06-20T10:00:00Z",
        "lastWrite": "2023-06-20T10:00:00Z",
        "status": "active"
      },
      "notes": "First contact with Japan",
      "categories": [
        {
          "id": "60d21b4667d0d8992e610c86",
          "name": "DX",
          "description": "DX Contacts"
        },
        {
          "id": "60d21b4667d0d8992e610c87",
          "name": "Asia",
          "description": "Asian Contacts"
        }
      ],
      "tags": [
        {
          "id": "60d21b4667d0d8992e610c88",
          "name": "DXCC",
          "color": "#ff0000"
        },
        {
          "id": "60d21b4667d0d8992e610c89",
          "name": "Contest",
          "color": "#00ff00"
        }
      ],
      "location": {
        "type": "Point",
        "coordinates": [139.6917, 35.6895]
      },
      "isPublic": false,
      "createdAt": "2023-06-23T10:00:00Z",
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 4.4 更新卡片

- **URL**: `/api/cards/:id`
- **方法**: `PUT`
- **描述**: 更新指定卡片的信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "Taro Yamada",
    "qth": "Osaka, Japan",
    "qslStatus": "sent",
    "notes": "Updated notes",
    "categories": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87", "60d21b4667d0d8992e610c91"],
    "tags": ["60d21b4667d0d8992e610c88"]
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Osaka, Japan",
      "qslStatus": "sent",
      "notes": "Updated notes",
      "categories": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87", "60d21b4667d0d8992e610c91"],
      "tags": ["60d21b4667d0d8992e610c88"],
      "updatedAt": "2023-06-24T10:00:00Z"
    }
  }
  ```

### 4.5 删除卡片

- **URL**: `/api/cards/:id`
- **方法**: `DELETE`
- **描述**: 删除指定卡片
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "卡片删除成功"
    }
  }
  ```

### 4.6 批量操作卡片

- **URL**: `/api/cards/batch`
- **方法**: `POST`
- **描述**: 批量操作卡片（更新或删除）
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "operation": "update", // 或 "delete"
    "ids": ["60d21b4667d0d8992e610c90", "60d21b4667d0d8992e610c92", "60d21b4667d0d8992e610c93"],
    "data": { // 仅在 operation 为 "update" 时需要
      "qslStatus": "sent",
      "categories": ["60d21b4667d0d8992e610c86"],
      "tags": ["60d21b4667d0d8992e610c88"]
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "批量操作成功",
      "affected": 3
    }
  }
  ```

### 4.7 上传卡片图片

- **URL**: `/api/cards/:id/images`
- **方法**: `POST`
- **描述**: 为指定卡片上传图片
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `images`: 图片文件（可多个）
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "imageUrls": [
        "https://example.com/card1.jpg",
        "https://example.com/card2.jpg"
      ]
    }
  }
  ```

### 4.8 删除卡片图片

- **URL**: `/api/cards/:id/images/:imageIndex`
- **方法**: `DELETE`
- **描述**: 删除指定卡片的特定图片
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "图片删除成功",
      "imageUrls": [
        "https://example.com/card2.jpg"
      ]
    }
  }
  ```

### 4.9 获取卡片统计

- **URL**: `/api/cards/stats`
- **方法**: `GET`
- **描述**: 获取当前用户的卡片统计信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "total": 100,
      "byCountry": [
        { "country": "Japan", "count": 20 },
        { "country": "USA", "count": 15 },
        // 更多国家...
      ],
      "byBand": [
        { "band": "20m", "count": 30 },
        { "band": "40m", "count": 25 },
        // 更多频段...
      ],
      "byMode": [
        { "mode": "SSB", "count": 50 },
        { "mode": "CW", "count": 30 },
        // 更多模式...
      ],
      "byQslStatus": [
        { "status": "pending", "count": 40 },
        { "status": "sent", "count": 30 },
        { "status": "received", "count": 20 },
        { "status": "confirmed", "count": 10 }
      ],
      "byMonth": [
        { "month": "2023-01", "count": 10 },
        { "month": "2023-02", "count": 15 },
        // 更多月份...
      ]
    }
  }
  ```

## 5. 标签识别接口

### 5.1 二维码接口

#### 5.1.1 生成二维码

- **URL**: `/api/tags/qrcode/generate`
- **方法**: `POST`
- **描述**: 为卡片生成二维码
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "cardId": "60d21b4667d0d8992e610c90",
    "size": 200, // 可选，二维码尺寸
    "includeCardInfo": true // 可选，是否在二维码中包含卡片信息
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,...",
      "cardId": "60d21b4667d0d8992e610c90"
    }
  }
  ```

#### 5.1.2 扫描二维码

- **URL**: `/api/tags/qrcode/scan`
- **方法**: `POST`
- **描述**: 扫描并识别二维码
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `image`: 二维码图片文件
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "cardId": "60d21b4667d0d8992e610c90",
      "content": "...", // 二维码内容
      "card": {
        // 卡片详细信息，如果二维码关联到卡片
        "id": "60d21b4667d0d8992e610c90",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        // 其他卡片信息...
      }
    }
  }
  ```

#### 5.1.3 获取卡片二维码

- **URL**: `/api/tags/qrcode/:cardId`
- **方法**: `GET`
- **描述**: 获取指定卡片的二维码
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `size`: 二维码尺寸，默认200
  - `download`: 是否下载，默认false
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,...",
      "cardId": "60d21b4667d0d8992e610c90"
    }
  }
  ```

### 5.2 RFID接口

#### 5.2.1 绑定RFID标签

- **URL**: `/api/tags/rfid/bind`
- **方法**: `POST`
- **描述**: 将RFID标签绑定到卡片
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "cardId": "60d21b4667d0d8992e610c90",
    "rfidTag": {
      "uid": "04A2B3C4D5E6",
      "type": "MIFARE Classic"
    },
    "deviceId": "60d21b4667d0d8992e610c95" // 可选，RFID设备ID
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "cardId": "60d21b4667d0d8992e610c90",
      "rfidTag": {
        "uid": "04A2B3C4D5E6",
        "type": "MIFARE Classic",
        "status": "active",
        "lastWrite": "2023-06-24T10:00:00Z"
      }
    }
  }
  ```

#### 5.2.2 读取RFID标签

- **URL**: `/api/tags/rfid/read`
- **方法**: `POST`
- **描述**: 读取RFID标签信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "uid": "04A2B3C4D5E6",
    "deviceId": "60d21b4667d0d8992e610c95" // 可选，RFID设备ID
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "uid": "04A2B3C4D5E6",
      "type": "MIFARE Classic",
      "card": {
        // 如果标签已绑定卡片，返回卡片信息
        "id": "60d21b4667d0d8992e610c90",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        // 其他卡片信息...
      },
      "lastRead": "2023-06-24T10:05:00Z"
    }
  }
  ```

#### 5.2.3 写入RFID标签

- **URL**: `/api/tags/rfid/write`
- **方法**: `POST`
- **描述**: 向RFID标签写入数据
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "uid": "04A2B3C4D5E6",
    "data": {
      "cardId": "60d21b4667d0d8992e610c90",
      "customData": "..." // 可选，自定义数据
    },
    "deviceId": "60d21b4667d0d8992e610c95" // 可选，RFID设备ID
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "uid": "04A2B3C4D5E6",
      "status": "success",
      "lastWrite": "2023-06-24T10:10:00Z"
    }
  }
  ```

#### 5.2.4 获取卡片RFID信息

- **URL**: `/api/tags/rfid/:cardId`
- **方法**: `GET`
- **描述**: 获取指定卡片的RFID标签信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "cardId": "60d21b4667d0d8992e610c90",
      "rfidTag": {
        "uid": "04A2B3C4D5E6",
        "type": "MIFARE Classic",
        "status": "active",
        "lastRead": "2023-06-24T10:05:00Z",
        "lastWrite": "2023-06-24T10:10:00Z"
      }
    }
  }
  ```

#### 5.2.5 更新卡片RFID信息

- **URL**: `/api/tags/rfid/:cardId`
- **方法**: `PUT`
- **描述**: 更新指定卡片的RFID标签信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "rfidTag": {
      "uid": "04A2B3C4D5E6", // 可选，如果要更换标签
      "type": "MIFARE Classic", // 可选
      "status": "inactive" // 可选
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "cardId": "60d21b4667d0d8992e610c90",
      "rfidTag": {
        "uid": "04A2B3C4D5E6",
        "type": "MIFARE Classic",
        "status": "inactive",
        "lastRead": "2023-06-24T10:05:00Z",
        "lastWrite": "2023-06-24T10:10:00Z"
      }
    }
  }
  ```

### 5.3 RFID设备接口

#### 5.3.1 注册RFID设备

- **URL**: `/api/rfid-devices`
- **方法**: `POST`
- **描述**: 注册新的RFID读写设备
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "办公室读卡器",
    "deviceType": "reader-writer",
    "model": "ACR122U",
    "serialNumber": "SN12345678",
    "connectionType": "usb",
    "connectionParams": {
      "port": "/dev/ttyUSB0"
    },
    "supportedCardTypes": ["MIFARE Classic", "MIFARE Ultralight", "NTAG213"],
    "location": "办公室桌面"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "userId": "60d21b4667d0d8992e610c85",
      "name": "办公室读卡器",
      "deviceType": "reader-writer",
      "model": "ACR122U",
      "serialNumber": "SN12345678",
      "connectionType": "usb",
      "connectionParams": {
        "port": "/dev/ttyUSB0"
      },
      "supportedCardTypes": ["MIFARE Classic", "MIFARE Ultralight", "NTAG213"],
      "isActive": true,
      "status": "offline",
      "location": "办公室桌面",
      "createdAt": "2023-06-24T10:15:00Z",
      "updatedAt": "2023-06-24T10:15:00Z"
    }
  }
  ```

#### 5.3.2 获取RFID设备列表

- **URL**: `/api/rfid-devices`
- **方法**: `GET`
- **描述**: 获取当前用户的RFID设备列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `status`: 设备状态筛选
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c95",
        "name": "办公室读卡器",
        "deviceType": "reader-writer",
        "model": "ACR122U",
        "status": "offline",
        "location": "办公室桌面",
        "lastConnected": "2023-06-24T10:15:00Z",
        "createdAt": "2023-06-24T10:15:00Z"
      },
      // 更多设备...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "pages": 1
      }
    }
  }
  ```

#### 5.3.3 获取RFID设备详情

- **URL**: `/api/rfid-devices/:id`
- **方法**: `GET`
- **描述**: 获取指定RFID设备的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "userId": "60d21b4667d0d8992e610c85",
      "name": "办公室读卡器",
      "deviceType": "reader-writer",
      "model": "ACR122U",
      "serialNumber": "SN12345678",
      "connectionType": "usb",
      "connectionParams": {
        "port": "/dev/ttyUSB0"
      },
      "supportedCardTypes": ["MIFARE Classic", "MIFARE Ultralight", "NTAG213"],
      "isActive": true,
      "status": "offline",
      "lastConnected": "2023-06-24T10:15:00Z",
      "location": "办公室桌面",
      "notes": "",
      "createdAt": "2023-06-24T10:15:00Z",
      "updatedAt": "2023-06-24T10:15:00Z"
    }
  }
  ```

#### 5.3.4 更新RFID设备

- **URL**: `/api/rfid-devices/:id`
- **方法**: `PUT`
- **描述**: 更新指定RFID设备的信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "主卧读卡器",
    "location": "主卧桌面",
    "isActive": true,
    "notes": "用于卡片入库"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "name": "主卧读卡器",
      "location": "主卧桌面",
      "isActive": true,
      "notes": "用于卡片入库",
      "updatedAt": "2023-06-24T10:20:00Z"
    }
  }
  ```

#### 5.3.5 删除RFID设备

- **URL**: `/api/rfid-devices/:id`
- **方法**: `DELETE`
- **描述**: 删除指定RFID设备
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "RFID设备删除成功"
    }
  }
  ```

#### 5.3.6 连接RFID设备

- **URL**: `/api/rfid-devices/:id/connect`
- **方法**: `POST`
- **描述**: 连接到指定RFID设备
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "status": "online",
      "lastConnected": "2023-06-24T10:25:00Z",
      "message": "设备连接成功"
    }
  }
  ```

#### 5.3.7 断开RFID设备

- **URL**: `/api/rfid-devices/:id/disconnect`
- **方法**: `POST`
- **描述**: 断开与指定RFID设备的连接
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "status": "offline",
      "message": "设备断开连接"
    }
  }
  ```

#### 5.3.8 获取RFID操作日志

- **URL**: `/api/rfid-devices/:id/logs`
- **方法**: `GET`
- **描述**: 获取指定RFID设备的操作日志
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `operationType`: 操作类型筛选
  - `operationResult`: 操作结果筛选
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c96",
        "deviceId": "60d21b4667d0d8992e610c95",
        "cardId": "60d21b4667d0d8992e610c90",
        "tagUid": "04A2B3C4D5E6",
        "operationType": "read",
        "operationResult": "success",
        "createdAt": "2023-06-24T10:30:00Z"
      },
      // 更多日志...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "pages": 5
      }
    }
  }
  ```

## 6. 分类接口

### 6.1 创建分类

- **URL**: `/api/categories`
- **方法**: `POST`
- **描述**: 创建新的分类
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "DX",
    "description": "DX Contacts",
    "parentId": null, // 可选，父分类ID
    "order": 1 // 可选，排序顺序
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c86",
      "userId": "60d21b4667d0d8992e610c85",
      "name": "DX",
      "description": "DX Contacts",
      "parentId": null,
      "level": 0,
      "order": 1,
      "isActive": true,
      "createdAt": "2023-06-24T11:00:00Z",
      "updatedAt": "2023-06-24T11:00:00Z"
    }
  }
  ```

### 6.2 获取分类列表

- **URL**: `/api/categories`
- **方法**: `GET`
- **描述**: 获取当前用户的分类列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `parentId`: 父分类ID筛选
  - `flat`: 是否扁平化返回，默认false（树形结构）
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c86",
        "name": "DX",
        "description": "DX Contacts",
        "level": 0,
        "order": 1,
        "children": [
          {
            "id": "60d21b4667d0d8992e610c87",
            "name": "Asia",
            "description": "Asian Contacts",
            "level": 1,
            "order": 1,
            "children": []
          },
          {
            "id": "60d21b4667d0d8992e610c91",
            "name": "Europe",
            "description": "European Contacts",
            "level": 1,
            "order": 2,
            "children": []
          }
        ]
      },
      // 更多分类...
    ]
  }
  ```

### 6.3 获取分类详情

- **URL**: `/api/categories/:id`
- **方法**: `GET`
- **描述**: 获取指定分类的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c86",
      "userId": "60d21b4667d0d8992e610c85",
      "name": "DX",
      "description": "DX Contacts",
      "parentId": null,
      "level": 0,
      "order": 1,
      "isActive": true,
      "createdAt": "2023-06-24T11:00:00Z",
      "updatedAt": "2023-06-24T11:00:00Z",
      "cardCount": 35
    }
  }
  ```

### 6.4 更新分类

- **URL**: `/api/categories/:id`
- **方法**: `PUT`
- **描述**: 更新指定分类的信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "DX Contacts",
    "description": "Long Distance Contacts",
    "order": 2,
    "isActive": true
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "DX Contacts",
      "description": "Long Distance Contacts",
      "order": 2,
      "isActive": true,
      "updatedAt": "2023-06-24T11:05:00Z"
    }
  }
  ```

### 6.5 删除分类

- **URL**: `/api/categories/:id`
- **方法**: `DELETE`
- **描述**: 删除指定分类
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `deleteChildren`: 是否删除子分类，默认false
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "分类删除成功"
    }
  }
  ```

### 6.6 获取分类下的卡片

- **URL**: `/api/categories/:id/cards`
- **方法**: `GET`
- **描述**: 获取指定分类下的卡片列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `includeChildCategories`: 是否包含子分类的卡片，默认false
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        "country": "Japan",
        "contactDate": "2023-06-15T08:30:00Z",
        "band": "20m",
        "mode": "SSB",
        "qslStatus": "pending",
        "createdAt": "2023-06-23T10:00:00Z"
      },
      // 更多卡片...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 35,
        "pages": 4
      }
    }
  }
  ```

## 7. 标签接口

### 7.1 创建标签

- **URL**: `/api/tags`
- **方法**: `POST`
- **描述**: 创建新的标签
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "DXCC",
    "color": "#ff0000"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c88",
      "userId": "60d21b4667d0d8992e610c85",
      "name": "DXCC",
      "color": "#ff0000",
      "count": 0,
      "createdAt": "2023-06-24T11:30:00Z",
      "updatedAt": "2023-06-24T11:30:00Z"
    }
  }
  ```

### 7.2 获取标签列表

- **URL**: `/api/tags`
- **方法**: `GET`
- **描述**: 获取当前用户的标签列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c88",
        "name": "DXCC",
        "color": "#ff0000",
        "count": 35,
        "createdAt": "2023-06-24T11:30:00Z"
      },
      {
        "id": "60d21b4667d0d8992e610c89",
        "name": "Contest",
        "color": "#00ff00",
        "count": 20,
        "createdAt": "2023-06-24T11:35:00Z"
      },
      // 更多标签...
    ]
  }
  ```

### 7.3 获取标签详情

- **URL**: `/api/tags/:id`
- **方法**: `GET`
- **描述**: 获取指定标签的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c88",
      "userId": "60d21b4667d0d8992e610c85",
      "name": "DXCC",
      "color": "#ff0000",
      "count": 35,
      "createdAt": "2023-06-24T11:30:00Z",
      "updatedAt": "2023-06-24T11:30:00Z"
    }
  }
  ```

### 7.4 更新标签

- **URL**: `/api/tags/:id`
- **方法**: `PUT`
- **描述**: 更新指定标签的信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "DXCC Award",
    "color": "#ff5500"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c88",
      "name": "DXCC Award",
      "color": "#ff5500",
      "updatedAt": "2023-06-24T11:40:00Z"
    }
  }
  ```

### 7.5 删除标签

- **URL**: `/api/tags/:id`
- **方法**: `DELETE`
- **描述**: 删除指定标签
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "标签删除成功"
    }
  }
  ```

### 7.6 获取标签下的卡片

- **URL**: `/api/tags/:id/cards`
- **方法**: `GET`
- **描述**: 获取指定标签下的卡片列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        "country": "Japan",
        "contactDate": "2023-06-15T08:30:00Z",
        "band": "20m",
        "mode": "SSB",
        "qslStatus": "pending",
        "createdAt": "2023-06-23T10:00:00Z"
      },
      // 更多卡片...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 35,
        "pages": 4
      }
    }
  }
  ```

## 8. 导入导出接口

### 8.1 导入数据

#### 8.1.1 导入CSV数据

- **URL**: `/api/import/csv`
- **方法**: `POST`
- **描述**: 从CSV文件导入卡片数据
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `file`: CSV文件
  - `options`: JSON字符串，包含导入选项
    ```json
    {
      "headerRow": true,
      "delimiter": ",",
      "mapping": {
        "callsign": 0,
        "name": 1,
        "country": 2,
        // 其他字段映射...
      },
      "defaultValues": {
        "qslStatus": "pending",
        "categories": ["60d21b4667d0d8992e610c86"]
      }
    }
    ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "taskId": "60d21b4667d0d8992e610c97",
      "status": "processing",
      "totalRecords": 100,
      "message": "导入任务已开始处理"
    }
  }
  ```

#### 8.1.2 导入Excel数据

- **URL**: `/api/import/excel`
- **方法**: `POST`
- **描述**: 从Excel文件导入卡片数据
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `file`: Excel文件
  - `options`: JSON字符串，包含导入选项
    ```json
    {
      "sheet": "Sheet1",
      "headerRow": true,
      "mapping": {
        "callsign": "A",
        "name": "B",
        "country": "C",
        // 其他字段映射...
      },
      "defaultValues": {
        "qslStatus": "pending",
        "categories": ["60d21b4667d0d8992e610c86"]
      }
    }
    ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "taskId": "60d21b4667d0d8992e610c98",
      "status": "processing",
      "totalRecords": 100,
      "message": "导入任务已开始处理"
    }
  }
  ```

#### 8.1.3 获取导入任务状态

- **URL**: `/api/import/tasks/:id`
- **方法**: `GET`
- **描述**: 获取导入任务的状态和进度
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c97",
      "type": "import",
      "format": "csv",
      "status": "completed",
      "totalRecords": 100,
      "processedRecords": 100,
      "errorRecords": 2,
      "errorDetails": "行10: 呼号格式错误; 行15: 日期格式错误",
      "startTime": "2023-06-24T12:00:00Z",
      "endTime": "2023-06-24T12:01:30Z",
      "createdAt": "2023-06-24T12:00:00Z",
      "updatedAt": "2023-06-24T12:01:30Z"
    }
  }
  ```

### 8.2 导出数据

#### 8.2.1 导出CSV数据

- **URL**: `/api/export/csv`
- **方法**: `GET`
- **描述**: 将卡片数据导出为CSV文件
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `filter`: JSON字符串，包含筛选条件
    ```json
    {
      "callsign": "JA",
      "country": "Japan",
      "band": "20m",
      "startDate": "2023-01-01",
      "endDate": "2023-06-30",
      "categories": ["60d21b4667d0d8992e610c86"],
      "tags": ["60d21b4667d0d8992e610c88"]
    }
    ```
  - `fields`: 要导出的字段，逗号分隔
  - `delimiter`: 分隔符，默认逗号
  - `includeHeader`: 是否包含表头，默认true
- **响应**: 直接下载CSV文件

#### 8.2.2 导出Excel数据

- **URL**: `/api/export/excel`
- **方法**: `GET`
- **描述**: 将卡片数据导出为Excel文件
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `filter`: JSON字符串，包含筛选条件（同上）
  - `fields`: 要导出的字段，逗号分隔
  - `sheetName`: 工作表名称，默认"Cards"
  - `includeHeader`: 是否包含表头，默认true
- **响应**: 直接下载Excel文件

#### 8.2.3 导出PDF数据

- **URL**: `/api/export/pdf`
- **方法**: `GET`
- **描述**: 将卡片数据导出为PDF文件
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `filter`: JSON字符串，包含筛选条件（同上）
  - `fields`: 要导出的字段，逗号分隔
  - `title`: PDF标题
  - `pageSize`: 页面大小，默认"A4"
  - `orientation`: 页面方向，默认"portrait"
  - `includeQRCode`: 是否包含二维码，默认false
- **响应**: 直接下载PDF文件

#### 8.2.4 异步导出任务

- **URL**: `/api/export/async`
- **方法**: `POST`
- **描述**: 创建异步导出任务
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "format": "excel", // csv, excel, pdf
    "filter": {
      "callsign": "JA",
      "country": "Japan",
      // 其他筛选条件...
    },
    "options": {
      "fields": ["callsign", "name", "country", "contactDate", "band", "mode", "qslStatus"],
      "includeHeader": true,
      // 其他格式特定选项...
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "taskId": "60d21b4667d0d8992e610c99",
      "status": "processing",
      "message": "导出任务已开始处理"
    }
  }
  ```

#### 8.2.5 获取导出任务状态

- **URL**: `/api/export/tasks/:id`
- **方法**: `GET`
- **描述**: 获取导出任务的状态和进度
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c99",
      "type": "export",
      "format": "excel",
      "status": "completed",
      "totalRecords": 50,
      "processedRecords": 50,
      "errorRecords": 0,
      "filePath": "/exports/cards_20230624_120500.xlsx",
      "downloadUrl": "/api/export/download/cards_20230624_120500.xlsx",
      "startTime": "2023-06-24T12:05:00Z",
      "endTime": "2023-06-24T12:05:30Z",
      "createdAt": "2023-06-24T12:05:00Z",
      "updatedAt": "2023-06-24T12:05:30Z"
    }
  }
  ```

#### 8.2.6 下载导出文件

- **URL**: `/api/export/download/:filename`
- **方法**: `GET`
- **描述**: 下载已导出的文件
- **请求头**: `Authorization: Bearer <token>`
- **响应**: 直接下载文件

## 9. 系统设置接口

### 9.1 获取系统设置

- **URL**: `/api/settings`
- **方法**: `GET`
- **描述**: 获取系统设置
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `type`: 设置类型（system/user），默认user
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "theme": "light",
        "language": "zh-CN",
        "dateFormat": "YYYY-MM-DD",
        "timeFormat": "HH:mm:ss",
        "defaultQslStatus": "pending",
        "defaultCategories": ["60d21b4667d0d8992e610c86"],
        "cardListColumns": ["callsign", "name", "country", "band", "mode", "contactDate", "qslStatus"]
      },
      "system": {
        // 仅管理员可见
        "siteName": "业余无线电卡片管理系统",
        "allowRegistration": true,
        "maxUploadSize": 10485760,
        "backupSchedule": "0 0 * * *",
        "maxBackupFiles": 10
      }
    }
  }
  ```

### 9.2 更新系统设置

- **URL**: `/api/settings`
- **方法**: `PUT`
- **描述**: 更新系统设置
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "type": "user", // 或 "system"（仅管理员）
    "settings": {
      "theme": "dark",
      "language": "en-US",
      "dateFormat": "MM/DD/YYYY",
      "defaultQslStatus": "sent"
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "设置更新成功",
      "updated": ["theme", "language", "dateFormat", "defaultQslStatus"]
    }
  }
  ```

### 9.3 重置系统设置

- **URL**: `/api/settings/reset`
- **方法**: `POST`
- **描述**: 重置系统设置为默认值
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "type": "user", // 或 "system"（仅管理员）
    "keys": ["theme", "language"] // 可选，指定要重置的设置项
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "设置重置成功",
      "reset": ["theme", "language"]
    }
  }
  ```

## 10. 日志接口

### 10.1 获取系统日志

- **URL**: `/api/logs`
- **方法**: `GET`
- **描述**: 获取系统操作日志（仅管理员可用）
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `userId`: 用户ID筛选
  - `action`: 操作类型筛选
  - `target`: 操作目标筛选
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c9a",
        "userId": "60d21b4667d0d8992e610c85",
        "username": "user123",
        "action": "create",
        "target": "card",
        "targetId": "60d21b4667d0d8992e610c90",
        "detail": "创建了新卡片 JA1ABC",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "createdAt": "2023-06-23T10:00:00Z"
      },
      // 更多日志...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 500,
        "pages": 50
      }
    }
  }
  ```

### 10.2 获取用户操作日志

- **URL**: `/api/logs/me`
- **方法**: `GET`
- **描述**: 获取当前用户的操作日志
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**: 同上（除了userId）
- **响应**: 格式同上

### 10.3 获取RFID操作日志

- **URL**: `/api/logs/rfid`
- **方法**: `GET`
- **描述**: 获取RFID操作日志
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `deviceId`: 设备ID筛选
  - `tagUid`: 标签UID筛选
  - `operationType`: 操作类型筛选
  - `operationResult`: 操作结果筛选
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c96",
        "deviceId": "60d21b4667d0d8992e610c95",
        "deviceName": "办公室读卡器",
        "cardId": "60d21b4667d0d8992e610c90",
        "cardCallsign": "JA1ABC",
        "tagUid": "04A2B3C4D5E6",
        "operationType": "read",
        "operationResult": "success",
        "createdAt": "2023-06-24T10:30:00Z"
      },
      // 更多日志...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "pages": 10
      }
    }
  }
  ```

## 11. 通知接口

### 11.1 获取通知列表

- **URL**: `/api/notifications`
- **方法**: `GET`
- **描述**: 获取当前用户的通知列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `isRead`: 是否已读筛选
  - `type`: 通知类型筛选
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c9b",
        "title": "导入完成",
        "content": "您的CSV导入任务已完成，成功导入98条记录，2条失败。",
        "type": "system",
        "relatedId": "60d21b4667d0d8992e610c97",
        "isRead": false,
        "createdAt": "2023-06-24T12:01:30Z"
      },
      // 更多通知...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 20,
        "pages": 2
      },
      "unreadCount": 5
    }
  }
  ```

### 11.2 获取通知详情

- **URL**: `/api/notifications/:id`
- **方法**: `GET`
- **描述**: 获取指定通知的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c9b",
      "title": "导入完成",
      "content": "您的CSV导入任务已完成，成功导入98条记录，2条失败。",
      "type": "system",
      "relatedId": "60d21b4667d0d8992e610c97",
      "isRead": true,
      "readAt": "2023-06-24T12:10:00Z",
      "createdAt": "2023-06-24T12:01:30Z",
      "updatedAt": "2023-06-24T12:10:00Z"
    }
  }
  ```

### 11.3 标记通知为已读

- **URL**: `/api/notifications/:id/read`
- **方法**: `PUT`
- **描述**: 标记指定通知为已读
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c9b",
      "isRead": true,
      "readAt": "2023-06-24T12:10:00Z"
    }
  }
  ```

### 11.4 标记所有通知为已读

- **URL**: `/api/notifications/read-all`
- **方法**: `PUT`
- **描述**: 标记所有通知为已读
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "所有通知已标记为已读",
      "count": 5
    }
  }
  ```

### 11.5 删除通知

- **URL**: `/api/notifications/:id`
- **方法**: `DELETE`
- **描述**: 删除指定通知
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "通知删除成功"
    }
  }
  ```

### 11.6 清空通知

- **URL**: `/api/notifications/clear`
- **方法**: `DELETE`
- **描述**: 清空所有通知
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `isRead`: 是否只清空已读通知，默认true
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "通知已清空",
      "count": 15
    }
  }
  ```

## 12. 总结

本API设计文档详细描述了业余无线电卡片管理入库系统的所有接口，包括认证、用户管理、卡片管理、标签识别（二维码和RFID）、分类管理、标签管理、导入导出、系统设置、日志和通知等功能模块。API采用RESTful风格设计，提供JSON格式的数据交换，并使用JWT进行身份验证。

通过这些接口，前端应用可以与后端系统进行完整的交互，实现业余无线电卡片的管理、二维码和RFID标签的识别、分类整理等核心功能，为用户提供高效、便捷的卡片管理体验。


## 13. EYEBALL卡接口

为了支持EYEBALL卡（目视确认卡）的记录存档功能，系统提供了以下专门的API接口：

### 13.1 创建EYEBALL卡

- **URL**: `/api/eyeball-cards`
- **方法**: `POST`
- **描述**: 创建新的EYEBALL卡记录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "callsign": "JA1ABC",
    "name": "Taro Yamada",
    "qth": "Tokyo, Japan",
    "country": "Japan",
    "contactDate": "2023-06-15T08:30:00Z",
    "frequency": 14.250,
    "band": "20m",
    "mode": "SSB",
    "rstSent": "59",
    "rstReceived": "57",
    "qslStatus": "confirmed",
    "notes": "Met at Tokyo Hamfest",
    "categories": ["60d21b4667d0d8992e610c86"],
    "tags": ["60d21b4667d0d8992e610c88"],
    "eyeballInfo": {
      "isEyeball": true,
      "meetingType": "hamfest",
      "meetingLocation": "Tokyo Big Sight, Japan",
      "meetingDate": "2023-06-15T10:00:00Z",
      "meetingName": "Tokyo Hamfest 2023",
      "witnesses": [
        {
          "name": "Jiro Suzuki",
          "callsign": "JA2XYZ",
          "contact": "ja2xyz@example.com"
        }
      ],
      "verificationMethod": "photo",
      "verificationDetails": "Photo taken at Tokyo Hamfest booth #123"
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "userId": "60d21b4667d0d8992e610c85",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Tokyo, Japan",
      "country": "Japan",
      "contactDate": "2023-06-15T08:30:00Z",
      "frequency": 14.250,
      "band": "20m",
      "mode": "SSB",
      "rstSent": "59",
      "rstReceived": "57",
      "qslStatus": "confirmed",
      "notes": "Met at Tokyo Hamfest",
      "categories": ["60d21b4667d0d8992e610c86"],
      "tags": ["60d21b4667d0d8992e610c88"],
      "eyeballInfo": {
        "isEyeball": true,
        "meetingType": "hamfest",
        "meetingLocation": "Tokyo Big Sight, Japan",
        "meetingDate": "2023-06-15T10:00:00Z",
        "meetingName": "Tokyo Hamfest 2023",
        "witnesses": [
          {
            "name": "Jiro Suzuki",
            "callsign": "JA2XYZ",
            "contact": "ja2xyz@example.com"
          }
        ],
        "verificationMethod": "photo",
        "verificationDetails": "Photo taken at Tokyo Hamfest booth #123",
        "verificationMedia": []
      },
      "createdAt": "2023-06-23T10:00:00Z",
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 13.2 将普通卡片转换为EYEBALL卡

- **URL**: `/api/cards/:id/convert-to-eyeball`
- **方法**: `POST`
- **描述**: 将现有的普通卡片转换为EYEBALL卡
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "eyeballInfo": {
      "meetingType": "hamfest",
      "meetingLocation": "Tokyo Big Sight, Japan",
      "meetingDate": "2023-06-15T10:00:00Z",
      "meetingName": "Tokyo Hamfest 2023",
      "witnesses": [
        {
          "name": "Jiro Suzuki",
          "callsign": "JA2XYZ",
          "contact": "ja2xyz@example.com"
        }
      ],
      "verificationMethod": "photo",
      "verificationDetails": "Photo taken at Tokyo Hamfest booth #123"
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "callsign": "JA1ABC",
      "eyeballInfo": {
        "isEyeball": true,
        "meetingType": "hamfest",
        "meetingLocation": "Tokyo Big Sight, Japan",
        "meetingDate": "2023-06-15T10:00:00Z",
        "meetingName": "Tokyo Hamfest 2023",
        "witnesses": [
          {
            "name": "Jiro Suzuki",
            "callsign": "JA2XYZ",
            "contact": "ja2xyz@example.com"
          }
        ],
        "verificationMethod": "photo",
        "verificationDetails": "Photo taken at Tokyo Hamfest booth #123",
        "verificationMedia": []
      },
      "updatedAt": "2023-06-24T10:00:00Z"
    }
  }
  ```

### 13.3 更新EYEBALL卡信息

- **URL**: `/api/eyeball-cards/:id`
- **方法**: `PUT`
- **描述**: 更新EYEBALL卡的特殊信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "eyeballInfo": {
      "meetingType": "convention",
      "meetingLocation": "Osaka Convention Center, Japan",
      "meetingDate": "2023-06-16T10:00:00Z",
      "meetingName": "Kansai Ham Convention 2023",
      "witnesses": [
        {
          "name": "Jiro Suzuki",
          "callsign": "JA2XYZ",
          "contact": "ja2xyz@example.com"
        },
        {
          "name": "Saburo Tanaka",
          "callsign": "JA3ABC",
          "contact": "ja3abc@example.com"
        }
      ],
      "verificationMethod": "in_person",
      "verificationDetails": "Met in person at the convention"
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "eyeballInfo": {
        "isEyeball": true,
        "meetingType": "convention",
        "meetingLocation": "Osaka Convention Center, Japan",
        "meetingDate": "2023-06-16T10:00:00Z",
        "meetingName": "Kansai Ham Convention 2023",
        "witnesses": [
          {
            "name": "Jiro Suzuki",
            "callsign": "JA2XYZ",
            "contact": "ja2xyz@example.com"
          },
          {
            "name": "Saburo Tanaka",
            "callsign": "JA3ABC",
            "contact": "ja3abc@example.com"
          }
        ],
        "verificationMethod": "in_person",
        "verificationDetails": "Met in person at the convention",
        "verificationMedia": []
      },
      "updatedAt": "2023-06-24T10:05:00Z"
    }
  }
  ```

### 13.4 上传EYEBALL卡验证媒体

- **URL**: `/api/eyeball-cards/:id/media`
- **方法**: `POST`
- **描述**: 为EYEBALL卡上传验证媒体（照片或视频）
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `media`: 媒体文件（可多个）
  - `description`: 媒体描述（可选）
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c90",
      "eyeballInfo": {
        "verificationMedia": [
          "https://example.com/eyeball/photo1.jpg",
          "https://example.com/eyeball/photo2.jpg"
        ]
      },
      "updatedAt": "2023-06-24T10:10:00Z"
    }
  }
  ```

### 13.5 删除EYEBALL卡验证媒体

- **URL**: `/api/eyeball-cards/:id/media/:mediaIndex`
- **方法**: `DELETE`
- **描述**: 删除EYEBALL卡的特定验证媒体
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "验证媒体删除成功",
      "eyeballInfo": {
        "verificationMedia": [
          "https://example.com/eyeball/photo2.jpg"
        ]
      }
    }
  }
  ```

### 13.6 获取EYEBALL卡列表

- **URL**: `/api/eyeball-cards`
- **方法**: `GET`
- **描述**: 获取当前用户的EYEBALL卡列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `search`: 搜索关键词
  - `callsign`: 呼号筛选
  - `country`: 国家筛选
  - `meetingType`: 会面类型筛选
  - `startDate`: 会面日期起始
  - `endDate`: 会面日期结束
  - `verificationMethod`: 验证方式筛选
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        "country": "Japan",
        "contactDate": "2023-06-15T08:30:00Z",
        "eyeballInfo": {
          "meetingType": "convention",
          "meetingLocation": "Osaka Convention Center, Japan",
          "meetingDate": "2023-06-16T10:00:00Z",
          "meetingName": "Kansai Ham Convention 2023",
          "verificationMethod": "in_person"
        },
        "createdAt": "2023-06-23T10:00:00Z"
      },
      // 更多EYEBALL卡...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 20,
        "pages": 2
      }
    }
  }
  ```

### 13.7 获取EYEBALL卡统计

- **URL**: `/api/eyeball-cards/stats`
- **方法**: `GET`
- **描述**: 获取当前用户的EYEBALL卡统计信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "total": 20,
      "byCountry": [
        { "country": "Japan", "count": 8 },
        { "country": "USA", "count": 5 },
        // 更多国家...
      ],
      "byMeetingType": [
        { "type": "hamfest", "count": 10 },
        { "type": "convention", "count": 5 },
        { "type": "club_meeting", "count": 3 },
        { "type": "personal_visit", "count": 2 }
      ],
      "byVerificationMethod": [
        { "method": "in_person", "count": 12 },
        { "method": "photo", "count": 8 }
      ],
      "byYear": [
        { "year": "2023", "count": 15 },
        { "year": "2022", "count": 5 }
      ]
    }
  }
  ```

### 13.8 生成EYEBALL卡证书

- **URL**: `/api/eyeball-cards/:id/certificate`
- **方法**: `GET`
- **描述**: 生成EYEBALL卡的PDF证书
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `template`: 证书模板，默认"standard"
  - `includeWitnesses`: 是否包含证人信息，默认true
  - `includeMedia`: 是否包含验证媒体缩略图，默认true
  - `language`: 证书语言，默认"en"
- **响应**: 直接下载PDF文件

### 13.9 批量导出EYEBALL卡

- **URL**: `/api/eyeball-cards/export`
- **方法**: `GET`
- **描述**: 批量导出EYEBALL卡数据
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `format`: 导出格式（csv/excel/pdf），默认"excel"
  - `filter`: JSON字符串，包含筛选条件
  - `includeMedia`: 是否包含媒体链接，默认false
  - `includeWitnesses`: 是否包含证人信息，默认true
- **响应**: 直接下载文件


## 14. 发卡管理接口

为了支持发卡功能和收发卡对应关系，系统提供了以下API接口：

### 14.1 创建发卡记录

- **URL**: `/api/sent-cards`
- **方法**: `POST`
- **描述**: 创建新的发卡记录
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "callsign": "JA1ABC",
    "name": "Taro Yamada",
    "qth": "Tokyo, Japan",
    "country": "Japan",
    "contactDate": "2023-06-15T08:30:00Z",
    "frequency": 14.250,
    "band": "20m",
    "mode": "SSB",
    "contactType": "shortwave",
    "rstSent": "59",
    "rstReceived": "57",
    "notes": "First contact with Japan",
    "categories": ["60d21b4667d0d8992e610c86"],
    "tags": ["60d21b4667d0d8992e610c88"]
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "userId": "60d21b4667d0d8992e610c85",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Tokyo, Japan",
      "country": "Japan",
      "contactDate": "2023-06-15T08:30:00Z",
      "frequency": 14.250,
      "band": "20m",
      "mode": "SSB",
      "contactType": "shortwave",
      "rstSent": "59",
      "rstReceived": "57",
      "qslStatus": "pending",
      "sentDate": "2023-06-23T10:00:00Z",
      "isReceived": false,
      "notes": "First contact with Japan",
      "categories": ["60d21b4667d0d8992e610c86"],
      "tags": ["60d21b4667d0d8992e610c88"],
      "createdAt": "2023-06-23T10:00:00Z",
      "updatedAt": "2023-06-23T10:00:00Z"
    }
  }
  ```

### 14.2 获取发卡列表

- **URL**: `/api/sent-cards`
- **方法**: `GET`
- **描述**: 获取当前用户的发卡列表
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `page`: 页码，默认1
  - `limit`: 每页数量，默认10
  - `search`: 搜索关键词
  - `callsign`: 呼号筛选
  - `country`: 国家筛选
  - `band`: 频段筛选
  - `mode`: 模式筛选
  - `contactType`: 通联类型筛选
  - `qslStatus`: QSL状态筛选
  - `isReceived`: 是否收到回卡筛选（true/false）
  - `category`: 分类ID筛选
  - `tag`: 标签ID筛选
  - `startDate`: 通联日期起始
  - `endDate`: 通联日期结束
  - `startSentDate`: 发卡日期起始
  - `endSentDate`: 发卡日期结束
  - `sort`: 排序字段
  - `order`: 排序方向（asc/desc）
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c95",
        "callsign": "JA1ABC",
        "name": "Taro Yamada",
        "country": "Japan",
        "contactDate": "2023-06-15T08:30:00Z",
        "band": "20m",
        "mode": "SSB",
        "contactType": "shortwave",
        "qslStatus": "pending",
        "sentDate": "2023-06-23T10:00:00Z",
        "isReceived": false,
        "categories": [
          {
            "id": "60d21b4667d0d8992e610c86",
            "name": "DX"
          }
        ],
        "tags": [
          {
            "id": "60d21b4667d0d8992e610c88",
            "name": "DXCC",
            "color": "#ff0000"
          }
        ],
        "createdAt": "2023-06-23T10:00:00Z"
      },
      // 更多发卡记录...
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "pages": 10
      }
    }
  }
  ```

### 14.3 获取发卡详情

- **URL**: `/api/sent-cards/:id`
- **方法**: `GET`
- **描述**: 获取指定发卡记录的详细信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "userId": "60d21b4667d0d8992e610c85",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Tokyo, Japan",
      "country": "Japan",
      "contactDate": "2023-06-15T08:30:00Z",
      "frequency": 14.250,
      "band": "20m",
      "mode": "SSB",
      "contactType": "shortwave",
      "rstSent": "59",
      "rstReceived": "57",
      "qslStatus": "sent",
      "sentDate": "2023-06-23T10:00:00Z",
      "isReceived": true,
      "receivedDate": "2023-07-15T10:00:00Z",
      "receivedCard": {
        "id": "60d21b4667d0d8992e610c96",
        "callsign": "JA1ABC",
        "contactDate": "2023-06-15T08:30:00Z",
        "qslStatus": "confirmed"
      },
      "imageUrls": ["https://example.com/sent-card1.jpg", "https://example.com/sent-card2.jpg"],
      "qrCode": "data:image/png;base64,...",
      "notes": "First contact with Japan",
      "categories": [
        {
          "id": "60d21b4667d0d8992e610c86",
          "name": "DX",
          "description": "DX Contacts"
        }
      ],
      "tags": [
        {
          "id": "60d21b4667d0d8992e610c88",
          "name": "DXCC",
          "color": "#ff0000"
        }
      ],
      "isPublic": false,
      "createdAt": "2023-06-23T10:00:00Z",
      "updatedAt": "2023-07-15T10:00:00Z"
    }
  }
  ```

### 14.4 更新发卡记录

- **URL**: `/api/sent-cards/:id`
- **方法**: `PUT`
- **描述**: 更新指定发卡记录的信息
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "name": "Taro Yamada",
    "qth": "Osaka, Japan",
    "qslStatus": "sent",
    "notes": "Updated notes",
    "categories": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
    "tags": ["60d21b4667d0d8992e610c88"]
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "callsign": "JA1ABC",
      "name": "Taro Yamada",
      "qth": "Osaka, Japan",
      "qslStatus": "sent",
      "notes": "Updated notes",
      "categories": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"],
      "tags": ["60d21b4667d0d8992e610c88"],
      "updatedAt": "2023-06-24T10:00:00Z"
    }
  }
  ```

### 14.5 删除发卡记录

- **URL**: `/api/sent-cards/:id`
- **方法**: `DELETE`
- **描述**: 删除指定的发卡记录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "发卡记录已删除"
    }
  }
  ```

### 14.6 生成发卡二维码

- **URL**: `/api/sent-cards/:id/qrcode`
- **方法**: `POST`
- **描述**: 为指定的发卡记录生成二维码
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "size": 300,
    "margin": 4,
    "color": "#000000",
    "backgroundColor": "#ffffff",
    "includeCardInfo": true
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "qrCode": "data:image/png;base64,...",
      "updatedAt": "2023-06-24T10:00:00Z"
    }
  }
  ```

### 14.7 上传发卡图片

- **URL**: `/api/sent-cards/:id/images`
- **方法**: `POST`
- **描述**: 为指定的发卡记录上传图片
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `images`: 图片文件（可多个）
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "imageUrls": [
        "https://example.com/sent-card1.jpg",
        "https://example.com/sent-card2.jpg",
        "https://example.com/sent-card3.jpg"
      ],
      "updatedAt": "2023-06-24T10:05:00Z"
    }
  }
  ```

### 14.8 删除发卡图片

- **URL**: `/api/sent-cards/:id/images/:imageIndex`
- **方法**: `DELETE`
- **描述**: 删除指定发卡记录的特定图片
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "message": "图片删除成功",
      "imageUrls": [
        "https://example.com/sent-card1.jpg",
        "https://example.com/sent-card3.jpg"
      ]
    }
  }
  ```

### 14.9 关联收到的回卡

- **URL**: `/api/sent-cards/:id/link-received-card`
- **方法**: `POST`
- **描述**: 将收到的回卡与发出的卡片关联
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "receivedCardId": "60d21b4667d0d8992e610c96",
    "receivedDate": "2023-07-15T10:00:00Z"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "callsign": "JA1ABC",
      "isReceived": true,
      "receivedDate": "2023-07-15T10:00:00Z",
      "receivedCard": {
        "id": "60d21b4667d0d8992e610c96",
        "callsign": "JA1ABC",
        "contactDate": "2023-06-15T08:30:00Z"
      },
      "updatedAt": "2023-07-15T10:00:00Z"
    }
  }
  ```

### 14.10 解除回卡关联

- **URL**: `/api/sent-cards/:id/unlink-received-card`
- **方法**: `POST`
- **描述**: 解除发卡与回卡的关联
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c95",
      "callsign": "JA1ABC",
      "isReceived": false,
      "receivedDate": null,
      "receivedCard": null,
      "updatedAt": "2023-07-16T10:00:00Z"
    }
  }
  ```

### 14.11 获取发卡统计

- **URL**: `/api/sent-cards/stats`
- **方法**: `GET`
- **描述**: 获取当前用户的发卡统计信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "total": 100,
      "received": 65,
      "pending": 35,
      "byCountry": [
        { "country": "Japan", "sent": 20, "received": 15 },
        { "country": "USA", "sent": 15, "received": 10 },
        // 更多国家...
      ],
      "byContactType": [
        { "type": "shortwave", "sent": 50, "received": 35 },
        { "type": "satellite", "sent": 20, "received": 12 },
        { "type": "repeater", "sent": 15, "received": 10 },
        { "type": "direct", "sent": 10, "received": 5 },
        { "type": "eyeball_offline", "sent": 3, "received": 3 },
        { "type": "eyeball_online", "sent": 2, "received": 0 }
      ],
      "byMonth": [
        { "month": "2023-06", "sent": 30, "received": 20 },
        { "month": "2023-05", "sent": 25, "received": 15 },
        // 更多月份...
      ]
    }
  }
  ```

### 14.12 批量导出发卡记录

- **URL**: `/api/sent-cards/export`
- **方法**: `GET`
- **描述**: 批量导出发卡记录
- **请求头**: `Authorization: Bearer <token>`
- **查询参数**:
  - `format`: 导出格式（csv/excel/pdf），默认"excel"
  - `filter`: JSON字符串，包含筛选条件
  - `includeImages`: 是否包含图片链接，默认false
- **响应**: 直接下载文件

## 15. 卡片关联接口

为了支持收发卡的关联管理，系统提供了以下API接口：

### 15.1 关联发卡记录

- **URL**: `/api/cards/:id/link-sent-card`
- **方法**: `POST`
- **描述**: 将收到的卡片与发出的卡片关联
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "sentCardId": "60d21b4667d0d8992e610c95"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c96",
      "callsign": "JA1ABC",
      "sentCard": {
        "id": "60d21b4667d0d8992e610c95",
        "callsign": "JA1ABC",
        "contactDate": "2023-06-15T08:30:00Z"
      },
      "updatedAt": "2023-07-15T10:00:00Z"
    }
  }
  ```

### 15.2 解除发卡关联

- **URL**: `/api/cards/:id/unlink-sent-card`
- **方法**: `POST`
- **描述**: 解除收到的卡片与发出的卡片的关联
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d21b4667d0d8992e610c96",
      "callsign": "JA1ABC",
      "sentCard": null,
      "updatedAt": "2023-07-16T10:00:00Z"
    }
  }
  ```

### 15.3 查找匹配的发卡记录

- **URL**: `/api/cards/:id/find-matching-sent-cards`
- **方法**: `GET`
- **描述**: 查找与当前卡片可能匹配的发卡记录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c95",
        "callsign": "JA1ABC",
        "contactDate": "2023-06-15T08:30:00Z",
        "band": "20m",
        "mode": "SSB",
        "contactType": "shortwave",
        "sentDate": "2023-06-23T10:00:00Z",
        "isReceived": false,
        "matchScore": 0.95
      },
      // 更多匹配的发卡记录...
    ]
  }
  ```

### 15.4 查找匹配的收卡记录

- **URL**: `/api/sent-cards/:id/find-matching-received-cards`
- **方法**: `GET`
- **描述**: 查找与当前发卡记录可能匹配的收到的卡片
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "60d21b4667d0d8992e610c96",
        "callsign": "JA1ABC",
        "contactDate": "2023-06-15T08:30:00Z",
        "band": "20m",
        "mode": "SSB",
        "contactType": "shortwave",
        "receivedDate": "2023-07-10T10:00:00Z",
        "sentCard": null,
        "matchScore": 0.95
      },
      // 更多匹配的收卡记录...
    ]
  }
  ```

