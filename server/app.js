const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const querystring = require('querystring');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 配置上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 配置 Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 微信登录接口
app.post('/api/login', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ code: 400, msg: '缺少code参数' });
    }

    try {
        // 1. 请求微信 API 换取 OpenID
        const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_APPID}&secret=${process.env.WX_APPSECRET}&js_code=${code}&grant_type=authorization_code`;
        const wxRes = await axios.get(wxUrl);

        const { openid, session_key, errcode, errmsg } = wxRes.data;

        if (errcode) {
            return res.status(500).json({ code: errcode, msg: errmsg });
        }

        // 2. 检查数据库中是否存在该用户
        const [users] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
        let userId;

        if (users.length === 0) {
            // 如果用户不存在，则注册新用户
            const [result] = await db.query('INSERT INTO users (openid, last_login) VALUES (?, NOW())', [openid]);
            userId = result.insertId;
        } else {
            // 如果用户存在，更新最后登录时间
            userId = users[0].id;
            await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
        }

        // 3. 生成 JWT Token
        const token = jwt.sign({ userId, openid }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 4. 将 Token 存入数据库（可选，本项目之前表结构有设计token字段）
        await db.query('UPDATE users SET token = ? WHERE id = ?', [token, userId]);

        res.json({
            code: 200,
            msg: '登录成功',
            data: {
                token,
                userInfo: users.length > 0 ? users[0] : { id: userId, openid }
            }
        });

    } catch (error) {
        console.error('登录异常:', error);
        res.status(500).json({ code: 500, msg: '服务器内部错误' });
    }
});

// 更新用户信息接口（头像和昵称）
app.post('/api/user/update', async (req, res) => {
    const { nickname, avatar_url } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.json({ code: 401, msg: '未登录' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await db.query(
            'UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?',
            [nickname, avatar_url, userId]
        );

        res.json({
            code: 200,
            msg: '更新成功',
            data: { nickname, avatar_url }
        });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.json({ code: 500, msg: '服务器错误' });
    }
});

// 全局缓存 Token
let cachedToken = null;
let tokenExpireTime = 0;



// 获取百度 AI Access Token (带缓存)
async function getBaiduAccessToken() {
    // 1. 检查缓存
    if (cachedToken && Date.now() < tokenExpireTime) {
        return cachedToken;
    }

    const AK = process.env.BAIDU_API_KEY;
    const SK = process.env.BAIDU_SECRET_KEY;

    if (!AK || !SK || AK === '你的API_KEY') {
        throw new Error('请在 .env 文件中配置有效的 BAIDU_API_KEY 和 BAIDU_SECRET_KEY');
    }

    const postData = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: AK,
        client_secret: SK
    });

    const options = {
        hostname: 'aip.baidubce.com',
        path: '/oauth/2.0/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        },
        family: 4,
        agent: new https.Agent({ keepAlive: false, rejectUnauthorized: false })
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.error) {
                        reject(new Error(result.error_description || '获取Token失败'));
                    } else {
                        // 更新缓存 (提前 2 天过期)
                        cachedToken = result.access_token;
                        tokenExpireTime = Date.now() + (result.expires_in * 1000) - (48 * 60 * 60 * 1000);
                        resolve(result.access_token);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

// 封装带重试机制的 API 调用
async function callIdentifyApi(postData, retryCount = 4) {
    const options = {
        hostname: 'aip.baidubce.com',
        path: '/rest/2.0/image-classify/v1/plant',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        },
        family: 4,
        agent: new https.Agent({ keepAlive: false, rejectUnauthorized: false })
    };

    try {
        const result = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', (e) => reject(e));
            req.write(postData);
            req.end();
        });

        // 检查 QPS 错误
        if (result.error_code === 18 && retryCount > 0) {
            console.log(`QPS限制，正在重试(${retryCount})...`);
            // 等待 1.5s - 2s
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));
            return callIdentifyApi(postData, retryCount - 1);
        }

        return result;

    } catch (error) {
        if (retryCount > 0) {
            console.log(`网络错误，正在重试(${retryCount})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return callIdentifyApi(postData, retryCount - 1);
        }
        throw error;
    }
}

