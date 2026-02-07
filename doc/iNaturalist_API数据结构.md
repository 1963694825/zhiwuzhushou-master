# iNaturalist API 数据结构详解

## 📡 API基本信息

**官方文档**: https://api.inaturalist.org/v1/docs/

**API版本**: v1 (推荐) 和 旧版API

**数据格式**: JSON

**访问限制**: 免费,无需API Key(部分功能需要OAuth认证)

---

## 🌿 主要端点 (Endpoints)

### 1. GET /observations (获取观察记录)

**端点**: `https://api.inaturalist.org/v1/observations`

**用途**: 获取植物观察记录,这是最常用的端点

**请求参数**:
- `taxon_id`: 物种ID (例如: 47126 = 植物界)
- `q`: 搜索关键词
- `place_id`: 地点ID
- `user_id`: 用户ID
- `per_page`: 每页数量 (默认30,最大200)
- `page`: 页码
- `order_by`: 排序方式 (created_at, observed_on等)
- `photos`: 是否包含照片 (true/false)
- `quality_grade`: 质量等级 (research, needs_id, casual)

**示例请求**:
```
GET https://api.inaturalist.org/v1/observations?taxon_id=47126&place_id=6903&per_page=10
```

---

## 📊 返回数据结构

### 完整JSON响应示例

```json
{
  "total_results": 12345,
  "page": 1,
  "per_page": 10,
  "results": [
    {
      "id": 123456789,
      "species_guess": "银杏",
      "taxon": {
        "id": 135379,
        "name": "Ginkgo biloba",
        "rank": "species",
        "rank_level": 10,
        "iconic_taxon_name": "Plantae",
        "preferred_common_name": "Ginkgo",
        "default_photo": {
          "id": 12345,
          "license_code": "cc-by",
          "url": "https://static.inaturalist.org/photos/12345/medium.jpg",
          "attribution": "(c) User Name, some rights reserved (CC BY)",
          "square_url": "https://static.inaturalist.org/photos/12345/square.jpg",
          "medium_url": "https://static.inaturalist.org/photos/12345/medium.jpg",
          "large_url": "https://static.inaturalist.org/photos/12345/large.jpg"
        },
        "ancestor_ids": [48460, 47126, 211194, 47125, 47124, 135379],
        "ancestry": "48460/47126/211194/47125/47124"
      },
      "user": {
        "id": 12345,
        "login": "username",
        "name": "User Name",
        "icon": "https://static.inaturalist.org/attachments/users/icons/12345/thumb.jpg"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T12:00:00Z",
      "observed_on": "2024-01-15",
      "observed_on_string": "2024-01-15",
      "time_observed_at": "2024-01-15T10:30:00Z",
      "place_guess": "北京市, 中国",
      "location": "39.9042,116.4074",
      "latitude": "39.9042",
      "longitude": "116.4074",
      "positional_accuracy": 10,
      "geoprivacy": null,
      "quality_grade": "research",
      "num_identification_agreements": 5,
      "num_identification_disagreements": 0,
      "captive": false,
      "description": "在公园发现的银杏树",
      "photos": [
        {
          "id": 123456,
          "license_code": "cc-by-nc",
          "url": "https://static.inaturalist.org/photos/123456/original.jpg",
          "attribution": "(c) User Name, some rights reserved (CC BY-NC)",
          "square_url": "https://static.inaturalist.org/photos/123456/square.jpg",
          "small_url": "https://static.inaturalist.org/photos/123456/small.jpg",
          "medium_url": "https://static.inaturalist.org/photos/123456/medium.jpg",
          "large_url": "https://static.inaturalist.org/photos/123456/large.jpg",
          "original_url": "https://static.inaturalist.org/photos/123456/original.jpg"
        }
      ],
      "identifications": [
        {
          "id": 789012,
          "user": {
            "id": 54321,
            "login": "expert_user",
            "name": "Expert Name"
          },
          "taxon": {
            "id": 135379,
            "name": "Ginkgo biloba",
            "rank": "species"
          },
          "created_at": "2024-01-15T11:00:00Z",
          "current": true
        }
      ],
      "comments": [
        {
          "id": 456789,
          "user": {
            "login": "commenter",
            "name": "Commenter Name"
          },
          "body": "Beautiful specimen!",
          "created_at": "2024-01-15T11:30:00Z"
        }
      ],
      "uri": "https://www.inaturalist.org/observations/123456789"
    }
  ]
}
```

