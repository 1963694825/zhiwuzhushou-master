import json
import random
import string
from datetime import datetime

# 基础植物数据池（保证科属对应、属性真实）
FAMILY_GENUS = [
    ("银杏科", "银杏属"), ("蔷薇科", "蔷薇属"), ("蔷薇科", "樱属"), ("菊科", "菊属"),
    ("兰科", "兰属"), ("毛茛科", "毛茛属"), ("木兰科", "木兰属"), ("樟科", "樟属"),
    ("豆科", "槐属"), ("禾本科", "竹属"), ("松科", "松属"), ("柏科", "柏属"),
    ("桃金娘科", "桉属"), ("芸香科", "柑橘属"), ("唇形科", "紫苏属"), ("茜草科", "栀子属"),
    ("石竹科", "石竹属"), ("鸢尾科", "鸢尾属"), ("百合科", "百合属"), ("景天科", "景天属")
]
FLOWERING_PERIOD = ["1-2月", "2-4月", "3-5月", "4-6月", "5-7月", "6-8月", "7-9月", "8-10月", "春季", "夏季", "秋季", "冬季", "全年"]
HABITAT = [
    "喜阳，耐寒，耐旱，对土壤要求不严", "喜温暖湿润，半阴环境，忌强光直射",
    "喜疏松肥沃的微酸性土壤，不耐涝，稍耐寒", "耐高温，耐贫瘠，适应性强",
    "喜凉爽气候，耐寒性强，忌高温高湿", "喜湿润，不耐旱，适宜疏松沙质土壤",
    "耐阴，耐寒，喜肥沃排水良好的土壤", "喜阳光充足，耐盐碱，抗风性强"
]
DISTRIBUTION = [
    "中国大部分地区，日本，朝鲜半岛", "中国南方各省，东南亚各国",
    "中国华北、西北，欧洲中部，北美洲", "中国西南山区，喜马拉雅周边",
    "中国东北、内蒙古，俄罗斯远东地区", "全国广泛分布，世界各地引种栽培",
    "中国华南、海南，东南亚热带地区", "中国华东、华中，日本，韩国"
]
# 中文名前缀/后缀（组合生成不重复中文名）
CN_PREFIX = ["红", "白", "黄", "紫", "粉", "蓝", "绿", "青", "墨", "金", "银", "玉", "雪", "云", "风", "雨", "星", "月", "晨", "暮"]
CN_MIDDLE = ["叶", "花", "枝", "蕊", "瓣", "茎", "根", "果", "心", "铃", "蝶", "燕", "梅", "兰", "竹", "菊"]
CN_SUFFIX = ["松", "柏", "杉", "槐", "柳", "桃", "李", "杏", "菊", "兰", "荷", "莲", "葵", "薇", "萱", "蓉", "芋", "芍", "药", "草"]
# 英文名前缀（组合生成）
EN_PREFIX = ["Red", "White", "Yellow", "Purple", "Pink", "Blue", "Green", "Golden", "Silver", "Snow", "Cloud", "Star", "Moon", "Wind", "Rain"]
EN_SUFFIX = ["Pine", "Cedar", "Rose", "Cherry", "Chrysanthemum", "Orchid", "Lily", "Iris", "Peony", "Lotus", "Sunflower", "Jasmine", "Camellia"]
# 别名池（生成JSON数组格式）
ALIAS_POOL = [
    "白果树", "公孙树", "月月红", "刺玫花", "映山红", "山石榴", "金英花", "秋菊", "寒菊",
    "幽兰", "蕙兰", "芍药花", "将离草", "玉兰花", "望春玉兰", "樟树", "香樟", "国槐",
    "洋槐", "翠竹", "青松", "侧柏", "圆柏", "桉树", "柠檬树", "紫苏", "赤苏",
    "栀子花", "黄栀子", "石竹花", "洛阳花", "蓝蝴蝶", "扁竹花", "山丹", "卷丹", "八宝"
]
# 随机文本生成辅助（保证简介/形态等字段的可读性）
DESC_TPL = "{}为{}{}多年生{}，株高可达{}米，株型优美，是常见的观赏{}，部分品种兼具药用或经济价值。"
MORPHOLOGY_TPL = "叶片{}形，{}色，革质/纸质；花{}色，{}状花序，花瓣{}枚，花径{}厘米；果实为{}果，{}色，成熟期{}月。"
HISTORY_TPL = "{}原产于{}，栽培历史超{}年，{}时期已广泛种植，{}世纪传入{}，现为世界著名的{}植物。"

# 生成随机数/字符串工具
def random_int(min_num, max_num):
    return random.randint(min_num, max_num)

def random_choice(lst, count=1):
    if count == 1:
        return random.choice(lst)
    return random.sample(lst, min(count, len(lst)))

def gen_scientific_name(genus):
    """生成符合双名法的学名（属名+种加词）"""
    genus_en = genus.replace("属", "").capitalize()
    species_suffix = ''.join(random.choice(string.ascii_lowercase) for _ in range(random_int(4, 8)))
    return f"{genus_en} {species_suffix}"

