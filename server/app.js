const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

// 启动服务
app.listen(PORT, () => {
    console.log(`服务已启动，监听端口: ${PORT}`);
});
