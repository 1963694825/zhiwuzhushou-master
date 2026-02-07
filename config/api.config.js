// API配置文件
// 开发环境使用本机IP,生产环境使用域名

const config = {
    // 开发环境配置
    development: {
        // 方式1: 使用localhost(需要在微信开发者工具中开启"不校验合法域名")
        baseUrl: 'http://192.168.110.203:9000',

        // 方式2: 使用本机IP(真机调试时使用)
        // baseUrl: 'http://192.168.110.203:9000',
    },

    // 生产环境配置
    production: {
        baseUrl: 'https://api.yourapp.com',
    }
};

// 当前环境
const env = 'development'; // 'development' | 'production'

// 导出配置
export default {
    baseUrl: config[env].baseUrl,
    timeout: 10000,

    // API端点
    api: {
        // 植物相关
        plantsSearch: '/api/plants/search',
        plantDetail: '/api/plants/detail',
        plantIdentify: '/api/identify/plant',

        // 用户相关
        login: '/api/login',
        userUpdate: '/api/user/update',
    }
};