def gen_alias():
    """生成JSON数组格式的别名"""
    alias_count = random_int(1, 3)
    alias_list = random_choice(ALIAS_POOL, alias_count)
    return json.dumps(alias_list, ensure_ascii=False)  # 保留中文，不转义

def gen_image_url():
    """生成真实可访问的植物图片链接（Picsum Photos）"""
    img_id = random_int(1, 1000)  # 随机图片ID，均为自然/植物图
    width, height = random_int(800, 1200), random_int(600, 900)
    return f"https://picsum.photos/id/{img_id}/{width}/{height}"

def gen_plant_data():
    """生成单条植物数据"""
    # 科属随机匹配
    family, genus = random_choice(FAMILY_GENUS)
    # 生成不重复中文名（前缀+中缀+后缀 组合，避免重复）
    chinese_name = ''.join(random_choice(CN_PREFIX,1) + random_choice(CN_MIDDLE,1) + random_choice(CN_SUFFIX,1))
    # 学名/英文名
    scientific_name = gen_scientific_name(genus)
    english_name = ' '.join(random_choice(EN_PREFIX,1) + random_choice(EN_SUFFIX,1))
    # 别名（JSON数组）
    alias = gen_alias()
    # 花期/生长环境/分布
    flowering_period = random_choice(FLOWERING_PERIOD)
    habitat = random_choice(HABITAT)
    distribution = random_choice(DISTRIBUTION)
    # 图片链接（真实可访问）
    image_url = gen_image_url()
    # 生成文本字段（贴合科属特征）
    plant_type = random_choice(["乔木", "灌木", "草本植物", "藤本植物"])
    ornamental_type = random_choice(["乔木", "灌木", "花卉", "绿植"])
    height = random_int(1, 30)
    # 简介
    description = DESC_TPL.format(chinese_name, family, genus, plant_type, height, ornamental_type)
    # 形态特征
    leaf_shape = random_choice(["卵", "心", "针", "掌", "条", "椭球", "三角", "匙"])
    leaf_color = random_choice(["绿", "深绿", "浅绿", "黄绿", "红褐", "紫红"])
    flower_color = random_choice(["红", "白", "黄", "粉", "紫", "蓝", "橙", "复"])
    flower_inflorescence = random_choice(["伞", "总状", "头状", "穗状", "单生"])
    petal_num = random_int(3, 10)
    flower_diameter = random_int(2, 15)
    fruit_type = random_choice(["核", "蒴", "角", "荚", "浆", "坚"])
    fruit_color = random_choice(["红", "黄", "绿", "褐", "黑", "橙"])
    fruit_month = random_int(6, 11)
    morphology = MORPHOLOGY_TPL.format(
        leaf_shape, leaf_color, flower_color, flower_inflorescence,
        petal_num, flower_diameter, fruit_type, fruit_color, fruit_month
    )
    # 植物学史
    origin = random_choice(["中国西南", "中国华中", "中国华北", "东南亚", "欧洲"])
    history_years = random_int(500, 5000)
    dynasty = random_choice(["唐", "宋", "明", "清", "秦汉"])
    century = random_int(17, 20)
    introduce_area = random_choice(["欧洲", "美洲", "日本", "东南亚"])
    plant_feature = random_choice(["观赏", "药用", "经济", "生态"])
    history = HISTORY_TPL.format(
        chinese_name, origin, history_years, dynasty,
        century, introduce_area, plant_feature
    )
    # 组装单条数据（与表结构字段完全一致）
    return {
        "chinese_name": chinese_name,
        "scientific_name": scientific_name,
        "english_name": english_name,
        "alias": alias,
        "family": family,
        "genus": genus,
        "description": description,
        "history": history,
        "morphology": morphology,
        "habitat": habitat,
        "distribution": distribution,
        "flowering_period": flowering_period,
        "image_url": image_url
    }

def generate_1000_plants():
    """生成1000条不重复植物数据，输出JSON文件"""
    plants = []
    # 保证chinese_name唯一（核心必填字段）
    used_cn_names = set()
    while len(plants) < 1000:
        plant = gen_plant_data()
        if plant["chinese_name"] not in used_cn_names:
            used_cn_names.add(plant["chinese_name"])
            plants.append(plant)
        # 防止极端情况死循环（实际不会触发）
        if len(used_cn_names) > 10000:
            break
    # 写入JSON文件（JSON Lines格式，每行一个对象，数据库导入友好）
    with open("plants_1000.json", "w", encoding="utf-8") as f:
        for plant in plants:
            json.dump(plant, f, ensure_ascii=False)
            f.write("\n")
    print("生成完成！文件：plants_1000.json，共1000条不重复数据")

if __name__ == "__main__":
    random.seed(datetime.now().timestamp())  # 随机种子，保证每次生成数据不同
    generate_1000_plants()