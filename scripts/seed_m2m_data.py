import mysql.connector

def seed_m2m_data():
    try:
        conn = mysql.connector.connect( host='localhost', user='root', password='root', database='plant_assistant' )
        cursor = conn.cursor()

        # 1. 大类
        primaries = ['水果', '蔬菜', '花卉', '草药', '多肉', '经济作物']
        p_ids = {}
        for idx, p in enumerate(primaries):
            cursor.execute("INSERT INTO knowledge_primary_categories (name, sort_order) VALUES (%s, %s)", (p, idx))
            p_ids[p] = cursor.lastrowid

        # 2. 二级细分
        s_data = {
            '水果': ['灌木类', '果树类', '藤蔓类', '草本类', '水生类'],
            '蔬菜': ['叶菜类', '瓜果类', '豆类', '根茎类', '菌菇类', '水生类']
        }
        s_ids = {}
        for p_name, subs in s_data.items():
            p_id = p_ids[p_name]
            for s_name in subs:
                cursor.execute("INSERT INTO knowledge_secondary_categories (primary_id, name) VALUES (%s, %s)", (p_id, s_name))
                s_ids[f"{p_name}-{s_name}"] = cursor.lastrowid

        # 3. 品种录入 (部分示例)
        species_list = ['蓝莓', '番茄', '莲藕', '苹果', '人参', '蝴蝶兰']
        sp_ids = {}
        for sp in species_list:
            cursor.execute("INSERT INTO knowledge_species (name) VALUES (%s)", (sp,))
            sp_ids[sp] = cursor.lastrowid

        # 4. 【核心】映射关联
        # 蓝莓 -> 水果 (灌木类)
        cursor.execute("INSERT INTO knowledge_species_category_mapping VALUES (%s, %s, %s)", (sp_ids['蓝莓'], p_ids['水果'], s_ids['水果-灌木类']))
        # 番茄 -> 蔬菜 (瓜果类)
        cursor.execute("INSERT INTO knowledge_species_category_mapping VALUES (%s, %s, %s)", (sp_ids['番茄'], p_ids['蔬菜'], s_ids['蔬菜-瓜果类']))
        # 莲藕 -> 水果 (水生类) AND 蔬菜 (水生类) - 实现交叉品类
        cursor.execute("INSERT INTO knowledge_species_category_mapping VALUES (%s, %s, %s)", (sp_ids['莲藕'], p_ids['水果'], s_ids['水果-水生类']))
        cursor.execute("INSERT INTO knowledge_species_category_mapping VALUES (%s, %s, %s)", (sp_ids['莲藕'], p_ids['蔬菜'], s_ids['蔬菜-水生类']))

        conn.commit()
        print("✅ M2M Data seeding completed (including cross-category examples like Lotus root).")
    finally:
        cursor.close(); conn.close()

if __name__ == "__main__": seed_m2m_data()
