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
require('dotenv').config();

// [FIX] 解决 "Client network socket disconnected" 错误
// 允许 Node.js 接受自签名或代理软件拦截的 HTTPS 证书
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors());
app.use(express.json());

// 创建 MySQL 连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'plant_assistant',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
});

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

// 百度翻译函数
async function translateText(text, from = 'en', to = 'zh') {
    if (!text) return text;

    const appid = process.env.BAIDU_TRANSLATE_APPID;
    const key = process.env.BAIDU_TRANSLATE_KEY;

    // 如果未配置翻译 API，直接返回原文
    if (!appid || !key || appid === '你的翻译APPID') {
        console.log('未配置翻译 API，返回原文');
        return text;
    }

    const salt = Date.now();
    const crypto = require('crypto');
    const sign = crypto.createHash('md5').update(appid + text + salt + key).digest('hex');

    const params = querystring.stringify({
        q: text,
        from: 'en',
        to: 'zh',
        appid: appid,
        salt: salt,
        sign: sign
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'fanyi-api.baidu.com',
            path: `/api/trans/vip/translate?${params}`,
            method: 'GET',
            family: 4
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.trans_result && json.trans_result[0]) {
                        resolve(json.trans_result[0].dst);
                    } else {
                        console.error('翻译失败:', json);
                        resolve(text); // 翻译失败返回原文
                    }
                } catch (e) {
                    console.error('翻译响应解析失败:', e);
                    resolve(text);
                }
            });
        });

        req.on('error', (e) => {
            console.error('翻译请求失败:', e);
            resolve(text); // 出错返回原文
        });

        req.end();
    });
}

// GBIF 物种查询函数：通过中文名查询学名
async function getScientificNameFromChinese(chineseName) {
    if (!chineseName) return null;

    console.log(`正在通过 GBIF 查询: ${chineseName}`);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.gbif.org',
            path: `/v1/species/search?q=${encodeURIComponent(chineseName)}&language=zh&limit=1`,
            method: 'GET',
            family: 4
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.results && json.results.length > 0) {
                        const scientificName = json.results[0].scientificName;
                        console.log(`GBIF 查询成功: ${chineseName} -> ${scientificName}`);
                        resolve(scientificName);
                    } else {
                        console.log(`GBIF 未找到: ${chineseName}`);
                        resolve(null);
                    }
                } catch (e) {
                    console.error('GBIF 响应解析失败:', e);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error('GBIF 请求失败:', e);
            resolve(null);
        });

        req.setTimeout(5000, () => {
            console.log('GBIF 请求超时');
            req.destroy();
            resolve(null);
        });

        req.end();
    });
}

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
        const [matchRows] = await pool.execute(
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
                const [allInFamily] = await pool.execute(
                    `SELECT * FROM plants WHERE family_id = ?`,
                    [familyId]
                );
                finalRows = allInFamily;
            } else {
                // 如果没有 family_id（兼容性考虑），则仅返回关键词搜索结果
                const [basicRows] = await pool.execute(
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

// 启动服务，显式绑定 0.0.0.0 以确保 IPv4 兼容性
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务已启动，监听端口: ${PORT}`);
});
