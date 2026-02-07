import json
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

def rebuild_families():
    print("🌿 开始重建科属数据")
    print("="*60)
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 1. 清空旧数据
        print("🗑️ 正在清空 families 表...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("TRUNCATE TABLE families")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        
        # 2. 从 JSON 中提取唯一的科
        print("📖 读取最新植物数据并提取科名...")
        json_path = r'g:\work\zhiwuzhushou-master\doc\植物数据\cleaned_plants.json'
        with open(json_path, 'r', encoding='utf-8') as f:
            plants = json.load(f)
        
        # 提取唯一的科（并保持字典序或根据出现频率排序，这里简单使用 set）
        family_names = sorted(list({p['family'] for p in plants if p.get('family')}))
        
        # 3. 重新插入
        print(f"🚀 正在插入 {len(family_names)} 个科名...")
        insert_query = "INSERT INTO families (name, description, plant_count) VALUES (%s, %s, %s)"
        for i, name in enumerate(family_names, 1):
            cursor.execute(insert_query, (name, f"{name}的科普描述信息。", 0))
            if i % 20 == 0:
                print(f"  已插入 {i}/{len(family_names)}...")
            
        conn.commit()
        print(f"✅ 重建完成！共成功插入 {len(family_names)} 条记录到 families 表。")
        print("💡 请注意：重建科属表后各科 plant_count 默认为 0，请在导入植物后运行 update_family_plant_counts.py 进行同步。")
        
        # 验证一下
        cursor.execute("SELECT COUNT(*) FROM families")
        db_count = cursor.fetchone()[0]
        print(f"🔍 数据库中 families 表当前记录数: {db_count}")
        
        cursor.close()
        conn.close()
    except Error as e:
        print(f"❌ 错误: {e}")

if __name__ == "__main__":
    rebuild_families()
