import mysql.connector

def seed_comprehensive_knowledge():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='plant_assistant'
        )
        cursor = conn.cursor()

        # 1. 清理旧数据
        print("Cleaning old data...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("TRUNCATE TABLE knowledge_species_category_mapping")
        cursor.execute("TRUNCATE TABLE knowledge_species")
        cursor.execute("TRUNCATE TABLE knowledge_secondary_categories")
        cursor.execute("TRUNCATE TABLE knowledge_primary_categories")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        # 2. 定义数据结构
        data = {
            '水果': {
                '灌木类水果': ['蓝莓', '树莓', '沙棘', '桑葚', '刺梨', '灯笼果', '金桔', '柠檬', '无花果', '杈杷果', '欧李'],
                '果树类水果': ['苹果', '梨', '桃', '李', '杏', '樱桃', '柿子', '枣', '山楂', '石榴', '荔枝', '龙眼', '芒果', '柚子', '橙子', '枇杷', '杨梅', '橄榄'],
                '藤蔓类水果': ['葡萄', '猕猴桃', '百香果', '火龙果', '西瓜', '甜瓜', '哈密瓜', '丝瓜', '苦瓜', '罗汉果', '软枣猕猴桃'],
                '草本类水果': ['草莓', '菠萝', '香蕉', '芭蕉', '人参果', '圣女果', '西瓜', '甜瓜'],
                '水生类水果': ['莲藕', '菱角', '芡实', '莲蓬', '莼菜']
            },
            '蔬菜': {
                '叶菜类蔬菜': ['白菜', '生菜', '菠菜', '油麦菜', '芹菜', '香菜', '韭菜', '茼蒿', '空心菜', '木耳菜', '娃娃菜', '甘蓝', '西兰花', '菜花', '芥蓝', '雪里蕻', '油菜'],
                '瓜果类蔬菜': ['黄瓜', '番茄', '茄子', '辣椒', '冬瓜', '南瓜', '丝瓜', '苦瓜', '西葫芦', '节瓜', '瓠瓜', '菜瓜', '圣女果', '秋葵'],
                '豆类蔬菜': ['黄豆', '绿豆', '红豆', '豌豆', '蚕豆', '扁豆', '四季豆', '豇豆', '荷兰豆', '芸豆', '刀豆'],
                '根茎类蔬菜': ['萝卜', '胡萝卜', '土豆', '红薯', '紫薯', '山药', '芋头', '莲藕', '生姜', '大蒜', '洋葱', '百合', '荸荠', '茨菇'],
                '菌菇类蔬菜': ['香菇', '金针菇', '平菇', '杏鲍菇', '木耳', '银耳', '竹荪', '羊肚菌', '牛肝菌', '鸡枞菌', '茶树菇', '口蘑'],
                '水生类蔬菜': ['茭白', '水芹', '菱角', '芡实', '莼菜']
            },
            '花卉': {
                '一年生花卉': ['百日草', '万寿菊', '波斯菊', '矮牵牛', '孔雀草', '凤仙花', '鸡冠花', '一串红', '千日红', '夏堇', '长春花'],
                '多年生花卉': ['月季', '牡丹', '芍药', '菊花', '兰花', '郁金香', '百合', '鸢尾', '玉簪', '萱草', '耧斗菜', '石竹', '天竺葵', '非洲菊'],
                '藤本花卉': ['月季（藤本）', '蔷薇', '紫藤', '凌霄花', '三角梅', '绿萝', '常春藤', '金银花', '铁线莲', '牵牛花'],
                '球根花卉': ['郁金香', '百合', '水仙', '风信子', '朱顶红', '唐菖蒲', '大丽花', '美人蕉', '石蒜', '文殊兰', '马蹄莲'],
                '水生花卉': ['荷花', '睡莲', '碗莲', '菖蒲', '香蒲', '水生鸢尾', '凤眼莲', '千屈菜', '金鱼藻'],
                '多肉花卉': ['仙人掌', '仙人球', '长寿花', '蟹爪兰', '令箭荷花', '玉露'],
                '室内观花花卉': ['君子兰', '蝴蝶兰', '栀子花', '茉莉花', '米兰花', '白掌', '红掌', '鹤望兰', '四季海棠', '倒挂金钟']
            },
            '草药': {
                '根茎类草药': ['人参', '当归', '黄芪', '甘草', '白术', '白芍', '川芎', '天麻', '丹参', '党参', '麦冬', '玉竹', '地黄', '黄连', '黄芩'],
                '茎叶类草药': ['薄荷', '紫苏', '艾草', '藿香', '蒲公英', '车前草', '马齿苋', '青蒿', '茵陈', '淡竹叶', '紫苏叶', '桑叶', '荷叶'],
                '花类草药': ['金银花', '菊花', '玫瑰花', '桂花', '红花', '槐花', '辛夷', '款冬花', '合欢花'],
                '果实种子类草药': ['枸杞', '决明子', '山楂', '莲子', '杏仁', '桃仁', '大枣', '桂圆', '连翘', '紫苏子', '苍耳子'],
                '全草类草药': ['蒲公英', '马齿苋', '车前草', '青蒿', '茵陈', '益母草', '半边莲', '白花蛇舌草', '大青叶', '薄荷'],
                '藤蔓树皮类草药': ['杜仲', '桑白皮', '桂枝', '忍冬藤', '鸡血藤', '络石藤', '厚朴', '黄柏']
            },
            '多肉': {
                '景天科多肉': ['玉树', '薄雪万年草', '观音莲', '玉蝶', '桃蛋', '吉娃娃', '钱串', '小米星', '长寿花', '不死鸟', '虹之玉', '乙女心', '冰莓', '月影', '熊童子', '黄熊'],
                '仙人掌科多肉': ['普通仙人掌', '黄毛掌', '白毛掌', '绯花玉', '龙王球', '玉翁', '星球', '玉露锦', '绯牡丹', '火龙果幼苗', '量天尺', '昙花', '令箭荷花', '蟹爪兰', '假昙花'],
                '番杏科多肉': ['生石花', '肉锥花', '照波', '奔龙', '唐扇', '鹿角海棠', '佛手掌'],
                '百合科多肉': ['玉露', '玉扇', '寿', '万象', '芦荟', '不夜城芦荟', '库拉索芦荟', '多肉型风信子', '条纹十二卷', '鹰爪十二卷'],
                '萝藦科多肉': ['爱之蔓', '心叶球兰', '吊灯花', '球兰', '豹皮花', '犀角', '大花犀角'],
                '其他科属多肉': ['太阳花', '雅乐之舞', '佛珠', '情人泪', '紫玄月', '沙漠玫瑰', '空气凤梨']
            },
            '经济作物': {
                '粮食类经济作物': ['水稻', '小麦', '玉米', '高粱', '谷子', '燕麦', '大麦', '荞麦', '糜子', '青稞', '黄豆', '绿豆', '红豆'],
                '油料类经济作物': ['油菜', '花生', '大豆', '芝麻', '向日葵', '油茶', '油橄榄', '亚麻', '胡麻', '蓖麻', '苏子'],
                '纤维类经济作物': ['棉花', '苎麻', '亚麻', '黄麻', '红麻', '大麻', '桑树', '木棉'],
                '糖料类经济作物': ['甘蔗', '甜菜', '甜叶菊', '芦粟'],
                '饮料类经济作物': ['茶叶', '咖啡', '可可', '菊花', '金银花', '薄荷'],
                '工业原料类经济作物': ['烟草', '橡胶树', '杜仲', '漆树', '芦苇', '剑麻'],
                '香料类经济作物': ['胡椒', '花椒', '八角', '桂皮', '香叶', '薄荷', '紫苏', '丁香', '肉桂', '茴香']
            }
        }

        # 3. 插入一级分类
        inserted_primaries = {}
        for idx, p_name in enumerate(data.keys()):
            cursor.execute("INSERT INTO knowledge_primary_categories (name, sort_order) VALUES (%s, %s)", (p_name, idx))
            inserted_primaries[p_name] = cursor.lastrowid

        # 4. 插入二级分类和品种
        inserted_species = {} # 防止重复插入相同品种

        for p_name, secondary_map in data.items():
            p_id = inserted_primaries[p_name]
            for s_idx, (s_name, species_list) in enumerate(secondary_map.items()):
                # 插入二级分类
                cursor.execute("INSERT INTO knowledge_secondary_categories (primary_id, name, sort_order) VALUES (%s, %s, %s)", (p_id, s_name, s_idx))
                s_id = cursor.lastrowid
                
                for sp_idx, sp_name in enumerate(species_list):
                    # 插入品种（如果尚未插入）
                    if sp_name not in inserted_species:
                        cursor.execute("INSERT INTO knowledge_species (name, sort_order) VALUES (%s, %s)", (sp_name, sp_idx))
                        sp_id = cursor.lastrowid
                        inserted_species[sp_name] = sp_id
                    else:
                        sp_id = inserted_species[sp_name]
                    
                    # 建立关联
                    cursor.execute("INSERT INTO knowledge_species_category_mapping (species_id, primary_id, secondary_id) VALUES (%s, %s, %s)", (sp_id, p_id, s_id))

        conn.commit()
        print(f"✅ Seeding completed! {len(inserted_primaries)} primaries, {len(inserted_species)} species inserted.")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    seed_comprehensive_knowledge()
