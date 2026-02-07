import json
import os

FILE_PATH = r"g:\work\zhiwuzhushou-master\doc\植物数据\cleaned_plants.json"

def cleanup():
    if not os.path.exists(FILE_PATH):
        print("文件不存在")
        return

    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data)
    
    # 1. 过滤掉未知科
    filtered_data = [item for item in data if item.get('family') != "未知科"]
    no_family_count = original_count - len(filtered_data)
    
    # 2. 去除重复的 chinese_name
    seen_names = set()
    unique_data = []
    duplicate_count = 0
    
    for item in filtered_data:
        name = item.get('chinese_name')
        if name not in seen_names:
            unique_data.append(item)
            seen_names.add(name)
        else:
            duplicate_count += 1
            
    # 写入文件
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(unique_data, f, ensure_ascii=False, indent=2)
        
    print(f"清洗完成！")
    print(f"原始记录数: {original_count}")
    print(f"移除'未知科'数量: {no_family_count}")
    print(f"由于名称重复移除数量: {duplicate_count}")
    print(f"最终保留数量: {len(unique_data)}")

if __name__ == "__main__":
    cleanup()
