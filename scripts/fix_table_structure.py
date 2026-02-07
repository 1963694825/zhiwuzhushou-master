import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='plant_assistant'
)

cursor = conn.cursor()

print("📋 当前plants表结构:")
print("="*60)
cursor.execute("DESCRIBE plants")
columns = {}
for row in cursor.fetchall():
    columns[row[0]] = row[1]
    print(f"  {row[0]:20} {row[1]:30}")

print(f"\n🔧 检查缺失字段...")

# 需要的字段
required_fields = {
    'alias': "TEXT COMMENT '别名(JSON数组)'",
    'history': "TEXT COMMENT '植物学史'"
}

added = []
for field, definition in required_fields.items():
    if field not in columns:
        print(f"  ❌ 缺少字段: {field}")
        print(f"     正在添加...")
        
        if field == 'alias':
            cursor.execute(f"ALTER TABLE plants ADD COLUMN {field} {definition} AFTER english_name")
        elif field == 'history':
            cursor.execute(f"ALTER TABLE plants ADD COLUMN {field} {definition} AFTER description")
        
        conn.commit()
        added.append(field)
        print(f"  ✅ 已添加: {field}")
    else:
        print(f"  ✅ 字段存在: {field}")

if added:
    print(f"\n✅ 已添加 {len(added)} 个字段: {', '.join(added)}")
else:
    print(f"\n✅ 所有必需字段都已存在")

cursor.close()
conn.close()