---

## 🔑 关键字段说明

### 观察记录 (Observation) 字段

| 字段名 | 类型 | 说明 |
|:---|:---|:---|
| `id` | Integer | 观察记录唯一ID |
| `species_guess` | String | 用户猜测的物种名称 |
| `observed_on` | Date | 观察日期 |
| `place_guess` | String | 地点描述 |
| `latitude` | Float | 纬度 |
| `longitude` | Float | 经度 |
| `quality_grade` | String | 质量等级: research/needs_id/casual |
| `description` | String | 观察描述 |
| `captive` | Boolean | 是否人工栽培 |

### 分类信息 (Taxon) 字段

| 字段名 | 类型 | 说明 |
|:---|:---|:---|
| `id` | Integer | 物种ID |
| `name` | String | 学名 |
| `rank` | String | 分类等级 (kingdom/phylum/class/order/family/genus/species) |
| `rank_level` | Integer | 等级数值 (越小越高级) |
| `preferred_common_name` | String | 常用名称 |
| `iconic_taxon_name` | String | 大类 (Plantae/Animalia等) |
| `ancestry` | String | 祖先分类路径 |
| `default_photo` | Object | 默认照片 |

### 照片 (Photo) 字段

| 字段名 | 类型 | 说明 |
|:---|:---|:---|
| `id` | Integer | 照片ID |
| `license_code` | String | 许可证类型 (cc-by, cc-by-nc等) |
| `attribution` | String | 版权信息 |
| `square_url` | String | 正方形缩略图 (75x75) |
| `small_url` | String | 小图 (240px) |
| `medium_url` | String | 中图 (500px) |
| `large_url` | String | 大图 (1024px) |
| `original_url` | String | 原图 |

---

## 🎯 实用查询示例

### 1. 获取中国的植物观察记录
```
GET https://api.inaturalist.org/v1/observations?taxon_id=47126&place_id=6903&per_page=50
```

**参数说明**:
- `taxon_id=47126`: 植物界 (Plantae)
- `place_id=6903`: 中国
- `per_page=50`: 每页50条

### 2. 搜索特定植物 (例如: 银杏)
```
GET https://api.inaturalist.org/v1/observations?taxon_name=Ginkgo+biloba&photos=true
```

### 3. 获取高质量研究级别的观察
```
GET https://api.inaturalist.org/v1/observations?quality_grade=research&iconic_taxa=Plantae
```

### 4. 按日期范围查询
```
GET https://api.inaturalist.org/v1/observations?d1=2024-01-01&d2=2024-12-31&taxon_id=47126
```

---

## 🔍 其他有用端点

### 2. GET /taxa (获取物种信息)

**端点**: `https://api.inaturalist.org/v1/taxa`

**用途**: 搜索和获取物种分类信息

**示例**:
```
GET https://api.inaturalist.org/v1/taxa?q=银杏&locale=zh-CN
```

**返回数据**:
```json
{
  "total_results": 1,
  "results": [
    {
      "id": 135379,
      "name": "Ginkgo biloba",
      "rank": "species",
      "preferred_common_name": "银杏",
      "matched_term": "银杏",
      "default_photo": {
        "medium_url": "https://..."
      },
      "wikipedia_url": "https://zh.wikipedia.org/wiki/银杏",
      "wikipedia_summary": "银杏(学名:Ginkgo biloba)..."
    }
  ]
}
```

### 3. GET /taxa/:id (获取特定物种详情)

**端点**: `https://api.inaturalist.org/v1/taxa/{id}`

**示例**:
```
GET https://api.inaturalist.org/v1/taxa/135379
```

### 4. GET /places (获取地点信息)

**端点**: `https://api.inaturalist.org/v1/places`

**用途**: 搜索地理位置

---

## 💡 数据提取策略

### 方案一: 批量获取中国植物数据

