import mysql.connector

def seed_knowledge_data():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='plant_assistant'
        )
        cursor = conn.cursor()

        # 定义大类
        primary_categories = [
            '水果', '蔬菜', '花卉', '草药', '多肉', '经济作物'
        ]

        # 定义品种 (部分示例)
        species_data = {
            '水果': ['蓝莓', '树莓', '桑葚', '苹果', '梨', '桃', '葡萄', '草莓', '菠萝'],
            '蔬菜': ['白菜', '生菜', '番茄', '黄瓜', '茄子', '辣椒', '土豆', '胡萝卜'],
            '花卉': ['月季', '牡丹', '郁金香', '百合', '荷花', '多肉花卉', '君子兰'],
            '草药': ['人参', '黄芪', '甘草', '薄荷', '艾草', '菊花', '枸杞'],
            '多肉': ['生石花', '肉锥花', '芦荟', '玉露', '仙人掌', '多肉景天'],
            '经济作物': ['水稻', '小麦', '棉花', '茶叶', '咖啡', '橡胶树']
        }

        # 1. 注入一级大类
        inserted_primaries = {}
        for idx, name in enumerate(primary_categories):
            cursor.execute("INSERT INTO knowledge_primary_categories (name, sort_order) VALUES (%s, %s)", (name, idx))
            inserted_primaries[name] = cursor.lastrowid

        # 2. 注入品种
        for p_name, species_list in species_data.items():
            p_id = inserted_primaries[p_name]
            for idx, s_name in enumerate(species_list):
                cursor.execute("INSERT INTO knowledge_species (primary_id, name, sort_order) VALUES (%s, %s, %s)", (p_id, s_name, idx))

        conn.commit()
        print("✅ Seeding completed successfully.")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    seed_knowledge_data()
