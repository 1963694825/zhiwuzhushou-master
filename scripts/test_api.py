import requests
import json

# 测试植物搜索API
print("🔍 测试植物搜索API")
print("="*60)

response = requests.get('http://localhost:9000/api/plants/search?q=松')
print(f"状态码: {response.status_code}")
print(f"\n响应数据:")
data = response.json()
print(json.dumps(data, ensure_ascii=False, indent=2))

if data['code'] == 200:
    print(f"\n✅ 搜索成功! 找到 {len(data['data'])} 条结果")
    print(f"\n前3条结果:")
    for i, plant in enumerate(data['data'][:3], 1):
        print(f"{i}. {plant['common_name_zh']} ({plant['scientific_name']}) - {plant['family']}")
else:
    print(f"\n❌ 搜索失败: {data['message']}")

# 测试植物详情API
print(f"\n{'='*60}")
print("🌿 测试植物详情API")
print("="*60)

if data['code'] == 200 and len(data['data']) > 0:
    plant_id = data['data'][0]['id']
    response = requests.get(f'http://localhost:9000/api/plants/detail/{plant_id}')
    print(f"状态码: {response.status_code}")
    print(f"\n响应数据:")
    detail_data = response.json()
    print(json.dumps(detail_data, ensure_ascii=False, indent=2))
    
    if detail_data['code'] == 200:
        print(f"\n✅ 详情获取成功!")
        plant = detail_data['data']
        print(f"\n植物信息:")
        print(f"  中文名: {plant['common_name_zh']}")
        print(f"  学名: {plant['scientific_name']}")
        print(f"  科: {plant['family']}")
        print(f"  属: {plant['genus']}")
        print(f"  花期: {plant['flowering_period']}")
        print(f"  描述: {plant['description'][:100]}...")
