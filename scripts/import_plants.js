// 导入植物数据到 MySQL
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importPlants() {
    try {
        // 读取数据
        const dataPath = path.join(__dirname, '../data/plants_initial.json');
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

        // 清空现有数据
        await connection.execute('TRUNCATE TABLE plants');
        console.log('🗑️  已清空现有数据\n');

        // 导入数据
        console.log('📥 开始导入数据...\n');
        let successCount = 0;

        for (const plant of plantsData) {
            await connection.execute(`
                INSERT INTO plants (
                    chinese_name, scientific_name, english_name,
                    family, genus, description, flowering_period, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                plant.chinese_name,
                plant.scientific_name,
                plant.english_name,
                plant.family,
                plant.genus,
                plant.description,
                plant.flowering_period,
                plant.image_url
            ]);

            successCount++;
            console.log(`✅ [${successCount}/${plantsData.length}] ${plant.chinese_name}`);
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ 成功导入 ${successCount} 条数据`);
        console.log('='.repeat(50));

        await connection.end();

    } catch (error) {
        console.error('❌ 导入失败:', error.message);
        process.exit(1);
    }
}

importPlants();
