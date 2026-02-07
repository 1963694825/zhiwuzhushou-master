import mysql.connector

def setup_knowledge_database():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='plant_assistant'
        )
        cursor = conn.cursor()

        # 1. 创建一级大类表 (顶部菜单)
        print("Creating knowledge_primary_categories table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS `knowledge_primary_categories` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(50) NOT NULL COMMENT '大类名称 (如: 水果, 蔬菜)',
            `sort_order` INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 2. 品种/标签表 (左侧栏内容)
        print("Creating knowledge_species table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS `knowledge_species` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `primary_id` INT NOT NULL COMMENT '所属大类ID',
            `name` VARCHAR(50) NOT NULL COMMENT '详情名称 (如: 蓝莓, 树莓)',
            `sort_order` INT DEFAULT 0,
            FOREIGN KEY (`primary_id`) REFERENCES `knowledge_primary_categories`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 3. 知识文章表
        print("Creating knowledge_articles table...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS `knowledge_articles` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `species_id` INT NOT NULL COMMENT '所属品种ID',
            `title` VARCHAR(255) NOT NULL,
            `summary` VARCHAR(500),
            `content` LONGTEXT,
            `cover_image` VARCHAR(255),
            `knowledge_type` VARCHAR(50) COMMENT '知识类型 (如: 养护技巧, 病虫防治)',
            `publish_time` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        conn.commit()
        print("✅ All tables created successfully.")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    setup_knowledge_database()
