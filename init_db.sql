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