```python
import requests
import json
import time

def fetch_china_plants(page=1, per_page=200):
    """获取中国植物观察数据"""
    url = "https://api.inaturalist.org/v1/observations"
    
    params = {
        'taxon_id': 47126,  # 植物界
        'place_id': 6903,   # 中国
        'quality_grade': 'research',  # 研究级别
        'photos': 'true',   # 必须有照片
        'per_page': per_page,
        'page': page,
        'locale': 'zh-CN'   # 中文
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    return data

# 使用示例
for page in range(1, 11):  # 获取前10页
    data = fetch_china_plants(page=page)
    
    for obs in data['results']:
        plant_data = {
            'id': obs['id'],
            'chinese_name': obs['taxon'].get('preferred_common_name', ''),
            'scientific_name': obs['taxon']['name'],
            'photos': [photo['medium_url'] for photo in obs['photos']],
            'location': obs['place_guess'],
            'observed_on': obs['observed_on'],
            'description': obs.get('description', '')
        }
        
        print(f"植物: {plant_data['chinese_name']} ({plant_data['scientific_name']})")
    
    time.sleep(1)  # 避免请求过快
```

### 方案二: 获取特定物种的所有观察

```python
def fetch_species_observations(taxon_id, limit=1000):
    """获取特定物种的观察记录"""
    all_observations = []
    page = 1
    
    while len(all_observations) < limit:
        url = "https://api.inaturalist.org/v1/observations"
        params = {
            'taxon_id': taxon_id,
            'photos': 'true',
            'per_page': 200,
            'page': page
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if not data['results']:
            break
        
        all_observations.extend(data['results'])
        page += 1
        time.sleep(1)
    
    return all_observations[:limit]

# 获取银杏的1000条观察记录
ginkgo_obs = fetch_species_observations(135379, limit=1000)
```

---

## 📋 数据字段完整列表

### Observation对象包含的所有字段

```
- id
- species_guess
- taxon_id
- taxon (完整分类信息对象)
- user (用户信息对象)
- created_at
- updated_at
- observed_on
- observed_on_string
- time_observed_at
- place_guess
- location
- latitude
- longitude
- positional_accuracy
- geoprivacy
- quality_grade
- num_identification_agreements
- num_identification_disagreements
- captive
- description
- photos (照片数组)
- identifications (鉴定数组)
- comments (评论数组)
- tags (标签数组)
- uri (观察链接)
- license_code
- out_of_range
- community_taxon_id
```

---

## ⚠️ 使用注意事项

### 1. 速率限制
- 建议每秒不超过1个请求
- 使用 `time.sleep(1)` 控制频率

### 2. 数据许可
- 照片有不同的许可证 (CC-BY, CC-BY-NC等)
- 使用前检查 `license_code` 字段
- 遵守版权要求

### 3. 数据质量
- `quality_grade=research`: 最高质量,有专家鉴定
- `quality_grade=needs_id`: 需要鉴定
- `quality_grade=casual`: 随意观察

### 4. 中文支持
- 添加 `locale=zh-CN` 参数获取中文名称
- 不是所有物种都有中文名

---

## 🎯 推荐集成方案

### 数据库表结构

```sql
CREATE TABLE inat_observations (
    id BIGINT PRIMARY KEY,
    taxon_id INT,
    chinese_name VARCHAR(200),
    scientific_name VARCHAR(200),
    observed_on DATE,
    place_guess VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    quality_grade VARCHAR(20),
    description TEXT,
    photo_urls JSON,
    inat_url VARCHAR(500),
    created_at TIMESTAMP,
    INDEX idx_taxon (taxon_id),
    INDEX idx_date (observed_on)
);
```

---

## 📚 相关资源

- **官方API文档**: https://api.inaturalist.org/v1/docs/
- **旧版API文档**: https://www.inaturalist.org/pages/api+reference
- **数据导出**: https://www.inaturalist.org/observations/export
- **开放数据集**: https://github.com/inaturalist/inaturalist-open-data

---

**总结**: iNaturalist API提供了非常丰富的植物观察数据,包括高质量照片、专家鉴定、地理位置等信息,非常适合用于植物识别和科普应用!
