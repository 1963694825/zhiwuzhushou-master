# 植物助手 - 数据库设计方案 (第一步)

为了支持微信登录，我们需要建立一个基础的用户表来存储微信返回的身份信息以及用户的基本资料。

## 1. 数据库选型建议
- **推荐**: MySQL 5.7+ 或 MariaDB
- **理由**: 社区支持广，性能稳定，易于与主流后端框架（Node.js, PHP, Java 等）集成。

---

## 2. 用户表 (users) 结构设计

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | 用户唯一内部 ID |
| `openid` | `VARCHAR(64)` | `UNIQUE, NOT NULL` | 微信用户唯一标识 (全小程序的唯一键) |
| `nickname` | `VARCHAR(50)` | `DEFAULT ''` | 用户昵称 |
| `avatar_url` | `VARCHAR(255)` | `DEFAULT ''` | 用户头像链接 |
| `gender` | `TINYINT` | `DEFAULT 0` | 性别 (0:未知, 1:男, 2:女) |
| `token` | `VARCHAR(255)` | `INDEX` | 当前登录凭证 (用于 API 鉴权) |
| `last_login` | `DATETIME` | - | 最后登录时间 |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | 注册时间 |

---

## 3. 初始化 SQL 脚本

```sql
CREATE DATABASE IF NOT EXISTS `plant_assistant` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `plant_assistant`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(64) NOT NULL COMMENT '微信OpenID',
  `nickname` VARCHAR(50) DEFAULT '' COMMENT '用户昵称',
  `avatar_url` VARCHAR(255) DEFAULT '' COMMENT '头像地址',
  `gender` TINYINT(1) DEFAULT 0 COMMENT '性别 0:未知 1:男 2:女',
  `token` VARCHAR(255) DEFAULT NULL COMMENT '登录凭证',
  `last_login` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_openid` (`openid`),
  INDEX `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

---

## 4. 后续操作执行建议
1. **执行 SQL**: 请在您的数据库管理工具（如 Navicat, MySQL Workbench 或 phpMyAdmin）中执行上述脚本。
2. **确认后端方案**: 您希望后端使用哪种语言实现？
   - **Node.js (Express/Koa)**: 适合轻量级、高性能，且与前端语言统一。
   - **uniCloud**: 阿里云/腾讯云提供的云开发，无需自建服务器。
   - **PHP / Python / 其他**: 根据您的习惯选择。

**请告诉我您的后端选型，以便我为您执行“第二步：后端接口开发”。**
