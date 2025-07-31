// 简单的功能测试
const http = require('http');

console.log('🧪 开始简单功能测试...\n');

// 测试前端页面
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`前端页面状态码: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log('✅ 前端页面正常');
    } else {
        console.log('❌ 前端页面异常');
    }
});

req.on('error', (e) => {
    console.error(`❌ 前端页面测试失败: ${e.message}`);
});

req.end();

// 测试后端API
const apiOptions = {
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const apiReq = http.request(apiOptions, (res) => {
    console.log(`后端API状态码: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.token) {
                console.log('✅ 后端登录API正常');
                console.log(`Token: ${response.token.substring(0, 20)}...`);
            } else {
                console.log('❌ 后端登录API异常');
                console.log(`响应: ${data}`);
            }
        } catch (e) {
            console.log('❌ 后端响应解析失败');
            console.log(`响应: ${data}`);
        }
    });
});

apiReq.on('error', (e) => {
    console.error(`❌ 后端API测试失败: ${e.message}`);
});

apiReq.write(JSON.stringify({
    username: 'admin',
    password: 'admin123'
}));
apiReq.end();