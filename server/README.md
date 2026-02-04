# 植物助手后端 - 开发说明文档

本项目是基于 **Node.js (Express)** 搭建的后端服务，主要为“植物助手”小程序提供数据支持。

---

## 1. 技术栈
- **运行环境**: Node.js
- **Web 框架**: Express
- **数据库**: MySQL (使用 `mysql2` 驱动)
- **身份验证**: JWT (JSON Web Token)
- **网络请求**: Axios (用于请求微信 API)

---

## 2. 目录结构
```text
/server
  ├── app.js        # 入口文件，包含 API 路由和中间件
  ├── db.js         # 数据库连接池配置文件
  ├── .env          # 环境配置文件 (存放敏感凭证)
  └── package.json  # 依赖管理文件
```

---

## 3. 开发环境配置

### 第一步：安装依赖
在 `server` 目录下执行：
```bash
npm install
```

### 第二步：配置环境变量
打开 `.env` 文件，完善以下配置：
- `DB_PASS`: 您的数据库密码（默认为 root）。
- `WX_APPID`: 您在微信公众平台的小程序 AppID。
- `WX_APPSECRET`: 您在微信公众平台的小程序 AppSecret。

---

## 4. 核心功能实现说明

### 微信登录接口 (`POST /api/login`)
- **逻辑**: 接收前端 `code` -> 换取 `openid` -> 查/增 `users` 表 -> 生成并返回 `token`。
- **安全性**: 使用后端直接连接微信 API，确保 `AppSecret` 不外泄。

---

## 5. 如何运行

### 本地开发模式 (自动重启)
```bash
npm run dev
```

### 生产执行
```bash
node app.js
```

---

## 6. 后续扩展计划 (商城功能)
- **支付模块**: 增加 `/api/pay` 接口，集成微信支付 V3 SDK。
- **订单模块**: 增加 `orders` 表，记录用户下单及物流状态。
- **商品模块**: 增加 `products` 表，实现商品列表、详情及搜索功能。

---

## 7. 接口验证示例 (使用 cURL)
```bash
curl -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"code": "YOUR_JS_CODE"}'
```
