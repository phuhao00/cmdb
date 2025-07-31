// 前端功能自动测试脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8081/api';

async function testFrontendFunctionality() {
    console.log('🧪 开始前端功能测试...\n');
    
    try {
        // 1. 测试前端页面可访问性
        console.log('1️⃣ 测试前端页面可访问性...');
        const frontendResponse = await axios.get(BASE_URL, {
            timeout: 10000,
            validateStatus: () => true // 接受所有状态码
        });
        console.log(`   前端状态码: ${frontendResponse.status}`);
        
        if (frontendResponse.status === 200) {
            console.log('   ✅ 前端页面可访问');
        } else {
            console.log('   ❌ 前端页面访问失败');
            return;
        }
        
        // 2. 测试后端登录API
        console.log('\n2️⃣ 测试后端登录API...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`   登录状态码: ${loginResponse.status}`);
        if (loginResponse.data.token) {
            console.log('   ✅ 登录成功，获得token');
            console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
        } else {
            console.log('   ❌ 登录失败，未获得token');
            return;
        }
        
        const token = loginResponse.data.token;
        
        // 3. 测试认证接口
        console.log('\n3️⃣ 测试认证接口...');
        const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`   认证状态码: ${meResponse.status}`);
        if (meResponse.data.username) {
            console.log(`   ✅ 认证成功，用户: ${meResponse.data.username}`);
        } else {
            console.log('   ❌ 认证失败');
            return;
        }
        
        // 4. 测试AI聊天接口
        console.log('\n4️⃣ 测试AI聊天接口...');
        try {
            const aiResponse = await axios.post(`${API_BASE_URL}/ai/chat`, {
                message: '你好',
                language: 'zh'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            
            console.log(`   AI聊天状态码: ${aiResponse.status}`);
            if (aiResponse.data.message) {
                console.log(`   ✅ AI聊天成功: ${aiResponse.data.message.substring(0, 100)}...`);
            } else {
                console.log('   ❌ AI聊天失败，无响应消息');
            }
        } catch (aiError) {
            console.log(`   ❌ AI聊天失败: ${aiError.response?.status || aiError.message}`);
            if (aiError.response?.data) {
                console.log(`   错误详情: ${JSON.stringify(aiError.response.data)}`);
            }
        }
        
        console.log('\n🎉 前端功能测试完成！');
        
    } catch (error) {
        console.error(`❌ 测试失败: ${error.message}`);
        if (error.response) {
            console.error(`状态码: ${error.response.status}`);
            console.error(`响应: ${JSON.stringify(error.response.data)}`);
        }
    }
}

// 运行测试
testFrontendFunctionality();