// 植物识别接口 (对接百度 AI)
app.post('/api/identify/plant', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.json({ code: 400, message: '请上传图片' });
    }

    console.log('收到识别请求，正在调用百度 AI...');
    const filePath = req.file.path;

    try {
        // 1. 读取文件并转换为 Base64
        const imageBitmap = fs.readFileSync(filePath);
        const imageBase64 = Buffer.from(imageBitmap).toString('base64');

        // 2. 获取 Access Token (带缓存)
        const accessToken = await getBaiduAccessToken();

        // 3. 构造请求数据
        const postData = querystring.stringify({
            image: imageBase64,
            baike_num: 1,
            access_token: accessToken
        });

        // 4. 调用 API (带自动重试)
        const result = await callIdentifyApi(postData);

        if (result.error_code) {
            let userMsg = `识别失败: ${result.error_msg}`;
            if (result.error_code === 18) throw new Error('QPS_LIMIT_REACHED'); // 特殊标记，触发降级
            if (result.error_code === 17) userMsg = '今日识别次数已达上限';
            if (result.error_code === 6) userMsg = '密钥配置有误 (无权限)';
            throw new Error(userMsg);
        }

        // 5. 处理成功结果
        if (result.result && result.result.length > 0) {
            const bestMatch = result.result[0];
            const responseData = {
                name: bestMatch.name,
                confidence: bestMatch.score,
                description: bestMatch.baike_info ? bestMatch.baike_info.description : '暂无详细描述',
                care_tips: '植物养护需要精心照料，建议查询具体养护指南。',
                baike_url: bestMatch.baike_info ? bestMatch.baike_info.baike_url : '',
                image_url: bestMatch.baike_info ? bestMatch.baike_info.image_url : ''
            };

            res.json({
                code: 200,
                message: '识别成功',
                data: responseData
            });
        } else {
            res.json({ code: 404, message: '未识别出植物' });
        }

    } catch (error) {
        console.error('植物识别过程出错:', error.message);

        // [清理演示代码] 不再降级为模拟数据，直接返回错误信息
        res.status(500).json({
            code: 500,
            message: error.message || '识别服务暂时不可用',
            debug: error.message
        });
    } finally {
        // 清理临时文件
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
});

// 本地数据库植物搜索接口
app.get('/api/plants/search', async (req, res) => {
    const { q, page = 1 } = req.query;
    const limit = 1000;
    const offset = (page - 1) * limit;

    if (!q) {
        return res.status(400).json({ code: 400, message: '缺少搜索关键词' });
    }

    console.log(`正在搜索本地数据库: ${q}`);

    try {
        const searchPattern = `%${q}%`;

        // 1. 先查找匹配关键词的植物，以此获取 family_id
        const [matchRows] = await db.query(
            `SELECT family_id, family FROM plants 
             WHERE chinese_name LIKE ? 
                OR scientific_name LIKE ?
                OR english_name LIKE ?
             LIMIT 1`,
            [searchPattern, searchPattern, searchPattern]
        );

        let finalRows = [];

        if (matchRows.length > 0) {
            const familyId = matchRows[0].family_id;
            const familyName = matchRows[0].family;

            console.log(`初步匹配到植物，所属科: ${familyName} (ID: ${familyId})`);

            if (familyId) {
                const [allInFamily] = await db.query(
                    `SELECT * FROM plants WHERE family_id = ?`,
                    [familyId]
                );
                finalRows = allInFamily;
            } else {
                // 如果没有 family_id（兼容性考虑），则仅返回关键词搜索结果
                const [basicRows] = await db.query(
                    `SELECT * FROM plants 
                     WHERE chinese_name LIKE ? 
                        OR scientific_name LIKE ?
                        OR english_name LIKE ?
                     LIMIT 100`,
                    [searchPattern, searchPattern, searchPattern]
                );
                finalRows = basicRows;
            }
        } else {
            console.log("未匹配到任何植物名称");
        }

        // 3. 结果排序逻辑
        // 优先级：完全匹配 > 包含匹配 > 同科其他
        finalRows.sort((a, b) => {
            const aName = a.chinese_name || "";
            const bName = b.chinese_name || "";

            // 完全匹配排最前
            if (aName === q && bName !== q) return -1;
            if (bName === q && aName !== q) return 1;

            // 包含匹配排次之
            const aMatch = aName.includes(q);
            const bMatch = bName.includes(q);
            if (aMatch && !bMatch) return -1;
            if (bMatch && !aMatch) return 1;

            return 0;
        });

        // 4. 分页处理 (内存分页)
        const paginatedRows = finalRows.slice(offset, offset + limit);

        console.log(`本地数据库搜索成功，最终返回 ${paginatedRows.length} 条记录`);

        const plants = paginatedRows.map(plant => ({
            id: plant.id,
            common_name: plant.chinese_name,
            common_name_zh: plant.chinese_name,
            scientific_name: plant.scientific_name,
            family: plant.family,
            image_url: plant.image_url,
            slug: plant.id,
            description: plant.description
        }));

        res.json({
            code: 200,
            data: plants,
            total: finalRows.length
        });

    } catch (error) {
        console.error('数据库搜索错误:', error);
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 本地数据库植物详情接口
app.get('/api/plants/detail/:slug', async (req, res) => {
    const { slug } = req.params;

    console.log(`正在获取本地数据库详情: ${slug}`);

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM plants WHERE id = ?',
            [slug]
        );

        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '未找到植物' });
        }

        const plant = rows[0];
        res.json({
            code: 200,
            data: {
                id: plant.id,
                common_name: plant.chinese_name,
                common_name_zh: plant.chinese_name,
                scientific_name: plant.scientific_name,
                english_name: plant.english_name,
                alias: plant.alias,
                family: plant.family,
                genus: plant.genus,
                description: plant.description,
                history: plant.history,
                morphology: plant.morphology,
                habitat: plant.habitat,
                distribution: plant.distribution,
                observations_zh: plant.description,
                flowering_period: plant.flowering_period,
                image_url: plant.image_url
            }
        });

    } catch (error) {
        console.error('数据库详情错误:', error);
        res.status(500).json({ code: 500, message: error.message });
    }
});

