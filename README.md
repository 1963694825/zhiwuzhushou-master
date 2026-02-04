# 植物助手 (Plant Assistant) - 微信小程序项目

![Logo](https://images.unsplash.com/photo-1711715337544-e6c99dbd801a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzcwMDA0ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)

## 项目简介
**植物助手**是一款基于 `uni-app` 开发的智慧种植辅助小程序。它为植物爱好者提供了一站式的解决方案，包括植物库浏览、专业养护指导、绿植商城以及个人种植管理。本项目已完整集成了微信一键登录功能。

---

## 核心功能
- 🍀 **智慧首页**：搜索植物、快速识别（预留）、今日热门推荐。
- 🛒 **绿植商城**：双栏分类浏览、商品详情、一键加购（UI实现）。
- 📖 **知识科普**：按分类（养护、防治、品种等）查阅专业种植知识。
- 🔑 **微信登录**：基于微信最新“头像昵称填写”规范的完整登录闭环。
- 👤 **个人中心**：管理个人档案、查看订单统计及服务工具。

---

## 技术栈
### 前端 (Frontend)
- **框架**: [uni-app](https://uniapp.dcloud.net.cn/) (Vue 3)
- **UI 组件**: uni-ui
- **样式**: SCSS / CSS3 变量
- **适配**: 完美适配 iOS/Android 各类异形屏（动态胶囊位计算）

### 后端 (Backend)
- **框架**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **数据库**: [MySQL 5.7+](https://www.mysql.com/)
- **鉴权**: JWT (JSON Web Token)
- **通信**: Axios & RESTful API

---

## 快速开始

### 1. 数据库准备
在 MySQL 中执行项目根目录下的 `database_design.md` 或 `init_db.sql` 脚本，创建 `plant_assistant` 数据库及 `users` 表。

### 2. 后端配置与启动
```bash
cd server
npm install
```
编辑 `.env` 文件，完善您的数据库及微信小程序凭证：
```env
DB_PASS=您的密码
WX_APPID=您的AppID
WX_APPSECRET=您的AppSecret
```
启动服务：
```bash
npm run dev
```

### 3. 前端运行
1. 使用 **HBuilderX** 打开本项目。
2. 配置 `manifest.json` 中的 `appid`。
3. 点击 `运行 -> 运行到小程序模拟器 -> 微信开发者工具`。

---

## 项目文档
- [开发流程总览](development_process.md)
- [数据库设计详情](database_design.md)
- [微信登录实现方案](login_plan.md)

---

## 后续规划
- [ ] 集成微信支付 (商城模块)
- [ ] 接入植物识别 AI 接口
- [ ] 完善订单与物流查询功能

---

## 许可证
[MIT License](LICENSE)
