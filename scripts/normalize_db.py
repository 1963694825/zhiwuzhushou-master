import mysql.connector
from mysql.connector import Error

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'plant_assistant',
    'charset': 'utf8mb4'
}

def normalize_database():
    """规范化数据库：创建 families 表并转换 plants 表关联"""
    print("🛠️ 开始数据库规范化流程...")
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 1. 创建 families 表
        print("1. 创建 families 表...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS families (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        
        # 2. 从 plants 表提取不重复的科名并插入 families
        print("2. 提取并迁移科属数据...")
        cursor.execute("SELECT DISTINCT family FROM plants WHERE family IS NOT NULL AND family != ''")
        families = [row[0] for row in cursor.fetchall()]
        
        for name in families:
            cursor.execute("INSERT IGNORE INTO families (name) VALUES (%s)", (name,))
        
        print(f"✅ 已同步 {len(families)} 个科至 families 表")
        
        # 3. 修改 plants 表，添加 family_id 列
        print("3. 为 plants 表添加 family_id 外键列...")
        # 检查列是否存在
        cursor.execute("SHOW COLUMNS FROM plants LIKE 'family_id'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE plants ADD COLUMN family_id INT AFTER family")
            cursor.execute("ALTER TABLE plants ADD CONSTRAINT fk_plant_family FOREIGN KEY (family_id) REFERENCES families(id)")
        
        # 4. 更新 family_id 关联关系
        print("4. 建立数据关联...")
        cursor.execute("SELECT id, name FROM families")
        family_map = {name: fid for fid, name in cursor.fetchall()}
        
        update_count = 0
        for name, fid in family_map.items():
            cursor.execute("UPDATE plants SET family_id = %s WHERE family = %s", (fid, name))
            update_count += cursor.rowcount
            
        print(f"✅ 已成功关联 {update_count} 条植物记录")
        
        conn.commit()
        print("\n🎉 数据库规范化完成！")
        
    except Error as e:
        print(f"❌ 发生错误: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    normalize_database()
