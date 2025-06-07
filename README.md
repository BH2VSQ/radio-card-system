# 业余无线电卡片管理入库系统

一个基于Node.js和React的业余无线电卡片管理系统，支持二维码标签管理、RFID识别和卡片分类整理功能。

## 功能特点

- **卡片管理**：支持多种通联类型（卫星通联、短波通联、中继通联、本地直频通联、线下EYEBALL、线上EYEBALL）
- **二维码标签**：生成和识别卡片二维码，支持自定义编码格式
- **RFID识别**：支持RFID标签读写和设备管理
- **分类整理**：多级分类和标签管理
- **EYEBALL卡**：支持EYEBALL卡的记录存档和证书生成
- **发卡管理**：支持发卡与收卡的关联管理
- **呼号关联**：支持单人多呼号的关联管理
- **跨平台支持**：响应式设计，支持桌面和移动设备

## 技术栈

### 后端

- **运行环境**：Node.js
- **Web框架**：Express.js
- **数据库**：MongoDB
- **ORM/ODM**：Mongoose
- **身份认证**：JWT (JSON Web Token)
- **API文档**：Swagger
- **文件上传**：Multer
- **二维码生成**：qrcode
- **RFID通信**：nfc-pcsc

### 前端

- **框架**：React.js
- **UI组件库**：Tailwind CSS + shadcn/ui
- **路由**：React Router
- **状态管理**：React Context API
- **HTTP客户端**：Axios
- **表单处理**：React Hook Form
- **二维码扫描**：jsQR
- **NFC功能**：Web NFC API

## 系统架构

系统采用前后端分离架构：

- **后端**：RESTful API服务，处理数据存储、业务逻辑和身份验证
- **前端**：响应式Web应用，提供用户界面和交互功能
- **数据库**：MongoDB存储卡片、用户和系统数据

## 安装与使用

### 后端

```bash
# 进入后端目录
cd radio_card_system

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置数据库连接等参数

# 启动服务
npm start
```

### 前端

```bash
# 进入前端目录
cd radio_card_system/frontend/radio-card-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## API文档

启动后端服务后，可以通过以下URL访问API文档：

```
http://localhost:5000/api-docs
```

## 部署

### 使用Docker部署

```bash
# 构建Docker镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## 许可证

[MIT](LICENSE)

## 贡献

欢迎提交问题和拉取请求！

