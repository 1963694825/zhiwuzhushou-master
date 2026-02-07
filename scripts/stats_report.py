import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='plant_assistant'
)

cursor = conn.cursor()

print("🌱 植物数据库统计报告")
print("="*70)

# 总记录数
cursor.execute("SELECT COUNT(*) FROM plants")
total = cursor.fetchone()[0]
print(f"\n📊 总记录数: {total}")

# 科属统计
print(f"\n🌿 科属分布:")
print("-"*70)
cursor.execute("""
    SELECT family, COUNT(*) as count 
    FROM plants 
    GROUP BY family 
    ORDER BY count DESC
""")
print(f"{'科名':15} {'数量':>10}")
print("-"*70)
for family, count in cursor.fetchall():
    print(f"{family:15} {count:>10} 种")

# 花期统计
print(f"\n🌸 花期分布:")
print("-"*70)
cursor.execute("""
    SELECT flowering_period, COUNT(*) as count 
    FROM plants 
    GROUP BY flowering_period 
    ORDER BY count DESC 
    LIMIT 10
""")
print(f"{'花期':15} {'数量':>10}")
print("-"*70)
for period, count in cursor.fetchall():
    print(f"{period:15} {count:>10} 种")

# 随机样本
print(f"\n📝 随机样本 (5条):")
print("-"*70)
cursor.execute("""
    SELECT chinese_name, family, genus, flowering_period 
    FROM plants 
    ORDER BY RAND() 
    LIMIT 5
""")
print(f"{'中文名':15} {'科':12} {'属':12} {'花期':10}")
print("-"*70)
for name, family, genus, period in cursor.fetchall():
    print(f"{name:15} {family:12} {genus:12} {period:10}")

# 数据完整性检查
print(f"\n✅ 数据完整性:")
print("-"*70)
cursor.execute("SELECT COUNT(*) FROM plants WHERE chinese_name IS NULL OR chinese_name = ''")
null_names = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(*) FROM plants WHERE image_url IS NULL OR image_url = ''")
null_images = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(*) FROM plants WHERE family IS NULL OR family = ''")
null_family = cursor.fetchone()[0]

print(f"  缺少中文名: {null_names}")
print(f"  缺少图片链接: {null_images}")
print(f"  缺少科属: {null_family}")

if null_names == 0 and null_images == 0 and null_family == 0:
    print(f"\n  ✅ 所有核心字段完整!")

cursor.close()
conn.close()

print(f"\n{'='*70}")
print(f"✅ 统计完成!")
