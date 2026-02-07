import requests
import json

BASE_URL = "http://localhost:3000/api/knowledge"

def test_api():
    print("--- 1. 测试获取一级大类 ---")
    res = requests.get(f"{BASE_URL}/primaries")
    primaries = res.json()['data']
    print(f"找到 {len(primaries)} 个一级大类: {[p['name'] for p in primaries]}")
    
    fruit_id = next(p['id'] for p in primaries if p['name'] == '水果')
    
    print("\n--- 2. 测试获取水果的二级细分 ---")
    res = requests.get(f"{BASE_URL}/secondaries/{fruit_id}")
    secondaries = res.json()['data']
    print(f"水果包含 {len(secondaries)} 个细分: {[s['name'] for s in secondaries]}")
    
    shrub_id = next(s['id'] for s in secondaries if s['name'] == '灌木类')
    
    print("\n--- 3. 测试仅按一级大类(水果)获取品种 ---")
    res = requests.get(f"{BASE_URL}/species?primary_id={fruit_id}")
    species = res.json()['data']
    print(f"水果大类下共有 {len(species)} 个品种")
    
    print("\n--- 4. 测试按二级细分(灌木类)获取品种 ---")
    res = requests.get(f"{BASE_URL}/species?primary_id={fruit_id}&secondary_id={shrub_id}")
    species_shrub = res.json()['data']
    print(f"灌木类水果下共有 {len(species_shrub)} 个品种: {[sp['name'] for sp in species_shrub]}")
    
    print("\n--- 5. 测试多层级交叉验证 (莲藕应同时出现在水果和蔬菜中) ---")
    vegetable_id = next(p['id'] for p in primaries if p['name'] == '蔬菜')
    res_fruit_lotus = requests.get(f"{BASE_URL}/species?primary_id={fruit_id}")
    res_veg_lotus = requests.get(f"{BASE_URL}/species?primary_id={vegetable_id}")
    
    lotus_in_fruit = any(sp['name'] == '莲藕' for sp in res_fruit_lotus.json()['data'])
    lotus_in_veg = any(sp['name'] == '莲藕' for sp in res_veg_lotus.json()['data'])
    print(f"莲藕在水果中: {lotus_in_fruit}, 莲藕在蔬菜中: {lotus_in_veg}")

if __name__ == "__main__":
    test_api()
