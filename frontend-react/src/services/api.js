import axios from 'axios';
import apiConfig from '../config/api';

// API Configuration - 从配置文件获取
const API_BASE_URL = apiConfig.API_BASE_URL;
const AI_API_BASE_URL = apiConfig.AI_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: apiConfig.API_TIMEOUT,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Assets API
export const fetchAssets = () => {
  return apiClient.get('/assets');
};

export const fetchAssetById = (id) => {
  return apiClient.get(`/assets/${id}`);
};

export const createAsset = (assetData) => {
  return apiClient.post('/assets', assetData);
};

export const updateAsset = (id, assetData) => {
  return apiClient.put(`/assets/${id}`, assetData);
};

export const deleteAsset = (id) => {
  return apiClient.delete(`/assets/${id}`);
};

export const fetchAssetStats = () => {
  return apiClient.get('/assets/stats');
};

export const fetchAssetTypes = () => {
  return apiClient.get('/assets/types');
};

export const fetchAssetLocations = () => {
  return apiClient.get('/assets/locations');
};

export const fetchAssetCosts = () => {
  return apiClient.get('/assets/costs');
};

export const fetchCriticalAssets = () => {
  return apiClient.get('/assets/critical');
};

export const updateAssetCosts = (id, costsData) => {
  return apiClient.put(`/assets/${id}/costs`, costsData);
};

// Workflows API
export const fetchWorkflows = () => {
  return apiClient.get('/workflows');
};

export const createWorkflow = (workflowData) => {
  return apiClient.post('/workflows', workflowData);
};

export const updateWorkflow = (id, workflowData) => {
  return apiClient.put(`/workflows/${id}`, workflowData);
};

export const fetchWorkflowStats = () => {
  return apiClient.get('/workflows/stats');
};

// Reports API
export const fetchInventoryReport = () => {
  return apiClient.get('/reports/inventory');
};

export const fetchLifecycleReport = () => {
  return apiClient.get('/reports/lifecycle');
};

export const fetchComplianceReport = () => {
  return apiClient.get('/reports/compliance');
};

// Create AI API client
const aiApiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: apiConfig.AI_API_TIMEOUT,
});

// Add AI API interceptor for auth
aiApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AI API - 直接使用通用的apiClient而不是aiApiClient
export const sendChatMessage = async (message, language = 'zh') => {
  try {
    // 检查token - 使用正确的key
    const token = localStorage.getItem('auth_token');
    console.log('🤖 调用AI API:', message, language);
    console.log('🔑 Token存在:', !!token);
    console.log('🔑 Token内容:', token);
    
    // 如果没有token，提示用户重新登录
    if (!token) {
      throw new Error('请先登录系统');
    }
    
    // 使用通用apiClient并手动设置完整URL和headers
    const response = await axios.post('/api/ai/chat', {
      message: message,
      language: language
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ AI API 响应:', response.data);
    return response;
    
  } catch (error) {
    console.error('❌ AI API 错误:', error);
    console.error('❌ 错误详情:', error.response?.data);
    console.error('❌ 错误状态:', error.response?.status);
    
    // 如果是401错误，提示重新登录
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw new Error('登录已过期，请重新登录');
    }
    
    throw error;
  }
};

export const getAISuggestions = () => {
  return aiApiClient.get('/ai/suggestions');
};

// Test AI API (no auth required)
export const testAIChat = async (message, language = 'zh') => {
  try {
    console.log('🧪 测试AI API (无认证):', message);
    
    const response = await apiClient.post('/ai/test', {
      message: message,
      language: language
    });
    
    console.log('✅ AI测试成功:', response.data);
    return response;
    
  } catch (error) {
    console.error('❌ AI测试失败:', error);
    throw error;
  }
};