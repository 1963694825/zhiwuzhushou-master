import mysql.connector

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'plant_assistant'
}

def debug_search(q):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        # 1. 模拟搜索逻辑
        search_pattern = f"%{q}%"
        cursor.execute("""
            SELECT id, chinese_name, family, family_id 
            FROM plants 
            WHERE chinese_name LIKE %s 
               OR scientific_name LIKE %s
               OR english_name LIKE %s
            LIMIT 5
        """, (search_pattern, search_pattern, search_pattern))
        
        matches = cursor.fetchall()
        print(f"--- 关键词 '{q}' 的初步匹配结果 ---")
        for m in matches:
            print(m)
            
        if matches:
            fid = matches[0]['family_id']
            fname = matches[0]['family']
            print(f"\n--- 尝试获取同科 (科名: {fname}, ID: {fid}) 的成员 ---")
            
            if fid:
                cursor.execute("SELECT id, chinese_name FROM plants WHERE family_id = %s LIMIT 10", (fid,))
                family_members = cursor.fetchall()
                print(f"同科成员数量 (前10): {len(family_members)}")
                for member in family_members:
                    print(f"  - {member['chinese_name']} (ID: {member['id']})")
            else:
                print("错误: family_id 为空，无法关联！")
        else:
            print("未找到任何匹配记录。")
            
        conn.close()
    except Exception as e:
        print(f"发生错误: {e}")

if __name__ == "__main__":
    debug_search("兰花")
