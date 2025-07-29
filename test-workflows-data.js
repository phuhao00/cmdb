const axios = require('axios');

// API Configuration
const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sample workflow data
const sampleWorkflows = [
  {
    type: 'Asset Status Change',
    assetId: 'SERVER001',
    requester: 'admin',
    requesterId: '507f1f77bcf86cd799439011',
    priority: 'high',
    reason: '服务器需要升级，请求将状态从在线改为维护中'
  },
  {
    type: 'Maintenance',
    assetId: 'SERVER002', 
    requester: 'admin',
    requesterId: '507f1f77bcf86cd799439011',
    priority: 'medium',
    reason: '定期维护检查，预计需要2小时完成系统更新'
  },
  {
    type: 'Decommission',
    assetId: 'SERVER003',
    requester: 'admin',
    requesterId: '507f1f77bcf86cd799439011', 
    priority: 'low',
    reason: '设备已使用5年，性能下降严重，申请报废处理'
  },
  {
    type: 'Asset Status Change',
    assetId: 'LAPTOP001',
    requester: 'admin',
    requesterId: '507f1f77bcf86cd799439011',
    priority: 'medium',
    reason: '笔记本电脑故障，需要送修，申请状态变更为离线'
  },
  {
    type: 'Maintenance',
    assetId: 'SWITCH001',
    requester: 'admin', 
    requesterId: '507f1f77bcf86cd799439011',
    priority: 'high',
    reason: '网络交换机出现间歇性故障，需要紧急维护检查'
  }
];

// Function to create workflows
async function createSampleWorkflows() {
  console.log('Starting to create sample workflows...');
  
  try {
    // First, try to login to get auth token
    console.log('Attempting to login...');
    const loginResponse = await apiClient.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token obtained');
    
    // Add token to headers
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    
    // Create each workflow
    for (let i = 0; i < sampleWorkflows.length; i++) {
      const workflow = sampleWorkflows[i];
      try {
        console.log(`Creating workflow ${i + 1}: ${workflow.type} for ${workflow.assetId}`);
        const response = await apiClient.post('/workflows', workflow);
        console.log(`✓ Created workflow: ${response.data.id}`);
        
        // Add some delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`✗ Failed to create workflow ${i + 1}:`, error.response?.data || error.message);
      }
    }
    
    console.log('\nSample workflows creation completed!');
    
    // Fetch and display created workflows
    console.log('\nFetching all workflows to verify:');
    const workflowsResponse = await apiClient.get('/workflows');
    console.log(`Total workflows found: ${workflowsResponse.data.length}`);
    
    workflowsResponse.data.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.type} - ${workflow.status} - ${workflow.priority} priority`);
      console.log(`   Reason: ${workflow.reason}`);
      console.log(`   Created: ${new Date(workflow.createdAt).toLocaleString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error during workflow creation:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\nTip: Make sure the backend is running and the admin user exists.');
      console.log('You can check by visiting: http://localhost:8081/api/auth/login');
    }
  }
}

// Run the script
createSampleWorkflows(); 