// --- 知识页面筛选菜单 API (核心逻辑) ---

// 1. 获取一级大类
app.get('/api/knowledge/primaries', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM knowledge_primary_categories ORDER BY sort_order');
        res.json({ code: 200, data: rows });
    } catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 2. 获取二级细分
app.get('/api/knowledge/secondaries/:primary_id', async (req, res) => {
    const { primary_id } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM knowledge_secondary_categories WHERE primary_id = ? ORDER BY sort_order',
            [primary_id]
        );
        res.json({ code: 200, data: rows });
    } catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 3. 获取品种列表 (侧边栏动态加载)
app.get('/api/knowledge/species', async (req, res) => {
    const { primary_id, secondary_id } = req.query;

    try {
        let query = '';
        let params = [];

        if (primary_id) {
            query = `
                SELECT DISTINCT sp.* FROM knowledge_species sp
                JOIN knowledge_species_category_mapping m ON sp.id = m.species_id
                WHERE m.primary_id = ?
            `;
            params = [primary_id];

            if (secondary_id) {
                query += ' AND m.secondary_id = ?';
                params.push(secondary_id);
            }
        } else {
            // 如果没传分类 ID，默认拉取所有品种
            query = 'SELECT * FROM knowledge_species';
        }

        query += ' ORDER BY sort_order';

        const [rows] = await db.query(query, params);
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('获取品种列表失败:', error);
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 4. 搜索品种 (根据名称模糊匹配)
app.get('/api/knowledge/search', async (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ code: 400, message: '缺少keyword参数' });
    }

    try {
        const query = 'SELECT * FROM knowledge_species WHERE name LIKE ? ORDER BY sort_order';
        const [rows] = await db.query(query, [`%${keyword}%`]);
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('搜索品种失败:', error);
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 5. 获取选定品种的科普文章 (按品种列表)
app.get('/api/knowledge/articles/:species_id', async (req, res) => {
    const { species_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT a.* FROM knowledge_articles a
             JOIN knowledge_article_species_mapping m ON a.id = m.article_id
             WHERE m.species_id = ?
             ORDER BY a.publish_time DESC`,
            [species_id]
        );
        res.json({ code: 200, data: rows });
    } catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 6. 获取单篇文章详情 (按文章 ID)
app.get('/api/knowledge/article/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM knowledge_articles WHERE id = ?',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '文章未找到' });
        }
        res.json({ code: 200, data: rows[0] });
    } catch (error) {
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 启动服务，显式绑定 0.0.0.0 以确保 IPv4 兼容性
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务已启动，监听端口: ${PORT}`);
});
