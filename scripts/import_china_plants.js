// 导入中国植物名录数据到 MySQL
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importChinaPlants() {
    try {
        // 1. 读取转换后的JSON数据
        const dataPath = path.join(__dirname, '../data/cnplants_converted.json');

        if (!fs.existsSync(dataPath)) {
            console.error('❌ JSON数据文件不存在!');
            console.log('💡 请先运行: python scripts/convert_xlsx_to_json.py');
            process.exit(1);
        }

        const plantsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`📊 读取到 ${plantsData.length} 条植物数据\n`);

        // 2. 连接数据库
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',  // 请修改为实际密码
            database: 'plant_assistant',
            charset: 'utf8mb4'
        });

        console.log('✅ 数据库连接成功\n');

        // 3. 检查并扩展表结构
        console.log('🔧 检查表结构...\n');

        // 检查是否需要添加新字段
        const [columns] = await connection.execute(
            "SHOW COLUMNS FROM plants LIKE 'distribution'"
        );

        if (columns.length === 0) {
            console.log('📝 扩展表结构,添加新字段...');
            await connection.execute(`
                ALTER TABLE plants 
                ADD COLUMN distribution TEXT COMMENT '地理分布' AFTER description,
                ADD COLUMN ecology TEXT COMMENT '生态环境' AFTER distribution,
                ADD COLUMN altitude VARCHAR(100) COMMENT '海拔范围' AFTER ecology,
                ADD COLUMN iucn_status VARCHAR(50) COMMENT 'IUCN濒危等级' AFTER altitude,
                ADD COLUMN endemic_to_china VARCHAR(10) COMMENT '是否中国特有' AFTER iucn_status,
                ADD COLUMN plant_group VARCHAR(50) COMMENT '植物类群' AFTER endemic_to_china,
                ADD COLUMN data_source VARCHAR(100) DEFAULT 'plantlist_data' COMMENT '数据来源' AFTER plant_group
            `);
            console.log('✅ 表结构扩展完成\n');
        }

        // 4. 开始导入数据
        console.log('📥 开始导入数据...\n');
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (let i = 0; i < plantsData.length; i++) {
            const plant = plantsData[i];

            try {
                // 检查是否已存在(根据学名去重)
                if (plant.scientific_name) {
                    const [existing] = await connection.execute(
                        'SELECT id FROM plants WHERE scientific_name = ?',
                        [plant.scientific_name]
                    );

                    if (existing.length > 0) {
                        skipCount++;
                        if (skipCount % 100 === 0) {
                            console.log(`⏭️  已跳过 ${skipCount} 条重复数据...`);
                        }
                        continue;
                    }
                }

                // 插入新数据
                await connection.execute(`
                    INSERT INTO plants (
                        chinese_name, scientific_name, family, genus,
                        description, distribution, altitude,
                        iucn_status, endemic_to_china, plant_group,
                        data_source, image_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    plant.chinese_name || '',
                    plant.scientific_name_full || plant.scientific_name || '',
                    plant.family || '',
                    plant.genus || '',
                    `${plant.family_cn || ''}科 ${plant.genus_cn || ''}属植物`,
                    plant.distribution || '',
                    plant.altitude || '',
                    plant.iucn_status || '',
                    plant.endemic_to_china || '',
                    plant.group || '',
                    'plantlist_data',
                    '' // 暂无图片
                ]);

                successCount++;

                // 每100条显示一次进度
                if (successCount % 100 === 0) {
                    console.log(`✅ [${successCount}/${plantsData.length}] ${plant.chinese_name || plant.scientific_name}`);
                }

            } catch (err) {
                errorCount++;
                if (errorCount <= 10) {
                    console.error(`❌ 导入失败: ${plant.chinese_name}`, err.message);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ 成功导入: ${successCount} 条`);
        console.log(`⏭️  跳过重复: ${skipCount} 条`);
        console.log(`❌ 导入失败: ${errorCount} 条`);
        console.log(`📊 总计处理: ${plantsData.length} 条`);
        console.log('='.repeat(60));

        // 5. 创建索引优化查询
        console.log('\n🔧 创建索引优化查询性能...');
        try {
            await connection.execute('CREATE INDEX idx_family ON plants(family)');
            await connection.execute('CREATE INDEX idx_genus ON plants(genus)');
            await connection.execute('CREATE INDEX idx_plant_group ON plants(plant_group)');
            console.log('✅ 索引创建完成');
        } catch (err) {
            console.log('⚠️  索引可能已存在,跳过创建');
        }

        // 6. 显示统计信息
        console.log('\n📊 数据库统计信息:');
        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT family) as families,
                COUNT(DISTINCT genus) as genera,
                data_source
            FROM plants
            GROUP BY data_source
        `);

        console.table(stats);

        await connection.end();

    } catch (error) {
        console.error('❌ 导入失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

importChinaPlants();
