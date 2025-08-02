import axios, { AxiosResponse } from 'axios';
import apiConfig from '@/config/api';

// API Configuration - 从配置文件获取
const API_BASE_URL = apiConfig.API_BASE_URL;
const AI_API_BASE_URL = apiConfig.AI_API_BASE_URL;

// 接口定义
export interface AssetData {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance' | 'decommissioned';
  location: string;
  description: string;
  purchasePrice: number;
  annualCost: number;
  department?: string;
  owner?: string;
  ipAddress?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  type: 'asset_create' | 'asset_update' | 'asset_delete' | 'maintenance' | 'decommission';
  assetId?: string;
  assetName?: string;
  requestedBy: string;
  assignedTo?: string;
  requestData?: Record<string, unknown>;
  approvalComments?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AssetStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  decommissioned: number;
  totalValue: number;
  annualCost: number;
  byType: Record<string, number>;
  byLocation: Record<string, number>;
  byDepartment: Record<string, number>;
  recentChanges: number;
}

export interface WorkflowStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
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

export const bulkCreateAssets = (assetsData: AssetData[]): Promise<AxiosResponse<{ message: string; assetsCreated: number }>> => {
  return apiClient.post('/assets/bulk', assetsData);
};

export const fetchAssetStats = (): Promise<AxiosResponse<AssetStats>> => {
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

// Alias functions for backward compatibility
export const getAssets = fetchAssets;
export const getAsset = fetchAssetById;
export const getAssetStats = fetchAssetStats;
export const getAssetTypes = fetchAssetTypes;
export const getAssetLocations = fetchAssetLocations;
export const getAssetCosts = fetchAssetCosts;
export const getCriticalAssets = fetchCriticalAssets;

// Asset action functions
export const requestDecommission = (assetId: string): Promise<AxiosResponse<AssetData>> => {
  return apiClient.post(`/assets/${assetId}/decommission`);
};

export const exportAssets = (format: string = 'json'): Promise<AxiosResponse<AssetData[]>> => {
  return apiClient.get(`/assets/export?format=${format}`);
};

export const exportAssetsCSV = (): Promise<AxiosResponse<Blob>> => {
  return apiClient.get('/assets/export?format=csv', { responseType: 'blob' });
};

export const importAssets = (formData: FormData): Promise<AxiosResponse<{ 
  success: number; 
  failed: number; 
  errors?: Array<{ row: number; field: string; message: string }> 
}>> => {
  return apiClient.post('/assets/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

export const approveWorkflow = (id: string, comments?: string): Promise<AxiosResponse<WorkflowData>> => {
  return apiClient.put(`/workflows/${id}/approve`, { comments });
};

export const rejectWorkflow = (id: string, comments?: string): Promise<AxiosResponse<WorkflowData>> => {
  return apiClient.put(`/workflows/${id}/reject`, { comments });
};

export const fetchWorkflowStats = (): Promise<AxiosResponse<WorkflowStats>> => {
  return apiClient.get('/workflows/stats');
};

// Workflow alias functions
export const getWorkflows = fetchWorkflows;
export const getWorkflow = (id: string): Promise<AxiosResponse<WorkflowData>> => {
  return apiClient.get(`/workflows/${id}`);
};
export const getWorkflowStats = fetchWorkflowStats;
export const getPendingWorkflows = (): Promise<AxiosResponse<WorkflowData[]>> => {
  return apiClient.get('/workflows/pending');
};

// User and Auth functions
export const login = async (username: string, password: string): Promise<AxiosResponse<{ token: string; user: any }>> => {
  return apiClient.post('/auth/login', { username, password });
};

export const logout = async (): Promise<AxiosResponse<void>> => {
  return apiClient.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<AxiosResponse<any>> => {
  return apiClient.get('/auth/user');
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<AxiosResponse<void>> => {
  return apiClient.post('/auth/change-password', { oldPassword, newPassword });
};

export const createUser = async (userData: any): Promise<AxiosResponse<any>> => {
  return apiClient.post('/users', userData);
};

export const getUsers = async (): Promise<AxiosResponse<any[]>> => {
  return apiClient.get('/users');
};

export const getUser = async (userId: string): Promise<AxiosResponse<any>> => {
  return apiClient.get(`/users/${userId}`);
};

export const updateUserStatus = async (userId: string, status: string): Promise<AxiosResponse<any>> => {
  return apiClient.put(`/users/${userId}/status`, { status });
};

// Feishu webhook
export const handleFeishuWebhook = async (data: any): Promise<AxiosResponse<any>> => {
  return apiClient.post('/webhook/feishu', data);
};

// AI Chat functions
// sendChat alias will be added after sendChatMessage is defined

// Reports API
export const downloadInventoryReport = async (): Promise<void> => {
  const response = await apiClient.get('/reports/inventory', {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadLifecycleReport = async (): Promise<void> => {
  const response = await apiClient.get('/reports/lifecycle', {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `lifecycle-report-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadComplianceReport = async (): Promise<void> => {
  const response = await apiClient.get('/reports/compliance', {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `compliance-report-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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

// Alias for sendChatMessage
export const sendChat = sendChatMessage;

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

// Audit Log APIs
export interface AuditLogSearchParams {
  page?: number;
  limit?: number;
  userId?: string;
  username?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  ipAddress?: string;
  sortBy?: string;
  sortOrder?: string;
}

// API service object
export const apiService = {
  // Existing APIs
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
  requestDecommission,
  bulkCreateAssets,
  getAssetTypes,
  getAssetLocations,
  getAssetCosts,
  getCriticalAssets,
  updateAssetCosts,
  exportAssets,
  exportAssetsCSV,
  importAssets,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  approveWorkflow,
  rejectWorkflow,
  getWorkflowStats,
  getPendingWorkflows,
  handleFeishuWebhook,
  login,
  logout,
  getCurrentUser,
  changePassword,
  createUser,
  getUsers,
  getUser,
  updateUserStatus,
  sendChat,
  getAISuggestions,
  testAIChat,
  
  // Audit Log APIs
  searchAuditLogs: async (params: AuditLogSearchParams) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/audit-logs?${queryParams.toString()}`);
    return response.data;
  },
  
  getUserActivityLogs: async (userId: string, limit: number = 100) => {
    const response = await apiClient.get(`/audit-logs/user/${userId}?limit=${limit}`);
    return response.data;
  },
  
  getResourceHistory: async (resourceType: string, resourceId: string, limit: number = 100) => {
    const response = await apiClient.get(`/audit-logs/resource/${resourceType}/${resourceId}?limit=${limit}`);
    return response.data;
  },
  
  getAuditLogStats: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/audit-logs/stats?${params.toString()}`);
    return response.data;
  },
  
  // Asset History
  getAssetHistory: async (assetId: string, filter?: string) => {
    const params = filter ? `?filter=${filter}` : '';
    const response = await apiClient.get(`/assets/${assetId}/history${params}`);
    return response.data;
  },
  
  // Asset Tag APIs
  addAssetTags: async (assetId: string, tags: string[]) => {
    const response = await apiClient.post(`/assets/${assetId}/tags`, { tags });
    return response.data;
  },
  
  removeAssetTag: async (assetId: string, tag: string) => {
    const response = await apiClient.delete(`/assets/${assetId}/tags/${tag}`);
    return response.data;
  },
  
  getAllTags: async () => {
    const response = await apiClient.get('/assets/tags');
    return response.data;
  },
  
  // Advanced Asset Search
  searchAssets: async (searchCriteria: any) => {
    const response = await apiClient.post('/assets/search', searchCriteria);
    return response.data;
  },
  
  getDepartments: async () => {
    const response = await apiClient.get('/assets/departments');
    return response.data;
  },
  
  getOwners: async () => {
    const response = await apiClient.get('/assets/owners');
    return response.data;
  },
};