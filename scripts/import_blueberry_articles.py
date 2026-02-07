import mysql.connector
from docx import Document
import json
import os
import re
from dotenv import load_dotenv

load_dotenv()

# 数据库配置
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'plant_assistant'
}

# 预设图片库 (因为无法从 docx 提取图片，循环使用这些占位图)
placeholder_images = [
    "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800",
    "https://images.unsplash.com/photo-1627885026922-26330aa82414?w=800",
    "https://images.unsplash.com/photo-1651807193045-1b366e7f347f?w=800",
    "https://images.unsplash.com/photo-1599598425947-320d755fcf21?w=800",
    "https://images.unsplash.com/photo-1622383563227-0440114a6133?w=800",
    "https://images.unsplash.com/photo-1596627685686-29177197d6e7?w=800",
    "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=800",
    "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800",
    "https://images.unsplash.com/photo-1628151016024-5d326f333333?w=800",
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
    "https://images.unsplash.com/photo-1483323326269-e93821033336?w=800",
    "https://images.unsplash.com/photo-1544602901-ecb78484a0c8?w=800",
    "https://images.unsplash.com/photo-1589123826848-f6a707164478?w=800",
    "https://images.unsplash.com/photo-1519183071298-a2962fab1c32?w=800",
    "https://images.unsplash.com/photo-1563546026563-3f62803b906a?w=800",
    "https://images.unsplash.com/photo-1587893904941-8ad200d76939?w=800"
]

def import_data():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # 1. 找到蓝莓的 ID
        cursor.execute("SELECT id FROM knowledge_species WHERE name LIKE '%蓝莓%' LIMIT 1")
        result = cursor.fetchone()
        if not result:
            print("未找到蓝莓品种，请先导入品种数据。")
            return
        blueberry_id = result[0]
        print(f"找到蓝莓 ID: {blueberry_id}")

        # 2. 清理旧数据 (为了避免重复，先删除该品种下的所有文章关联，如果需要严格点可以只删除蓝莓的)
        # 注意: 这样做会删除所有关联到蓝莓的文章。
        print("清理旧数据...")
        cursor.execute("""
            DELETE a FROM knowledge_articles a
            JOIN knowledge_article_species_mapping m ON a.id = m.article_id
            WHERE m.species_id = %s
        """, (blueberry_id,))
        print("旧文章已清理。")

        # 3. 读取 Docx
        doc_path = r'g:\work\zhiwuzhushou-master\doc\文章\蓝莓全方位种植养护实用指南（8篇合集）.docx'
        doc = Document(doc_path)
        
        articles = []
        current_article = None
        
        # 正则匹配标题: 第一篇：...
        title_pattern = re.compile(r'^第[一二三四五六七八]篇[：:]?(.+)')

        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue

            match = title_pattern.match(text)
            if match:
                # 如果已有正在处理的文章，保存它
                if current_article:
                    articles.append(current_article)
                
                # 开始新文章
                current_article = {
                    "title": text, # 使用完整标题，或者 match.group(1) 仅取后半部分
                    "content": []
                }
            elif current_article:
                current_article["content"].append(text)

        # 保存最后一篇文章
        if current_article:
            articles.append(current_article)

        print(f"解析到 {len(articles)} 篇文章")

        # 4. 插入数据
        for i, art in enumerate(articles):
            title = art['title']
            content_lines = art['content']
            content = "\n\n".join(content_lines)
            summary = content[:100] + "..." if len(content) > 100 else content
            
            # 分配 2 张图片
            img1 = placeholder_images[(i * 2) % len(placeholder_images)]
            img2 = placeholder_images[(i * 2 + 1) % len(placeholder_images)]
            images_json = json.dumps([img1, img2])

            # 插入文章
            sql = """
                INSERT INTO knowledge_articles (title, summary, content, image_url, images, publish_time)
                VALUES (%s, %s, %s, %s, %s, NOW())
            """
            cursor.execute(sql, (title, summary, content, img1, images_json))
            article_id = cursor.lastrowid

            # 关联品种
            cursor.execute("INSERT INTO knowledge_article_species_mapping (article_id, species_id) VALUES (%s, %s)", (article_id, blueberry_id))
            
            print(f"已导入文章: {title} (ID: {article_id})")

        conn.commit()
        print("所有文章重导完成！")

    except Exception as e:
        print(f"发生错误: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import_data()
