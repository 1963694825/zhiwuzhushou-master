# Kaggle 植物数据集下载指南

## 📦 可用数据集

### 方案一: Plants Json Dataset (推荐⭐⭐⭐⭐)

**搜索方法**: 
1. 访问 https://www.kaggle.com/datasets
2. 搜索框输入: `"Plants Json dataset"`
3. 选择文件大小约1.14MB的数据集

**文件**: `plants.json`

**数据规模**: 1.14 MB

**数据字段**:
- `id`: 植物ID
- `common_name`: 常见名称
- `scientific_name`: 学名
- `year`: 描述年份
- `bibliography`: 参考文献
- `author`: 作者
- `status`: 状态
- `rank`: 分类等级
- `family_common_name`: 科的常见名称
- `genus_id`: 属ID
- `image_url`: 图片URL
- `synonyms`: 同义词
- `genus`: 属
- `family`: 科

### 方案二: Plant Dataset (USDA)

**搜索关键词**: `Plant Dataset USDA`

**数据内容**: 
- 拉丁名(学名或属名)
- 州缩写
- 来源: USDA植物数据库

### 方案三: PlantVillage Dataset

**搜索关键词**: `PlantVillage Dataset`

**数据内容**: 
- 54,000+植物叶片图片
- 14种作物
- 包含病害识别数据

---

## 📥 下载方法

### 方法一: 网页搜索下载 (推荐⭐⭐⭐⭐⭐)

1. **访问Kaggle数据集页面**:
   ```
   https://www.kaggle.com/datasets
   ```

2. **搜索数据集**:
   - 在搜索框输入: `Plants Json dataset`
   - 或搜索: `plant json` 查看所有相关数据集
   - 选择文件大小约1.14MB的 "Plants Json dataset"

3. **登录Kaggle账号**:
   - 如果没有账号,先注册: https://www.kaggle.com/account/login
   - 可以使用Google/Facebook账号快速登录

4. **下载数据集**:
   - 点击数据集页面右上角的 **"Download"** 按钮
   - 数据集会下载为ZIP文件
   - 解压到 `g:\work\zhiwuzhushou-master\data\` 目录

**提示**: 如果找不到特定数据集,可以尝试搜索其他植物相关数据集,如 `PlantVillage` 或 `USDA plants`

---

### 方法二: 使用Kaggle API (需要配置)

#### 步骤1: 获取Kaggle API Token

1. 登录Kaggle网站
2. 点击右上角头像 -> **Account**
3. 滚动到 **API** 部分
4. 点击 **Create New API Token**
5. 会下载一个 `kaggle.json` 文件

#### 步骤2: 配置API Token

**Windows系统**:
```powershell
# 创建.kaggle目录
mkdir $env:USERPROFILE\.kaggle

# 将kaggle.json移动到该目录
move Downloads\kaggle.json $env:USERPROFILE\.kaggle\

# 查看文件内容(验证)
cat $env:USERPROFILE\.kaggle\kaggle.json
```

#### 步骤3: 下载数据集

```powershell
cd g:\work\zhiwuzhushou-master

# 下载并解压
kaggle datasets download -d sadmansadiksabekonnoislam/plants-json-dataset -p data --unzip
```

---

### 方法三: 使用Python脚本下载 (需要API Token)

创建 `scripts/download_kaggle_plants.py`:

```python
import os
from kaggle.api.kaggle_api_extended import KaggleApi

def download_plants_dataset():
    """下载Kaggle植物数据集"""
    
    # 初始化Kaggle API
    api = KaggleApi()
    api.authenticate()
    
    # 数据集信息
    dataset = 'sadmansadiksabekonnoislam/plants-json-dataset'
    download_path = '../data'
    
    print(f"📥 开始下载数据集: {dataset}")
    
    # 下载数据集
    api.dataset_download_files(
        dataset,
        path=download_path,
        unzip=True
    )
    
    print(f"✅ 下载完成! 文件保存在: {download_path}")
    
    # 列出下载的文件
    import glob
    files = glob.glob(f"{download_path}/*.json")
    print(f"\n📄 下载的文件:")
    for file in files:
        print(f"  - {file}")

