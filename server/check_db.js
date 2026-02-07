const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCount() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'plant_assistant',
        charset: 'utf8mb4'
    });

    try {
        const keyword = '蓝莓';

        // 1. 检查 plants 表
        const [plantMatches] = await pool.execute(
            `SELECT COUNT(*) as total FROM plants WHERE chinese_name LIKE ?`,
            [`%${keyword}%`]
        );
        console.log(`Table plants: Found ${plantMatches[0].total} rows containing "${keyword}"`);

        // 2. 检查 knowledge_species 表
        const [speciesRows] = await pool.execute('SELECT name FROM knowledge_species');
        console.log('Knowledge species in sidebar:', speciesRows.map(s => s.name));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkCount();
