// 数据导入脚本
// 将爬取的 JSON 数据导入 MySQL 数据库

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'plant_assistant',
    charset: 'utf8mb4'
};

async function importPlants() {
    let connection;

    try {
        // 读取爬取的数据
        const dataPath = path.join(__dirname, 'plants_data.json');
        if (!fs.existsSync(dataPath)) {
            console.error('❌ 数据文件不存在:', dataPath);
            console.log('💡 请先运行爬虫: python baike_crawler.py');
            return;
        }

        const plantsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`📊 读取到 ${plantsData.length} 条植物数据\n`);

        // 连接数据库
        console.log('🔌 连接数据库...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功\n');

        // 清空现有数据（可选）
        const clearTable = process.argv.includes('--clear');
        if (clearTable) {
            console.log('🗑️  清空现有数据...');
            await connection.execute('TRUNCATE TABLE plants');
            console.log('✅ 数据已清空\n');
        }

        // 导入数据
        console.log('📥 开始导入数据...\n');
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < plantsData.length; i++) {
            const plant = plantsData[i];

            try {
                await connection.execute(`
                    INSERT INTO plants (
                        chinese_name, scientific_name, english_name, alias,
                        family, genus, description, morphology,
                        habitat, distribution, flowering_period, image_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    plant.chinese_name,
                    plant.scientific_name,
                    plant.english_name,
                    plant.alias,
                    plant.family,
                    plant.genus,
                    plant.description,
                    plant.morphology,
                    plant.habitat,
                    plant.distribution,
                    plant.flowering_period,
                    plant.image_url
                ]);

                successCount++;
                console.log(`✅ [${i + 1}/${plantsData.length}] ${plant.chinese_name}`);

            } catch (error) {
                failCount++;
                console.error(`❌ [${i + 1}/${plantsData.length}] ${plant.chinese_name} - ${error.message}`);
            }
        }

        // 统计信息
        console.log('\n' + '='.repeat(50));
        console.log('📊 导入统计:');
        console.log(`   ✅ 成功: ${successCount} 条`);
        console.log(`   ❌ 失败: ${failCount} 条`);
        console.log(`   📈 总计: ${plantsData.length} 条`);
        console.log('='.repeat(50));

        // 查询验证
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM plants');
        console.log(`\n✅ 数据库中共有 ${rows[0].count} 条植物数据`);

    } catch (error) {
        console.error('❌ 导入失败:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 数据库连接已关闭');
        }
    }
}

// 运行导入
console.log('🌿 植物数据导入工具\n');
importPlants()
    .then(() => {
        console.log('\n🎉 导入完成！');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💔 导入失败:', error);
        process.exit(1);
    });
