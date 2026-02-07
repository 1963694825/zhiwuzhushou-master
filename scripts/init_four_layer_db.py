import mysql.connector

def setup_four_layer_database():
    try:
        conn = mysql.connector.connect( host='localhost', user='root', password='root', database='plant_assistant' )
        cursor = conn.cursor()

        # 禁用外键检查以便重建
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("DROP TABLE IF EXISTS `knowledge_articles`;")
        cursor.execute("DROP TABLE IF EXISTS `knowledge_species`;")
        cursor.execute("DROP TABLE IF EXISTS `knowledge_secondary_categories`;")
        cursor.execute("DROP TABLE IF EXISTS `knowledge_primary_categories`;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        # 1. 一级大类 (顶部大菜单)
        cursor.execute("""
        CREATE TABLE `knowledge_primary_categories` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(50) NOT NULL,
            `sort_order` INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 2. 二级细分 (大类下的分组，如灌木类水果)
        cursor.execute("""
        CREATE TABLE `knowledge_secondary_categories` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `primary_id` INT NOT NULL,
            `name` VARCHAR(50) NOT NULL,
            `sort_order` INT DEFAULT 0,
            FOREIGN KEY (`primary_id`) REFERENCES `knowledge_primary_categories`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 3. 植物品种 (侧边栏内容)
        cursor.execute("""
        CREATE TABLE `knowledge_species` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `secondary_id` INT NOT NULL,
            `name` VARCHAR(50) NOT NULL,
            `sort_order` INT DEFAULT 0,
            FOREIGN KEY (`secondary_id`) REFERENCES `knowledge_secondary_categories`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # 4. 知识文章
        cursor.execute("""
        CREATE TABLE `knowledge_articles` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `species_id` INT NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `summary` VARCHAR(500),
            `content` LONGTEXT,
            `knowledge_type` VARCHAR(50),
            `publish_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`species_id`) REFERENCES `knowledge_species`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        conn.commit()
        print("✅ Four-layer database structure initialized.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    setup_four_layer_database()
