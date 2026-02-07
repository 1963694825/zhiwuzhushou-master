import mysql.connector

# 连接数据库
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='plant_assistant'
)

cursor = conn.cursor()

# 检查表结构
print("📋 检查plants表结构:")
print("="*60)
cursor.execute("DESCRIBE plants")
for row in cursor.fetchall():
    print(f"  {row[0]:20} {row[1]:20} {row[2]:10}")

# 检查数据统计
print(f"\n📊 数据统计:")
print("="*60)
cursor.execute("SELECT COUNT(*) FROM plants")
total = cursor.fetchone()[0]
print(f"  总记录数: {total}")

# 检查科属分布
print(f"\n🌿 科属分布:")
print("="*60)
cursor.execute("SELECT family, COUNT(*) as count FROM plants GROUP BY family ORDER BY count DESC")
for family, count in cursor.fetchall():
    print(f"  {family:15} {count:3} 种")

# 查看前5条数据
print(f"\n📝 前5条数据:")
print("="*60)
cursor.execute("SELECT id, chinese_name, family, genus FROM plants LIMIT 5")
for row in cursor.fetchall():
    print(f"  ID:{row[0]:3} {row[1]:15} {row[2]:10} {row[3]:10}")

cursor.close()
conn.close()

print(f"\n✅ 检查完成")
