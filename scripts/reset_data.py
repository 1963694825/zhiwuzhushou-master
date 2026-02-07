import json
p = r"g:\work\zhiwuzhushou-master\doc\植物数据\cleaned_plants.json"
with open(p, 'r', encoding='utf-8') as f:
    data = json.load(f)
data = data[:196]
with open(p, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"JSON 已重置。当前记录：{len(data)}")
