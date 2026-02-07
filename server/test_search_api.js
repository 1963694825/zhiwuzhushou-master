const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:9000/api/plants/search?q=兰花');
        const data = res.data.data;
        console.log(`--- 搜索结果总数: ${data.length} ---`);
        data.forEach((item, index) => {
            console.log(`${index + 1}. ${item.common_name_zh} (${item.family})`);
        });
    } catch (err) {
        console.error('调用失败:', err.message);
    }
}

test();
