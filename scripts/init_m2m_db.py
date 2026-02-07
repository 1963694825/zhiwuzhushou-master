import mysql.connector

def setup_m2m_database():
    try:
        conn = mysql.connector.connect( host='localhost', user='root', password='root', database='plant_assistant' )
        cursor = conn.cursor()

        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        tables = [
            'knowledge_article_species_mapping', 'knowledge_articles', 
            'knowledge_species_category_mapping', 'knowledge_species', 
            'knowledge_secondary_categories', 'knowledge_primary_categories'
        ]
        for t in tables: cursor.execute(f"DROP TABLE IF EXISTS `{t}`;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        # 1. 一级大类
        cursor.execute("CREATE TABLE `knowledge_primary_categories` (`id` INT AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(50) NOT NULL, `sort_order` INT DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
        # 2. 二级细分
        cursor.execute("CREATE TABLE `knowledge_secondary_categories` (`id` INT AUTO_INCREMENT PRIMARY KEY, `primary_id` INT NOT NULL, `name` VARCHAR(50) NOT NULL, `sort_order` INT DEFAULT 0, FOREIGN KEY (`primary_id`) REFERENCES `knowledge_primary_categories`(`id`) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
        # 3. 品种基础信息
        cursor.execute("CREATE TABLE `knowledge_species` (`id` INT AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(50) NOT NULL, `sort_order` INT DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
        # 4. 品种-分类映射
        cursor.execute("""
        CREATE TABLE `knowledge_species_category_mapping` (
            `species_id` INT NOT NULL, `primary_id` INT NOT NULL, `secondary_id` INT NOT NULL,
            PRIMARY KEY (`species_id`, `primary_id`, `secondary_id`),
            FOREIGN KEY (`species_id`) REFERENCES `knowledge_species`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`primary_id`) REFERENCES `knowledge_primary_categories`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`secondary_id`) REFERENCES `knowledge_secondary_categories`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        # 5. 知识文章
        cursor.execute("CREATE TABLE `knowledge_articles` (`id` INT AUTO_INCREMENT PRIMARY KEY, `title` VARCHAR(255) NOT NULL, `summary` VARCHAR(500), `content` LONGTEXT, `knowledge_type` VARCHAR(50), `publish_time` DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
        # 6. 文章-品种映射
        cursor.execute("""
        CREATE TABLE `knowledge_article_species_mapping` (
            `article_id` INT NOT NULL, `species_id` INT NOT NULL,
            PRIMARY KEY (`article_id`, `species_id`),
            FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`species_id`) REFERENCES `knowledge_species`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        conn.commit()
        print("✅ M2M database initialized.")
    finally:
        cursor.close(); conn.close()

if __name__ == "__main__": setup_m2m_database()
