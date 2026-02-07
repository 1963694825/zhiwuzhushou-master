# 百度百科植物爬虫
# 爬取常见植物的中文数据

import requests
from bs4 import BeautifulSoup
import json
import time
import re

class BaikePlantCrawler:
    def __init__(self):
        self.base_url = "https://baike.baidu.com/item/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.plants_data = []
    
    def get_plant_info(self, plant_name):
        """获取单个植物信息"""
        try:
            url = f"{self.base_url}{plant_name}"
            response = requests.get(url, headers=self.headers, timeout=10)
            response.encoding = 'utf-8'
            
            if response.status_code != 200:
                print(f"❌ 获取 {plant_name} 失败: {response.status_code}")
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 提取数据
            plant_data = {
                'chinese_name': plant_name,
                'scientific_name': self.extract_scientific_name(soup),
                'english_name': self.extract_english_name(soup),
                'family': self.extract_family(soup),
                'genus': self.extract_genus(soup),
                'description': self.extract_description(soup),
                'alias': self.extract_alias(soup),
                'morphology': self.extract_morphology(soup),
                'habitat': self.extract_habitat(soup),
                'distribution': self.extract_distribution(soup),
                'flowering_period': self.extract_flowering_period(soup),
                'image_url': self.extract_image(soup)
            }
            
            print(f"✅ 成功获取: {plant_name}")
            return plant_data
            
        except Exception as e:
            print(f"❌ 爬取 {plant_name} 出错: {str(e)}")
            return None
    
    def extract_scientific_name(self, soup):
        """提取学名"""
        try:
            # 查找包含"学名"的标签
            label = soup.find('dt', string=re.compile('学名'))
            if label:
                value = label.find_next_sibling('dd')
                if value:
                    return value.get_text(strip=True)
        except:
            pass
        return None
    
    def extract_english_name(self, soup):
        """提取英文名"""
        try:
            label = soup.find('dt', string=re.compile('英文名'))
            if label:
                value = label.find_next_sibling('dd')
                if value:
                    return value.get_text(strip=True)
        except:
            pass
        return None
    
    def extract_family(self, soup):
        """提取科"""
        try:
            label = soup.find('dt', string=re.compile('科'))
            if label:
                value = label.find_next_sibling('dd')
                if value:
                    return value.get_text(strip=True)
        except:
            pass
        return None
    
    def extract_genus(self, soup):
        """提取属"""
        try:
            label = soup.find('dt', string=re.compile('属'))
            if label:
                value = label.find_next_sibling('dd')
                if value:
                    return value.get_text(strip=True)
        except:
            pass
        return None
    
    def extract_description(self, soup):
        """提取简介"""
        try:
            # 获取第一段摘要
            summary = soup.find('div', class_='lemma-summary')
            if summary:
                paragraphs = summary.find_all('div', class_='para')
                if paragraphs:
                    return paragraphs[0].get_text(strip=True)[:500]
        except:
            pass
        return None
    
    def extract_alias(self, soup):
        """提取别名"""
        try:
            label = soup.find('dt', string=re.compile('别.*名'))
            if label:
                value = label.find_next_sibling('dd')
                if value:
                    aliases = value.get_text(strip=True)
                    return json.dumps(aliases.split('、'), ensure_ascii=False)
        except:
            pass
        return None
    
    def extract_morphology(self, soup):
        """提取形态特征"""
        try:
            # 查找"形态特征"标题
            heading = soup.find(['h2', 'h3'], string=re.compile('形态特征'))
            if heading:
                content = heading.find_next('div', class_='para')
                if content:
                    return content.get_text(strip=True)[:500]
        except:
            pass
        return None
    
    def extract_habitat(self, soup):
        """提取生长环境"""
        try:
            heading = soup.find(['h2', 'h3'], string=re.compile('生长环境|生境'))
            if heading:
                content = heading.find_next('div', class_='para')
                if content:
                    return content.get_text(strip=True)[:300]
        except:
            pass
        return None
    
    def extract_distribution(self, soup):
        """提取分布地区"""
        try:
            heading = soup.find(['h2', 'h3'], string=re.compile('分布.*范围|产地'))
            if heading:
                content = heading.find_next('div', class_='para')
                if content:
                    return content.get_text(strip=True)[:300]
        except:
            pass
        return None
    
    def extract_flowering_period(self, soup):
        """提取花期"""
        try:
            label = soup.find('dt', string=re.compile('花期'))
            if label:
                value = label.find_next_sibling('dd')
                if value:
                    return value.get_text(strip=True)
        except:
            pass
        return None
    
    def extract_image(self, soup):
        """提取图片"""
        try:
            # 获取主图
            img = soup.find('div', class_='summary-pic').find('img')
            if img and img.get('src'):
                return 'https:' + img['src']
        except:
            pass
        return None
    
    def crawl_plants(self, plant_list):
        """批量爬取植物"""
        for i, plant_name in enumerate(plant_list, 1):
            print(f"\n[{i}/{len(plant_list)}] 正在爬取: {plant_name}")
            
            plant_data = self.get_plant_info(plant_name)
            if plant_data:
                self.plants_data.append(plant_data)
            
            # 延时避免被封
            time.sleep(2)
        
        print(f"\n✅ 爬取完成！共获取 {len(self.plants_data)} 条数据")
    
    def save_to_json(self, filename='plants_data.json'):
        """保存为JSON文件"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.plants_data, f, ensure_ascii=False, indent=2)
        print(f"✅ 数据已保存到: {filename}")

# 常见植物列表
COMMON_PLANTS = [
    # 花卉类
    '玫瑰', '牡丹', '菊花', '荷花', '梅花', '兰花', '茉莉花', '桂花',
    '月季', '杜鹃', '水仙', '百合', '郁金香', '向日葵', '康乃馨',
    '茶花', '芍药', '海棠', '紫罗兰', '风信子',
    
    # 观叶植物
    '绿萝', '吊兰', '虎皮兰', '发财树', '富贵竹', '文竹', '龟背竹',
    '常春藤', '芦荟', '仙人掌', '多肉植物', '铁树', '橡皮树',
    
    # 树木类
    '松树', '柏树', '杨树', '柳树', '槐树', '梧桐', '银杏', '枫树',
    '樱花', '桃树', '梨树', '苹果树', '竹子', '棕榈',
    
    # 蔬菜类
    '番茄', '黄瓜', '白菜', '萝卜', '茄子', '辣椒', '南瓜', '西瓜',
    
    # 草本植物
    '薰衣草', '迷迭香', '薄荷', '罗勒', '芦苇', '狗尾草',
    
    # 藤本植物
    '葡萄', '爬山虎', '牵牛花', '紫藤', '金银花',
    
    # 水生植物
    '睡莲', '莲花', '浮萍', '水葫芦',
    
    # 其他常见植物
    '仙人球', '蒲公英', '三叶草', '含羞草', '牵牛花', '鸢尾',
    '石榴', '枇杷', '柿子', '栀子花', '夹竹桃', '凤仙花'
]

if __name__ == '__main__':
    print("🌿 百度百科植物爬虫启动...")
    print(f"📊 计划爬取 {len(COMMON_PLANTS)} 种植物\n")
    
    crawler = BaikePlantCrawler()
    
    # 爬取数据
    crawler.crawl_plants(COMMON_PLANTS)
    
    # 保存数据
    crawler.save_to_json('plants_data.json')
    
    print("\n🎉 爬虫任务完成！")