if __name__ == '__main__':
    download_plants_dataset()
```

运行脚本:
```bash
python scripts/download_kaggle_plants.py
```

---

## 📊 数据示例

下载后的 `plants.json` 文件格式示例:

```json
[
  {
    "id": 1,
    "common_name": "Ginkgo",
    "scientific_name": "Ginkgo biloba",
    "year": "1771",
    "bibliography": "Mant. Pl. 2: 313",
    "author": "L.",
    "status": "accepted",
    "rank": "species",
    "family_common_name": "Ginkgo family",
    "genus_id": 123,
    "image_url": "https://example.com/ginkgo.jpg",
    "synonyms": [],
    "genus": "Ginkgo",
    "family": "Ginkgoaceae"
  },
  {
    "id": 2,
    "common_name": "Rose",
    "scientific_name": "Rosa chinensis",
    "year": "1768",
    "bibliography": "...",
    "author": "Jacq.",
    "status": "accepted",
    "rank": "species",
    "family_common_name": "Rose family",
    "genus_id": 456,
    "image_url": "https://example.com/rose.jpg",
    "synonyms": ["Rosa indica"],
    "genus": "Rosa",
    "family": "Rosaceae"
  }
]
```

---

## 🔧 数据导入脚本

下载完成后,使用以下脚本导入数据库:

创建 `scripts/import_kaggle_plants.js`:

```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importKagglePlants() {
    try {
        // 读取JSON数据
        const dataPath = path.join(__dirname, '../data/plants.json');
        
        if (!fs.existsSync(dataPath)) {
            console.error('❌ 文件不存在:', dataPath);
            console.log('💡 请先从Kaggle下载数据集');
            process.exit(1);
        }
        
        const plantsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`📊 读取到 ${plantsData.length} 条植物数据\n`);
        
        // 连接数据库
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'plant_assistant',
            charset: 'utf8mb4'
        });
        
        console.log('✅ 数据库连接成功\n');
        
        // 导入数据
        let successCount = 0;
        let skipCount = 0;
        
        for (const plant of plantsData) {
            try {
                // 检查是否已存在
                const [existing] = await connection.execute(
                    'SELECT id FROM plants WHERE scientific_name = ?',
                    [plant.scientific_name]
                );
                
                if (existing.length > 0) {
                    skipCount++;
                    continue;
                }
                
                // 插入数据
                await connection.execute(`
                    INSERT INTO plants (
                        chinese_name, scientific_name, english_name,
                        family, genus, image_url,
                        data_source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    plant.common_name || '',
                    plant.scientific_name || '',
                    plant.common_name || '',
                    plant.family || '',
                    plant.genus || '',
                    plant.image_url || '',
                    'kaggle'
                ]);
                
                successCount++;
                
                if (successCount % 100 === 0) {
                    console.log(`✅ 已导入 ${successCount} 条...`);
                }
                
            } catch (err) {
                console.error(`❌ 导入失败: ${plant.scientific_name}`, err.message);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`✅ 成功导入: ${successCount} 条`);
        console.log(`⏭️  跳过重复: ${skipCount} 条`);
        console.log(`📊 总计: ${plantsData.length} 条`);
        console.log('='.repeat(60));
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ 导入失败:', error.message);
        process.exit(1);
    }
}

importKagglePlants();
```

---

## ⚠️ 常见问题

### Q1: Kaggle API返回403错误?
**A**: 需要配置Kaggle API Token,参考"方法二"的步骤。

### Q2: 下载的ZIP文件在哪里?
**A**: 
- 浏览器默认下载位置(通常是 `Downloads` 文件夹)
- 解压后移动到 `g:\work\zhiwuzhushou-master\data\`

### Q3: 数据集有多大?
**A**: 约几MB,包含植物基本信息的JSON文件。

### Q4: 图片URL是否可用?
**A**: 需要验证,部分URL可能失效,建议下载后检查。

---

## 📝 下一步操作

1. ✅ 下载数据集
2. ✅ 解压到data目录
3. ⏳ 运行导入脚本
4. ⏳ 验证数据
5. ⏳ 补充图片(如需要)

---

**最后更新**: 2026-02-06
