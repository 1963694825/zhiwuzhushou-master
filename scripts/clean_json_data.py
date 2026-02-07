import json
import os
import glob
import sys
import io

# 设置输出编码为 UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def log(msg, log_file):
    print(msg)
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(msg + '\n')

def clean_json_data(directory):
    log_file = os.path.join(directory, "clean_process.log")
    if os.path.exists(log_file):
        os.remove(log_file)
        
    log(f"🔍 正在处理目录: {directory}", log_file)
    # 改用更可靠的文件查找方式
    all_files = os.listdir(directory)
    files = [os.path.join(directory, f) for f in all_files if f.startswith("未命名") and f.endswith(".json")]
    
    log(f"🔍 找到 {len(files)} 个待处理文件: {[os.path.basename(f) for f in files]}", log_file)
    all_data = []
    
    for file_path in files:
        fname = os.path.basename(file_path)
        log(f"📖 正在尝试读取: {fname}", log_file)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    continue
                    
                # 尝试修复截断的 JSON
                if not content.endswith(']'):
                    last_brace = content.rfind('}')
                    if last_brace != -1:
                        content = content[:last_brace+1] + '\n]'
                
                try:
                    data = json.loads(content)
                    if isinstance(data, list):
                        all_data.extend(data)
                    elif isinstance(data, dict):
                        log(f"✅ {fname} 成功解析为字典，添加 1 条记录。", log_file)
                        all_data.append(data)
                    else:
                        log(f"⚠️ {fname} 解析结果既不是列表也不是字典，跳过。", log_file)
                except json.JSONDecodeError as e:
                    # 如果仍然失败，尝试正则表达式提取所有对象
                    import re
                    log(f"⚠️ {fname} JSON 格式错误 ({e})，尝试提取出 {len(objects)} 个潜在对象...", log_file)
                    objects = re.findall(r'\{[^{}]*\}', content)
                    for obj_str in objects:
                        try:
                            all_data.append(json.loads(obj_str))
                            log(f"➕ 从 {fname} 成功提取并添加一个对象。", log_file)
                        except json.JSONDecodeError:
                            log(f"❌ 从 {fname} 提取的对象字符串无法解析为 JSON: {obj_str[:100]}...", log_file)
                            pass
        except Exception as e:
            log(f"❌ 读取 {fname} 时发生意外错误: {e}", log_file)

    log(f"📊 收集到原始对象总计: {len(all_data)}", log_file)

    cleaned_data = []
    seen_names = set()
    
    # 定义完整数据的标准
    required_fields = [
        "chinese_name", "scientific_name", "family", "genus", 
        "description", "morphology", "habitat", "distribution"
    ]

    for item in all_data:
        # 1. 检查是否是字典且包含必要字段
        if not isinstance(item, dict):
            continue
            
        name = item.get('chinese_name')
        if not name:
            continue
            
        # 2. 去重
        if name in seen_names:
            log(f"🔄 发现重复项: {name}", log_file)
            continue
            
        # 3. 检查数据是否完整
        is_complete = True
        reason = ""
        for field in required_fields:
            val = item.get(field)
            if not val:
                is_complete = False
                reason = f"缺失字段 {field}"
                break
            
            if isinstance(val, str):
                v_strip = val.strip()
                # 名称类字段只要不为空即可，描述类字段应有一定长度
                if field in ["chinese_name", "scientific_name", "family", "genus"]:
                    if len(v_strip) < 1:
                        is_complete = False
                        reason = f"字段 {field} 太短"
                        break
                else: 
                    # description, morphology, habitat, distribution
                    if len(v_strip) < 5 or v_strip.endswith('...'):
                        is_complete = False
                        reason = f"字段 {field} 未完成 (由于长度为 {len(v_strip)} 或包含 '...')"
                        break
        
        if is_complete:
            cleaned_data.append(item)
            seen_names.add(name)
        else:
            log(f"🗑️ 过滤掉数据 [{name}]: {reason}", log_file)

    log(f"✅ 清理完成。最终保留记录数: {len(cleaned_data)}", log_file)
    
    output_path = os.path.join(directory, "cleaned_plants.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
    
    log(f"💾 结果已保存至: {output_path}", log_file)

if __name__ == "__main__":
    target_dir = r"g:\work\zhiwuzhushou-master\doc\植物数据"
    clean_json_data(target_dir)
