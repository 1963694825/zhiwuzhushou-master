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
require('dotenv').config();

// [FIX] 解决 "Client network socket disconnected" 错误
// 允许 Node.js 接受自签名或代理软件拦截的 HTTPS 证书
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

// Trefle 植物搜索接口 (代理转发)
app.get('/api/plants/search', async (req, res) => {
    const query = req.query.q;
    const token = process.env.TREFLE_API_TOKEN;

    if (!query) {
        return res.status(400).json({ code: 400, message: '缺少搜索关键词' });
    }

    if (!token || token === '你的TREFLE_TOKEN') {
        // 如果未配置 Token，返回演示数据
        console.log('未配置 Trefle Token，返回本地演示搜索结果');
        const mockResults = [
            {
                common_name: "Mock " + query + " (演示)",
                scientific_name: "Mock Scientific Name",
                image_url: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&q=80",
                family: "Mock Family"
            },
            {
                common_name: "Wild " + query,
                scientific_name: "Wildus Plantae",
                image_url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80",
                family: "Wild Family"
            }
        ];
        return res.json({
            code: 200,
            message: '演示数据(主要Token未配置)',
            data: mockResults
        });
    }

    const logMsg = `\n[${new Date().toISOString()}] Search: ${query}, Token: ${token ? token.substring(0, 4) : 'Null'}\n`;
    fs.appendFileSync('debug.log', logMsg);

    console.log(`正在搜索 Trefle: ${query}`);
    console.log(`Token Prefix: ${token ? token.substring(0, 4) + '****' : 'None'}`);

    const options = {
        hostname: 'trefle.io',
        path: `/api/v1/plants/search?token=${token}&q=${encodeURIComponent(query)}`,
        method: 'GET',
        family: 4
    };

    const externalReq = https.request(options, (externalRes) => {
        let data = '';
        externalRes.on('data', (chunk) => data += chunk);
        externalRes.on('end', () => {
            console.log(`Trefle Status: ${externalRes.statusCode}`);
            try {
                const json = JSON.parse(data);

                // [DEBUG] 如果状态码不对或有 error 字段，打印详细日志
                if (externalRes.statusCode !== 200 || json.error) {
                    console.error('Trefle API Error Response:', data);
                    return res.status(externalRes.statusCode).json({
                        code: externalRes.statusCode,
                        message: json.message || 'Trefle API Error',
                        error: json
                    });
                }

                console.log(`Trefle 搜索成功，找到 ${json.data ? json.data.length : 0} 条结果`);
                res.json({
                    code: 200,
                    data: json.data || []
                });
            } catch (e) {
                console.error('Trefle 响应解析失败:', e);
                console.error('原始响应数据:', data);
                res.status(500).json({ code: 500, message: '第三方数据异常' });
            }
        });
    });

    externalReq.on('error', (e) => {
        console.error('Trefle 请求失败:', e);
        res.status(500).json({ code: 500, message: '搜索服务暂时不可用' });
    });

    externalReq.end();
});

// 启动服务，显式绑定 0.0.0.0 以确保 IPv4 兼容性
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务已启动，监听端口: ${PORT}`);
});
