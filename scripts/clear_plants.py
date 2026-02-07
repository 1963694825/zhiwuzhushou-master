import mysql.connector

print("🗑️  清空plants表数据...")
print("="*60)

# 连接数据库
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='plant_assistant'
)

cursor = conn.cursor()

# 检查当前数据量
cursor.execute("SELECT COUNT(*) FROM plants")
count_before = cursor.fetchone()[0]
print(f"清空前记录数: {count_before}")

# 清空表
cursor.execute("TRUNCATE TABLE plants")
conn.commit()

# 检查清空后数据量
cursor.execute("SELECT COUNT(*) FROM plants")
count_after = cursor.fetchone()[0]
print(f"清空后记录数: {count_after}")

cursor.close()
conn.close()

print(f"\n✅ 表已清空,可以重新导入数据")
