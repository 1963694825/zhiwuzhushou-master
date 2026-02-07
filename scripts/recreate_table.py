import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='plant_assistant'
)

cursor = conn.cursor()

print("🗑️  删除旧表...")
cursor.execute("DROP TABLE IF EXISTS plants")

print("📋 创建新表...")

create_table_sql = """
CREATE TABLE plants (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    chinese_name VARCHAR(100) NOT NULL COMMENT '中文名',
    scientific_name VARCHAR(200) COMMENT '学名',
    english_name VARCHAR(100) COMMENT '英文名',
    alias TEXT COMMENT '别名(JSON数组)',
    family VARCHAR(100) COMMENT '科',
    genus VARCHAR(100) COMMENT '属',
    description TEXT COMMENT '简介',
    history TEXT COMMENT '植物学史',
    morphology TEXT COMMENT '形态特征',
    habitat TEXT COMMENT '生长环境',
    distribution TEXT COMMENT '分布地区',
    flowering_period VARCHAR(50) COMMENT '花期',
    image_url VARCHAR(500) COMMENT '图片链接',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_chinese_name (chinese_name),
    INDEX idx_scientific_name (scientific_name),
    INDEX idx_family (family),
    FULLTEXT INDEX ft_search (chinese_name, description) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='植物数据表'
"""

cursor.execute(create_table_sql)
conn.commit()

print("✅ 表创建成功")

# 显示表结构
print(f"\n📋 表结构:")
print("="*60)
cursor.execute("DESCRIBE plants")
for row in cursor.fetchall():
    print(f"  {row[0]:20} {row[1]:30}")

cursor.close()
conn.close()

print(f"\n✅ 完成!现在可以导入数据了")
