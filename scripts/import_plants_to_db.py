import json
import mysql.connector
from mysql.connector import Error
import getpass

def get_db_config():
    """获取数据库配置"""
    print("🔧 请输入数据库配置信息:")
    print("-" * 50)
    
    host = input("数据库地址 [localhost]: ").strip() or 'localhost'
    user = input("数据库用户名 [root]: ").strip() or 'root'
    password = getpass.getpass("数据库密码: ")
    database = input("数据库名 [plant_assistant]: ").strip() or 'plant_assistant'
    
    return {
        'host': host,
        'user': user,
        'password': password,
        'database': database,
        'charset': 'utf8mb4'
    }

def create_connection(config):
    """创建数据库连接"""
    try:
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"\n✅ 成功连接到MySQL数据库 (版本: {db_info})")
            return connection
    except Error as e:
        print(f"\n❌ 连接失败: {e}")
        print("\n💡 提示:")
        print("   1. 请确认MySQL服务已启动")
        print("   2. 检查用户名和密码是否正确")
        print("   3. 确认数据库 'plant_assistant' 已创建")
        return None

def create_database_if_not_exists(config):
    """如果数据库不存在则创建"""
    try:
        # 先连接到MySQL服务器(不指定数据库)
        temp_config = config.copy()
        database_name = temp_config.pop('database')
        
        connection = mysql.connector.connect(**temp_config)
        cursor = connection.cursor()
        
        # 检查数据库是否存在
        cursor.execute(f"SHOW DATABASES LIKE '{database_name}'")
        result = cursor.fetchone()
        
        if not result:
            print(f"\n📋 数据库 '{database_name}' 不存在,正在创建...")
            cursor.execute(f"CREATE DATABASE {database_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ 数据库 '{database_name}' 创建成功")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"⚠️  创建数据库时出错: {e}")

def check_and_create_table(connection):
    """检查并创建plants表(如果不存在)"""
    cursor = connection.cursor()
    
    try:
        # 检查表是否存在
        cursor.execute("SHOW TABLES LIKE 'plants'")
        table_exists = cursor.fetchone() is not None
        
        if not table_exists:
            print("\n📋 plants表不存在,正在创建...")
            create_table_sql = """
            CREATE TABLE plants (
                id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
                chinese_name VARCHAR(100) NOT NULL COMMENT '中文名',
                scientific_name VARCHAR(200) COMMENT '学名',
                english_name VARCHAR(100) COMMENT '英文名',
                alias TEXT COMMENT '别名(JSON数组)',
                family VARCHAR(100) COMMENT '科',
                genus VARCHAR(100) COMMENT '属',
                description TEXT COMMENT '简介',
                history TEXT COMMENT '植物学史',
                morphology TEXT COMMENT '形态特征',
                habitat TEXT COMMENT '生长环境',
                distribution TEXT COMMENT '分布地区',
                flowering_period VARCHAR(50) COMMENT '花期',
                image_url VARCHAR(500) COMMENT '图片链接',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                
                INDEX idx_chinese_name (chinese_name),
                INDEX idx_scientific_name (scientific_name),
                INDEX idx_family (family),
                FULLTEXT INDEX ft_search (chinese_name, description) WITH PARSER ngram
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='植物数据表'
            """
            cursor.execute(create_table_sql)
            connection.commit()
            print("✅ plants表创建成功")
        else:
            print("\n✅ plants表已存在")
            
            # 检查是否缺少history字段
            cursor.execute("SHOW COLUMNS FROM plants LIKE 'history'")
            history_exists = cursor.fetchone() is not None
            
            if not history_exists:
                print("📋 添加history字段...")
                cursor.execute("""
                    ALTER TABLE plants 
                    ADD COLUMN history TEXT COMMENT '植物学史' AFTER description
                """)
                connection.commit()
                print("✅ history字段添加成功")
    
    except Error as e:
        print(f"❌ 创建表时出错: {e}")
        raise
    finally:
        cursor.close()

def import_plants_data(connection, json_file):
    """导入植物数据"""
    cursor = connection.cursor()
    
    try:
        # 读取JSON文件
        plants = []
        print(f"\n📖 正在读取 {json_file}...")
        with open(json_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    plants.append(json.loads(line))
        
        print(f"✅ 读取到 {len(plants)} 条植物数据")
        
        # 检查现有数据
        cursor.execute("SELECT COUNT(*) FROM plants")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"\n⚠️  数据库中已有 {existing_count} 条数据")
            response = input("是否清空现有数据? (y/n): ").strip().lower()
            if response == 'y':
                cursor.execute("TRUNCATE TABLE plants")
                connection.commit()
                print("✅ 已清空现有数据")
        
        # 插入数据
        insert_sql = """
        INSERT INTO plants (
            chinese_name, scientific_name, english_name, alias, 
            family, genus, description, history, morphology, 
            habitat, distribution, flowering_period, image_url
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """
        
        print(f"\n⏳ 开始导入数据...")
        success_count = 0
        error_count = 0
        
        for i, plant in enumerate(plants, 1):
            try:
                values = (
                    plant['chinese_name'],
                    plant['scientific_name'],
                    plant['english_name'],
                    plant['alias'],
                    plant['family'],
                    plant['genus'],
                    plant['description'],
                    plant.get('history', ''),
                    plant['morphology'],
                    plant['habitat'],
                    plant['distribution'],
                    plant['flowering_period'],
                    plant['image_url']
                )
                
                cursor.execute(insert_sql, values)
                success_count += 1
                
                if i % 100 == 0:
                    print(f"   已导入 {i}/{len(plants)} 条数据...")
                    
            except Error as e:
                error_count += 1
                print(f"❌ 导入第 {i} 条数据失败: {plant['chinese_name']} - {e}")
        
        # 提交事务
        connection.commit()
        
        print(f"\n{'='*50}")
        print(f"✅ 导入完成!")
        print(f"   成功: {success_count} 条")
        print(f"   失败: {error_count} 条")
        print(f"{'='*50}")
        
        # 显示统计信息
        cursor.execute("SELECT COUNT(*) FROM plants")
        total = cursor.fetchone()[0]
        print(f"\n📊 数据库统计:")
        print(f"   总记录数: {total}")
        
        cursor.execute("SELECT family, COUNT(*) as count FROM plants GROUP BY family ORDER BY count DESC LIMIT 5")
        print(f"\n   科属分布 (Top 5):")
        for family, count in cursor.fetchall():
            print(f"   - {family}: {count} 种")
    
    except Error as e:
        print(f"❌ 导入数据时出错: {e}")
        connection.rollback()
        raise
    finally:
        cursor.close()

def main():
    """主函数"""
    print("🌱 植物数据导入工具")
    print("="*50)
    
    # 获取数据库配置
    config = get_db_config()
    
    # 创建数据库(如果不存在)
    create_database_if_not_exists(config)
    
    # 创建数据库连接
    connection = create_connection(config)
    if not connection:
        return
    
    try:
        # 检查并创建表
        check_and_create_table(connection)
        
        # 导入数据
        import_plants_data(connection, 'plants_1000.json')
        
    except Error as e:
        print(f"\n❌ 发生错误: {e}")
    except KeyboardInterrupt:
        print(f"\n\n⚠️  用户中断操作")
    finally:
        if connection.is_connected():
            connection.close()
            print("\n🔌 数据库连接已关闭")

if __name__ == "__main__":
    main()
