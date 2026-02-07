import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='plant_assistant'
)

cursor = conn.cursor()

print("📋 检查并添加所有必需字段...")
print("="*60)

# 获取当前字段
cursor.execute("DESCRIBE plants")
existing_columns = {row[0] for row in cursor.fetchall()}

# 定义所有必需字段及其位置
fields_to_add = [
    ('alias', "TEXT COMMENT '别名(JSON数组)'", 'english_name'),
    ('morphology', "TEXT COMMENT '形态特征'", 'history'),
]

added_count = 0

for field_name, field_def, after_field in fields_to_add:
    if field_name not in existing_columns:
        print(f"  ❌ 缺少字段: {field_name}")
        print(f"     正在添加到 {after_field} 之后...")
        
        sql = f"ALTER TABLE plants ADD COLUMN {field_name} {field_def} AFTER {after_field}"
        cursor.execute(sql)
        conn.commit()
        
        added_count += 1
        print(f"  ✅ 已添加: {field_name}")
    else:
        print(f"  ✅ 字段已存在: {field_name}")

print(f"\n{'='*60}")
if added_count > 0:
    print(f"✅ 成功添加 {added_count} 个字段")
else:
    print(f"✅ 所有字段都已存在")

# 显示最终表结构
print(f"\n📋 最终表结构:")
print("="*60)
cursor.execute("DESCRIBE plants")
for row in cursor.fetchall():
    print(f"  {row[0]:20} {row[1]:30}")

cursor.close()
conn.close()
