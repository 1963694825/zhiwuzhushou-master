import mysql.connector

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'plant_assistant'
}

def update_counts():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("📊 正在统计各科植物数量...")
        
        # 1. 获取各个科的统计数据
        cursor.execute("""
            SELECT family_id, COUNT(*) as count 
            FROM plants 
            WHERE family_id IS NOT NULL 
            GROUP BY family_id
        """)
        stats = cursor.fetchall()
        
        # 2. 更新 families 表
        print(f"🚀 正在更新 {len(stats)} 个科的统计信息...")
        update_query = "UPDATE families SET plant_count = %s WHERE id = %s"
        
        for family_id, count in stats:
            cursor.execute(update_query, (count, family_id))
            
        conn.commit()
        print("✅ 统计更新完成！")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    update_counts()
