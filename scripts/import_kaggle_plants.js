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
            console.log('📥 下载地址: https://www.kaggle.com/datasets/sadmansadiksabekonnoislam/plants-json-dataset');
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
        let errorCount = 0;

        for (const plant of plantsData) {
            try {
                // 检查是否已存在
                if (plant.scientific_name) {
                    const [existing] = await connection.execute(
                        'SELECT id FROM plants WHERE scientific_name = ?',
                        [plant.scientific_name]
                    );

                    if (existing.length > 0) {
                        skipCount++;
                        continue;
                    }
                }

                // 插入数据
                await connection.execute(`
                    INSERT INTO plants (
                        chinese_name, scientific_name, english_name,
                        family, genus, image_url,
                        description, data_source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    plant.common_name || '',
                    plant.scientific_name || '',
                    plant.common_name || '',
                    plant.family || '',
                    plant.genus || '',
                    plant.image_url || '',
                    `${plant.family_common_name || ''} - ${plant.rank || ''}`,
                    'kaggle'
                ]);

                successCount++;

                if (successCount % 100 === 0) {
                    console.log(`✅ 已导入 ${successCount} 条...`);
                }

            } catch (err) {
                errorCount++;
                if (errorCount <= 10) {
                    console.error(`❌ 导入失败: ${plant.scientific_name}`, err.message);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ 成功导入: ${successCount} 条`);
        console.log(`⏭️  跳过重复: ${skipCount} 条`);
        console.log(`❌ 导入失败: ${errorCount} 条`);
        console.log(`📊 总计处理: ${plantsData.length} 条`);
        console.log('='.repeat(60));

        await connection.end();

    } catch (error) {
        console.error('❌ 导入失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

importKagglePlants();
