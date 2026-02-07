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

def import_plants():
    """导入植物数据"""
    print("🌱 开始导入植物数据")
    print("="*60)
    
    # 连接数据库
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("✅ 数据库连接成功")
    except Error as e:
        print(f"❌ 数据库连接失败: {e}")
        return
    
    # 读取JSON数据
    plants = []
    print("\n📖 读取JSON文件...")
    json_path = r'g:\work\zhiwuzhushou-master\doc\植物数据\cleaned_plants.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        plants = json.load(f)
    print(f"✅ 读取到 {len(plants)} 条数据")
    
    # 1. 获取科名 ID 映射
    print("📋 正在获取科名 ID 映射...")
    cursor.execute("SELECT id, name FROM families")
    family_map = {name: fid for fid, name in cursor.fetchall()}
    print(f"✅ 获取到 {len(family_map)} 个科的映射关系")

    # 2. 插入数据
    print("🚀 开始写入数据库...")
    success_count = 0
    error_count = 0
    errors = {}
    
    insert_query = """
    INSERT INTO plants (
        chinese_name, scientific_name, english_name, alias, 
        family, family_id, genus, description, history, morphology, 
        habitat, distribution, flowering_period, image_url
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    for i, plant in enumerate(plants, 1):
        try:
            # 确保 alias 是字符串格式的 JSON 数组
            alias_val = plant.get('alias', '[]')
            if isinstance(alias_val, list):
                alias_val = json.dumps(alias_val, ensure_ascii=False)
            
            # 获取 family_id
            fname = plant.get('family')
            fid = family_map.get(fname)
            
            values = (
                plant.get('chinese_name'),
                plant.get('scientific_name'),
                plant.get('english_name'),
                alias_val,
                fname,
                fid,
                plant.get('genus'),
                plant.get('description'),
                plant.get('history'),
                plant.get('morphology'),
                plant.get('habitat'),
                plant.get('distribution'),
                plant.get('flowering_period'),
                plant.get('image_url')
            )
            cursor.execute(insert_query, values)
            success_count += 1
            if i % 50 == 0:
                print(f"📦 已处理 {i}/{len(plants)} 条 ({success_count} 成功, {error_count} 失败)...")
        except Exception as e:
            error_count += 1
            error_msg = str(e)
            print(f"❌ 导入 [{plant.get('chinese_name')}] 失败: {error_msg}")
            if error_msg not in errors:
                errors[error_msg] = []
            errors[error_msg].append(plant.get('chinese_name', '未知'))
    
    # 提交
    conn.commit()
    
    # 显示结果
    print(f"\n{'='*60}")
    print(f"✅ 导入完成!")
    print(f"  成功: {success_count} 条")
    print(f"  失败: {error_count} 条")
    print(f"{'='*60}")
    
    # 数据库总量统计
    cursor.execute("SELECT COUNT(*) FROM plants")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM plants WHERE family_id IS NOT NULL")
    linked = cursor.fetchone()[0]
    print(f"\n📊 最终统计:")
    print(f"  总记录数: {total}")
    print(f"  已关联科 (family_id): {linked}")
    
    cursor.close()
    conn.close()
    print(f"\n🔌 数据库连接已关闭")

if __name__ == "__main__":
    import_plants()
