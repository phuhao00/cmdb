const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081/api/v1';

// 测试资产数据
const testAssets = [
  {
    name: 'Web服务器001',
    type: 'server',
    status: 'online',
    location: '数据中心A-机架1-位置1',
    description: '主要的Web应用服务器，运行Nginx和Node.js'
  },
  {
    name: 'Web服务器002',
    type: 'server',
    status: 'online',
    location: '数据中心A-机架1-位置2',
    description: '备用Web应用服务器，负载均衡配置'
  },
  {
    name: '数据库服务器001',
    type: 'server',
    status: 'online',
    location: '数据中心A-机架2-位置1',
    description: 'MySQL主数据库服务器，8核64GB内存'
  },
  {
    name: '数据库服务器002',
    type: 'server',
    status: 'maintenance',
    location: '数据中心A-机架2-位置2',
    description: 'MySQL从数据库服务器，正在进行维护'
  },
  {
    name: '应用服务器001',
    type: 'server',
    status: 'online',
    location: '数据中心A-机架3-位置1',
    description: 'Java应用服务器，运行Spring Boot应用'
  },
  {
    name: '应用服务器002',
    type: 'server',
    status: 'offline',
    location: '数据中心A-机架3-位置2',
    description: 'Java应用服务器，因硬件故障停机'
  },
  {
    name: '备份服务器001',
    type: 'server',
    status: 'online',
    location: '数据中心B-机架1-位置1',
    description: '专用备份服务器，每日自动备份'
  },
  {
    name: '核心交换机A',
    type: 'network',
    status: 'online',
    location: '数据中心A-网络室',
    description: '48端口千兆交换机，连接所有服务器'
  },
  {
    name: '核心交换机B',
    type: 'network',
    status: 'online',
    location: '数据中心B-网络室',
    description: '48端口千兆交换机，备用网络设备'
  },
  {
    name: '防火墙设备',
    type: 'network',
    status: 'online',
    location: '数据中心A-安全区',
    description: '企业级防火墙，保护网络安全'
  },
  {
    name: '路由器001',
    type: 'network',
    status: 'maintenance',
    location: '数据中心A-网络室',
    description: '外网连接路由器，正在更新固件'
  },
  {
    name: '存储阵列001',
    type: 'storage',
    status: 'online',
    location: '数据中心A-存储区',
    description: '20TB存储阵列，RAID 5配置'
  },
  {
    name: '存储阵列002',
    type: 'storage',
    status: 'online',
    location: '数据中心B-存储区',
    description: '50TB存储阵列，用于备份和归档'
  },
  {
    name: 'NAS存储',
    type: 'storage',
    status: 'online',
    location: '办公区-IT机房',
    description: '网络附加存储，用于文件共享'
  },
  {
    name: '开发工作站001',
    type: 'workstation',
    status: 'online',
    location: '开发部-A区',
    description: '高性能开发工作站，配置i7处理器'
  },
  {
    name: '开发工作站002',
    type: 'workstation',
    status: 'online',
    location: '开发部-A区',
    description: '开发工作站，用于前端开发'
  },
  {
    name: '测试工作站001',
    type: 'workstation',
    status: 'offline',
    location: '测试部-B区',
    description: '测试专用工作站，正在重装系统'
  },
  {
    name: '设计工作站001',
    type: 'workstation',
    status: 'online',
    location: '设计部-C区',
    description: '高配图形工作站，配置专业显卡'
  },
  {
    name: '老旧服务器001',
    type: 'server',
    status: 'decommissioned',
    location: '仓库-待处理区',
    description: '已报废的老旧服务器，等待回收'
  },
  {
    name: '监控服务器',
    type: 'server',
    status: 'online',
    location: '数据中心A-监控区',
    description: '系统监控服务器，运行监控软件'
  }
];

async function addTestAssets() {
  console.log('开始添加测试资产数据...');
  
  try {
    for (let i = 0; i < testAssets.length; i++) {
      const asset = testAssets[i];
      console.log(`添加资产 ${i + 1}/${testAssets.length}: ${asset.name}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/assets`, asset);
        console.log(`✓ 成功添加: ${asset.name}`);
      } catch (error) {
        console.log(`✗ 添加失败: ${asset.name} - ${error.message}`);
      }
      
      // 添加小延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n测试数据添加完成！');
    console.log('现在刷新浏览器页面，您应该能看到：');
    console.log('1. 更多的资产数据');
    console.log('2. 分页控件（每页显示10条，可切换每页5/10/20/50条）');
    console.log('3. 在移动设备上查看时会显示卡片布局');
    console.log('4. 可以测试搜索和筛选功能');
    
  } catch (error) {
    console.error('添加测试数据时出错:', error.message);
    console.log('\n请确保后端服务正在运行（端口8081）');
  }
}

// 检查后端服务是否可用
async function checkBackend() {
  try {
    const response = await axios.get(`${API_BASE_URL}/assets`);
    console.log('后端服务正常，开始添加测试数据...\n');
    return true;
  } catch (error) {
    console.error('无法连接到后端服务，请确保：');
    console.error('1. 后端服务正在运行（端口8081）');
    console.error('2. 数据库连接正常');
    console.error('\n错误详情:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== CMDB 资产管理系统 - 测试数据生成器 ===\n');
  
  const backendOk = await checkBackend();
  if (backendOk) {
    await addTestAssets();
  }
}

main().catch(console.error); 