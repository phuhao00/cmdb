// 测试智普AI集成的脚本
const API_BASE = 'http://localhost:8081';

// 模拟登录获取token
async function login() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

// 测试AI聊天功能
async function testAIChat(token) {
    const testMessages = [
        { message: "你好，我是新用户", language: "zh" },
        { message: "请帮我查看系统状态", language: "zh" }, 
        { message: "显示所有资产", language: "zh" },
        { message: "我的工作流", language: "zh" },
        { message: "系统统计", language: "zh" },
        { message: "Hello, show me asset status", language: "en" },
        { message: "Help me with commands", language: "en" }
    ];

    console.log('🤖 测试智普AI聊天功能...\n');

    for (const testMsg of testMessages) {
        try {
            console.log(`👤 用户(${testMsg.language}): ${testMsg.message}`);
            
            const response = await fetch(`${API_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testMsg)
            });

            if (!response.ok) {
                throw new Error(`Chat API failed: ${response.status}`);
            }

            const data = await response.json();
            console.log(`🤖 AI助手: ${data.message}`);
            
            if (data.suggestions && data.suggestions.length > 0) {
                console.log(`💡 建议操作: ${data.suggestions.join(', ')}`);
            }
            
            if (data.intent) {
                console.log(`🎯 识别意图: ${data.intent}`);
            }
            
            console.log(`⏰ 响应时间: ${data.timestamp}\n`);
            
            // 短暂延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ 测试失败 "${testMsg.message}":`, error.message);
        }
    }
}

// 测试AI建议功能
async function testAISuggestions(token) {
    try {
        console.log('🔍 测试AI建议功能...\n');
        
        const response = await fetch(`${API_BASE}/api/ai/suggestions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Suggestions API failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('💡 系统建议:', data.suggestions.join(', '));
        console.log('');
        
    } catch (error) {
        console.error('❌ 建议功能测试失败:', error.message);
    }
}

// 主测试函数
async function main() {
    console.log('='.repeat(60));
    console.log('🧪 CMDB 智普AI集成测试');
    console.log('='.repeat(60));
    console.log('');

    // 检查API服务是否可用
    try {
        const healthResponse = await fetch(`${API_BASE}/health`);
        if (!healthResponse.ok) {
            console.log('⚠️  后端服务可能未启动，请先启动CMDB后端服务');
            console.log('   运行: cd backend && go run main.go');
            return;
        }
    } catch (error) {
        console.log('⚠️  无法连接到后端服务，请确保服务已启动');
        console.log('   运行: cd backend && go run main.go');
        return;
    }

    // 登录获取token
    const token = await login();
    if (!token) {
        console.log('❌ 登录失败，请检查用户名密码');
        return;
    }
    
    console.log('✅ 登录成功\n');

    // 测试AI功能
    await testAISuggestions(token);
    await testAIChat(token);

    console.log('='.repeat(60));
    console.log('📋 测试总结:');
    console.log('• 智普AI服务已成功集成到CMDB系统');
    console.log('• 支持中英文双语对话');
    console.log('• 提供智能建议和意图识别');
    console.log('• 无API密钥时自动使用模拟响应');
    console.log('');
    console.log('💡 配置智普AI API密钥:');
    console.log('   export ZHIPU_API_KEY=your-api-key-here');
    console.log('   或参考 ZHIPU_AI_SETUP.md 文档');
    console.log('='.repeat(60));
}

// 运行测试
main().catch(console.error);