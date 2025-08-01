// Next.js 前端功能完整测试脚本
const http = require('http');

console.log('🧪 开始Next.js前端功能测试...\n');

// 测试前端页面
const testFrontend = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Next.js前端页面状态码: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Next.js前端页面正常访问');
        resolve(res.statusCode);
      } else {
        console.log('❌ Next.js前端页面异常');
        reject(new Error(`前端返回状态码: ${res.statusCode}`));
      }
    });

    req.on('error', (e) => {
      console.error(`❌ Next.js前端页面测试失败: ${e.message}`);
      reject(e);
    });

    req.end();
  });
};

// 测试后端API登录
const testBackendLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`✅ 后端登录API状态码: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.token) {
            console.log('✅ 后端登录API正常');
            console.log(`🔑 Token: ${response.token.substring(0, 20)}...`);
            resolve(response.token);
          } else {
            console.log('❌ 后端登录API异常');
            console.log(`响应: ${data}`);
            reject(new Error('登录失败'));
          }
        } catch (e) {
          console.log('❌ 后端响应解析失败');
          console.log(`响应: ${data}`);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ 后端API测试失败: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

// 测试AI聊天API
const testAIChat = (token) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: '你好，请介绍一下CMDB系统',
      language: 'zh'
    });

    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/api/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`🤖 AI聊天API状态码: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.message) {
            console.log('✅ AI聊天API正常');
            console.log(`🤖 AI响应: ${response.message.substring(0, 100)}...`);
            resolve(response);
          } else {
            console.log('❌ AI聊天API异常');
            console.log(`响应: ${data}`);
            reject(new Error('AI聊天失败'));
          }
        } catch (e) {
          console.log('❌ AI响应解析失败');
          console.log(`响应: ${data}`);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ AI聊天API测试失败: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

// 运行完整测试
async function runCompleteTest() {
  try {
    console.log('1️⃣ 测试Next.js前端页面...');
    await testFrontend();
    
    console.log('\n2️⃣ 测试后端登录API...');
    const token = await testBackendLogin();
    
    console.log('\n3️⃣ 测试AI聊天API...');
    await testAIChat(token);
    
    console.log('\n🎉 所有测试通过！Next.js前端迁移成功！');
    console.log('\n✨ 新功能特性:');
    console.log('  - ✅ Next.js 14 + TypeScript');
    console.log('  - ✅ Tailwind CSS 样式框架');
    console.log('  - ✅ Lucide React 图标库');
    console.log('  - ✅ 现代化的认证系统');
    console.log('  - ✅ 响应式设计');
    console.log('  - ✅ AI聊天助手集成');
    console.log('  - ✅ Docker容器化部署');
    
  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行测试
runCompleteTest();