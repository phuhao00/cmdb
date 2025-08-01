import axios, { AxiosResponse } from 'axios';
import apiConfig from '@/config/api';

// API Configuration - 从配置文件获取
const API_BASE_URL = apiConfig.API_BASE_URL;
const AI_API_BASE_URL = apiConfig.AI_API_BASE_URL;

// 接口定义
interface AssetData {
  id?: string;
  name: string;
  type: string;
  location: string;
  status: string;
  // 其他资产属性
}

interface WorkflowData {
  id?: string;
  name: string;
  description: string;
  status: string;
  // 其他工作流属性
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: apiConfig.API_TIMEOUT,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Assets API
export const fetchAssets = (): Promise<AxiosResponse<AssetData[]>> => {
  return apiClient.get('/assets');
};

export const fetchAssetById = (id: string): Promise<AxiosResponse<AssetData>> => {
  return apiClient.get(`/assets/${id}`);
};

export const createAsset = (assetData: AssetData): Promise<AxiosResponse<AssetData>> => {
  return apiClient.post('/assets', assetData);
};

export const updateAsset = (id: string, assetData: Partial<AssetData>): Promise<AxiosResponse<AssetData>> => {
  return apiClient.put(`/assets/${id}`, assetData);
};

export const deleteAsset = (id: string): Promise<AxiosResponse<void>> => {
  return apiClient.delete(`/assets/${id}`);
};

export const fetchAssetStats = (): Promise<AxiosResponse<Record<string, unknown>>> => {
  return apiClient.get('/assets/stats');
};

export const fetchAssetTypes = (): Promise<AxiosResponse<string[]>> => {
  return apiClient.get('/assets/types');
};

export const fetchAssetLocations = (): Promise<AxiosResponse<string[]>> => {
  return apiClient.get('/assets/locations');
};

export const fetchAssetCosts = (): Promise<AxiosResponse<Record<string, unknown>>> => {
  return apiClient.get('/assets/costs');
};

export const fetchCriticalAssets = (): Promise<AxiosResponse<AssetData[]>> => {
  return apiClient.get('/assets/critical');
};

export const updateAssetCosts = (id: string, costsData: Record<string, unknown>): Promise<AxiosResponse<Record<string, unknown>>> => {
  return apiClient.put(`/assets/${id}/costs`, costsData);
};

// Workflows API
export const fetchWorkflows = (): Promise<AxiosResponse<WorkflowData[]>> => {
  return apiClient.get('/workflows');
};

export const createWorkflow = (workflowData: WorkflowData): Promise<AxiosResponse<WorkflowData>> => {
  return apiClient.post('/workflows', workflowData);
};

export const updateWorkflow = (id: string, workflowData: Partial<WorkflowData>): Promise<AxiosResponse<WorkflowData>> => {
  return apiClient.put(`/workflows/${id}`, workflowData);
};

export const fetchWorkflowStats = (): Promise<AxiosResponse<Record<string, unknown>>> => {
  return apiClient.get('/workflows/stats');
};

// Reports API
export const fetchInventoryReport = (): Promise<AxiosResponse<Record<string, unknown>>> => {
  return apiClient.get('/reports/inventory');
};

export const fetchLifecycleReport = (): Promise<AxiosResponse<Record<string, unknown>>> => {
  return apiClient.get('/reports/lifecycle');
};

export const fetchComplianceReport = (): Promise<AxiosResponse<Record<string, unknown>>> => {
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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AI API
export const sendChatMessage = async (message: string, language: string = 'zh'): Promise<AxiosResponse<ChatResponse>> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('此功能仅在客户端可用');
    }

    // 检查token
    const token = localStorage.getItem('auth_token');
    console.log('🤖 调用AI API:', message, language);
    console.log('🔑 Token存在:', !!token);
    
    // 如果没有token，提示用户重新登录
    if (!token) {
      throw new Error('请先登录系统');
    }
    
    // 使用axios直接调用
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
    
  } catch (error: unknown) {
    console.error('❌ AI API 错误:', error);
    
    // 检查是否是axios错误
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      console.error('❌ 错误详情:', axiosError.response?.data);
      console.error('❌ 错误状态:', axiosError.response?.status);
      
      // 如果是401错误，提示重新登录
      if (axiosError.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
        throw new Error('登录已过期，请重新登录');
      }
    }
    
    throw error;
  }
};

export const getAISuggestions = (): Promise<AxiosResponse<string[]>> => {
  return aiApiClient.get('/ai/suggestions');
};

// Test AI API (no auth required)
export const testAIChat = async (message: string, language: string = 'zh'): Promise<AxiosResponse<ChatResponse>> => {
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