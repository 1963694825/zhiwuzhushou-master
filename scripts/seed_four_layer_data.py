import mysql.connector

def seed_four_layer_data():
    try:
        conn = mysql.connector.connect( host='localhost', user='root', password='root', database='plant_assistant' )
        cursor = conn.cursor()

        # 1. 一级大类
        primaries = ['水果', '蔬菜', '花卉', '草药', '多肉', '经济作物']
        primary_ids = {}
        for idx, p in enumerate(primaries):
            cursor.execute("INSERT INTO knowledge_primary_categories (name, sort_order) VALUES (%s, %s)", (p, idx))
            primary_ids[p] = cursor.lastrowid

        # 2. 详细层级数据 (根据需求文档)
        data_map = {
            '水果': {
                '灌木类水果': ['蓝莓', '树莓', '沙棘', '桑葚', '刺梨', '灯笼果', '金桔', '柠檬', '无花果', '杈杷果', '欧李'],
                '果树类水果': ['苹果', '梨', '桃', '李', '杏', '樱桃', '柿子', '枣', '山楂', '石榴', '荔枝', '龙眼', '芒果', '柚子', '橙子', '枇杷', '杨梅', '橄榄'],
                '藤蔓类水果': ['葡萄', '猕猴桃', '百香果', '火龙果', '西瓜', '甜瓜', '哈密瓜', '罗汉果', '软枣猕猴桃'],
                '草本类水果': ['草莓', '菠萝', '香蕉', '芭蕉', '人参果', '圣女果'],
                '水生类水果': ['莲藕', '菱角', '芡实', '莲蓬', '莼菜']
            },
            '蔬菜': {
                '叶菜类蔬菜': ['白菜', '生菜', '菠菜', '油麦菜', '芹菜', '香菜', '韭菜', '茼蒿', '空心菜', '木耳菜', '娃娃菜', '甘蓝', '西兰花', '菜花', '芥蓝', '油菜'],
                '瓜果类蔬菜': ['黄瓜', '番茄', '茄子', '辣椒', '冬瓜', '南瓜', '丝瓜', '苦瓜', '西葫芦', '节瓜', '瓠瓜', '秋葵'],
                '豆类蔬菜': ['黄豆', '绿豆', '红豆', '豌豆', '蚕豆', '扁豆', '四季豆', '豇豆', '荷兰豆', '芸豆', '刀豆'],
                '根茎类蔬菜': ['萝卜', '胡萝卜', '土豆', '红薯', '紫薯', '山药', '芋头', '生姜', '大蒜', '洋葱', '百合', '荸荠', '茨菇'],
                '菌菇类蔬菜': ['香菇', '金针菇', '平菇', '杏鲍菇', '木耳', '银耳', '竹荪', '羊肚菌', '牛肝菌', '茶树菇', '口蘑'],
                '水生类蔬菜': ['茭白', '水芹', '菱角', '芡实', '莼菜']
            }
            # 其他分类可以在后续根据文档继续补充...
        }

        for p_name, secondaries in data_map.items():
            p_id = primary_ids[p_name]
            for s_name, species_list in secondaries.items():
                cursor.execute("INSERT INTO knowledge_secondary_categories (primary_id, name) VALUES (%s, %s)", (p_id, s_name))
                s_id = cursor.lastrowid
                for s_species in species_list:
                    cursor.execute("INSERT INTO knowledge_species (secondary_id, name) VALUES (%s, %s)", (s_id, s_species))

        conn.commit()
        print("✅ Four-layer data seeding completed.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    seed_four_layer_data()
