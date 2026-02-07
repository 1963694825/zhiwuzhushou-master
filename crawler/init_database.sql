-- 植物数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS plant_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE plant_assistant;

-- 创建植物表
CREATE TABLE IF NOT EXISTS plants (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    chinese_name VARCHAR(100) NOT NULL COMMENT '中文名',
    scientific_name VARCHAR(200) COMMENT '学名',
    english_name VARCHAR(100) COMMENT '英文名',
    alias TEXT COMMENT '别名（JSON数组）',
    family VARCHAR(100) COMMENT '科',
    genus VARCHAR(100) COMMENT '属',
    description TEXT COMMENT '简介',
    morphology TEXT COMMENT '形态特征',
    habitat TEXT COMMENT '生长环境',
    distribution TEXT COMMENT '分布地区',
    flowering_period VARCHAR(50) COMMENT '花期',
    image_url VARCHAR(500) COMMENT '图片链接',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_chinese_name (chinese_name),
    INDEX idx_scientific_name (scientific_name),
    INDEX idx_family (family),
    
    -- 全文索引（用于中文搜索）
    FULLTEXT INDEX ft_search (chinese_name, description) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='植物数据表';

-- 显示表结构
DESCRIBE plants;

SELECT '✅ 数据库初始化完成！' AS status;
