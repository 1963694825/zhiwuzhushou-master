#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
将中国植物名录数据库(XLSX)转换为JSON格式
数据来源: https://github.com/helixcn/plantlist_data
"""

import pandas as pd
import json
import os
from pathlib import Path

def convert_xlsx_to_json():
    """转换XLSX数据为JSON格式"""
    
    # 文件路径
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    xlsx_file = project_root / 'data' / 'plantlist_data' / 'cnplants_dat_updated.xlsx'
    output_file = project_root / 'data' / 'cnplants_converted.json'
    
    print(f"📂 读取文件: {xlsx_file}")
    
    if not xlsx_file.exists():
        print(f"❌ 文件不存在: {xlsx_file}")
        print("💡 请先执行: git clone https://github.com/helixcn/plantlist_data.git")
        return
    
    try:
        # 读取Excel文件
        df = pd.read_excel(xlsx_file, engine='openpyxl')
        
        print(f"✅ 成功读取 {len(df)} 条记录")
        print(f"📊 数据列: {list(df.columns)}\n")
        
        # 数据清洗和转换
        plants_data = []
        
        for idx, row in df.iterrows():
            # 跳过无效数据
            if pd.isna(row.get('SPECIES_CN')) and pd.isna(row.get('SPECIES')):
                continue
            
            plant = {
                'chinese_name': str(row.get('SPECIES_CN', '')).strip() if pd.notna(row.get('SPECIES_CN')) else '',
                'scientific_name': str(row.get('SPECIES', '')).strip() if pd.notna(row.get('SPECIES')) else '',
                'scientific_name_full': str(row.get('SPECIES_FULL', '')).strip() if pd.notna(row.get('SPECIES_FULL')) else '',
                'genus': str(row.get('GENUS', '')).strip() if pd.notna(row.get('GENUS')) else '',
                'genus_cn': str(row.get('GENUS_CN', '')).strip() if pd.notna(row.get('GENUS_CN')) else '',
                'family': str(row.get('FAMILY_APGIII', '')).strip() if pd.notna(row.get('FAMILY_APGIII')) else '',
                'family_cn': str(row.get('FAMILY_CN', '')).strip() if pd.notna(row.get('FAMILY_CN')) else '',
                'group': str(row.get('GROUP', '')).strip() if pd.notna(row.get('GROUP')) else '',
                'iucn_status': str(row.get('IUCN_CHINA', '')).strip() if pd.notna(row.get('IUCN_CHINA')) else '',
                'endemic_to_china': str(row.get('ENDEMIC_TO_CHINA', '')).strip() if pd.notna(row.get('ENDEMIC_TO_CHINA')) else '',
                'distribution': str(row.get('PROVINTIAL_DISTRIBUTION', '')).strip() if pd.notna(row.get('PROVINTIAL_DISTRIBUTION')) else '',
                'altitude': str(row.get('ALTITUDE', '')).strip() if pd.notna(row.get('ALTITUDE')) else '',
            }
            
            # 只保留有效数据
            if plant['chinese_name'] or plant['scientific_name']:
                plants_data.append(plant)
            
            # 进度显示
            if (idx + 1) % 1000 == 0:
                print(f"⏳ 已处理 {idx + 1}/{len(df)} 条记录...")
        
        # 保存为JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(plants_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n{'='*60}")
        print(f"✅ 转换完成!")
        print(f"📊 有效数据: {len(plants_data)} 条")
        print(f"💾 保存位置: {output_file}")
        print(f"📦 文件大小: {output_file.stat().st_size / 1024 / 1024:.2f} MB")
        print(f"{'='*60}")
        
        # 显示示例数据
        print("\n📝 数据示例 (前3条):")
        for i, plant in enumerate(plants_data[:3], 1):
            print(f"\n{i}. {plant['chinese_name']} ({plant['scientific_name']})")
            print(f"   科: {plant['family_cn']} ({plant['family']})")
            print(f"   属: {plant['genus_cn']} ({plant['genus']})")
            if plant['distribution']:
                print(f"   分布: {plant['distribution'][:50]}...")
        
    except Exception as e:
        print(f"❌ 转换失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    convert_xlsx_to_json()
