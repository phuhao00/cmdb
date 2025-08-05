import axios, { AxiosResponse } from 'axios';

// API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://cmdb-api:8081/api/v1';
const AI_API_BASE_URL = process.env.NEXT_PUBLIC_AI_API_BASE_URL || 'http://cmdb-api:8081/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 支持cookie认证
});

// 请求拦截器 - 添加认证token
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

// 响应拦截器 - 处理认证错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // 重定向到登录页面
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// AI API客户端
const aiApiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_AI_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// AI API请求拦截器
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

// 类型定义
export interface AssetData {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  department?: string;
  owner?: string;
  ipAddress?: string;
  tags?: string[];
  cost?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  criticality?: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AssetFilter {
  type?: string;
  status?: string;
  location?: string;
  department?: string;
  owner?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface AssetStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byLocation: Record<string, number>;
  byDepartment: Record<string, number>;
  totalCost: number;
  averageCost: number;
  criticalAssets: number;
  maintenanceDue: number;
}

export interface WorkflowData {
  id: string;
  type: string;
  status: string;
  assetId: string;
  assetName: string;
  requesterId: string;
  requesterName: string;
  approverId?: string;
  approverName?: string;
  reason: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface WorkflowFilter {
  type?: string;
  status?: string;
  requesterId?: string;
  approverId?: string;
  page?: number;
  limit?: number;
}

export interface WorkflowStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
  averageProcessingTime: number;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserData;
}

export interface CreateAssetRequest {
  name: string;
  type: string;
  status: string;
  location: string;
  department?: string;
  owner?: string;
  ipAddress?: string;
  tags?: string[];
  cost?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  specifications?: Record<string, any>;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  id: string;
}

export interface CreateWorkflowRequest {
  type: string;
  assetId: string;
  reason: string;
  details?: Record<string, any>;
}

export interface ApproveWorkflowRequest {
  comment?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export interface AssetHistoryEntry {
  id: string;
  assetId: string;
  action: string;
  userId: string;
  userName: string;
  details: Record<string, any>;
  timestamp: string;
}

// API服务类
class ApiService {
  // 认证相关
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getCurrentUser(): Promise<UserData> {
    const response: AxiosResponse<UserData> = await apiClient.get('/auth/me');
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { oldPassword, newPassword });
  }

  // 用户管理
  async createUser(userData: Partial<UserData>): Promise<UserData> {
    const response: AxiosResponse<UserData> = await apiClient.post('/users', userData);
    return response.data;
  }

  async getUsers(): Promise<UserData[]> {
    const response: AxiosResponse<UserData[]> = await apiClient.get('/users');
    return response.data;
  }

  async getUser(id: string): Promise<UserData> {
    const response: AxiosResponse<UserData> = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await apiClient.put(`/users/${id}/status`, { status });
  }

  // 资产管理
  async fetchAssets(filter?: AssetFilter): Promise<AssetData[]> {
    const response: AxiosResponse<AssetData[]> = await apiClient.get('/assets', { params: filter });
    return response.data;
  }

  async fetchAssetById(id: string): Promise<AssetData> {
    const response: AxiosResponse<AssetData> = await apiClient.get(`/assets/${id}`);
    return response.data;
  }

  async createAsset(assetData: CreateAssetRequest): Promise<AssetData> {
    const response: AxiosResponse<AssetData> = await apiClient.post('/assets', assetData);
    return response.data;
  }

  async updateAsset(assetData: UpdateAssetRequest): Promise<AssetData> {
    const response: AxiosResponse<AssetData> = await apiClient.put(`/assets/${assetData.id}`, assetData);
    return response.data;
  }

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  }

  async fetchAssetStats(): Promise<AssetStats> {
    const response: AxiosResponse<AssetStats> = await apiClient.get('/assets/stats');
    return response.data;
  }

  async requestDecommission(id: string, reason: string): Promise<void> {
    await apiClient.put(`/assets/${id}`, { status: 'decommissioned', reason });
  }

  async exportAssets(format: string): Promise<Blob> {
    const response = await apiClient.get('/assets/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportAssetsCSV(): Promise<Blob> {
    const response = await apiClient.get('/assets/export', {
      params: { format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  }

  async importAssets(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<ImportResult> = await apiClient.post('/assets/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAssetHistory(id: string): Promise<AssetHistoryEntry[]> {
    const response: AxiosResponse<AssetHistoryEntry[]> = await apiClient.get(`/assets/${id}/history`);
    return response.data;
  }

  // 工作流管理
  async fetchWorkflows(filter?: WorkflowFilter): Promise<WorkflowData[]> {
    const response: AxiosResponse<WorkflowData[]> = await apiClient.get('/workflows', { params: filter });
    return response.data;
  }

  async fetchWorkflowById(id: string): Promise<WorkflowData> {
    const response: AxiosResponse<WorkflowData> = await apiClient.get(`/workflows/${id}`);
    return response.data;
  }

  async createWorkflow(workflowData: CreateWorkflowRequest): Promise<WorkflowData> {
    const response: AxiosResponse<WorkflowData> = await apiClient.post('/workflows', workflowData);
    return response.data;
  }

  async approveWorkflow(id: string, comment?: string): Promise<void> {
    await apiClient.put(`/workflows/${id}/approve`, { comment });
  }

  async rejectWorkflow(id: string, comment?: string): Promise<void> {
    await apiClient.put(`/workflows/${id}/reject`, { comment });
  }

  async fetchWorkflowStats(): Promise<WorkflowStats> {
    const response: AxiosResponse<WorkflowStats> = await apiClient.get('/workflows/stats');
    return response.data;
  }

  async fetchPendingWorkflows(): Promise<WorkflowData[]> {
    const response: AxiosResponse<WorkflowData[]> = await apiClient.get('/workflows', {
      params: { status: 'pending' }
    });
    return response.data;
  }

  // AI聊天
  async sendChatMessage(message: string, context?: string): Promise<string> {
    const response: AxiosResponse<{ response: string }> = await aiApiClient.post('/ai/chat', {
      message,
      context,
    });
    return response.data.response;
  }

  // 飞书webhook
  async handleFeishuWebhook(data: any): Promise<void> {
    await apiClient.post('/feishu/webhook', data);
  }

  // 系统设置
  async getSystemSettings(): Promise<any> {
    const response = await apiClient.get('/settings');
    return response.data;
  }

  async updateSystemSettings(settings: any): Promise<void> {
    await apiClient.put('/settings', settings);
  }

  // 报告相关
  async generateReport(type: string, filters?: any): Promise<Blob> {
    const response = await apiClient.get(`/reports/${type}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  // 搜索和过滤
  async searchAssets(query: string, filters?: AssetFilter): Promise<AssetData[]> {
    const response: AxiosResponse<AssetData[]> = await apiClient.post('/assets/search', {
      query,
      filters,
    });
    return response.data;
  }
  
  async getAssetTypes(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get('/assets/types');
    return response.data;
  }
  
  async getAssetLocations(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get('/assets/locations');
    return response.data;
  }
  
  async getDepartments(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get('/assets/departments');
    return response.data;
  }
  
  async getOwners(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get('/assets/owners');
    return response.data;
  }
  
  async getAllTags(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get('/assets/tags');
    return response.data;
  }

  async addTags(assetId: string, tags: string[]): Promise<void> {
    await apiClient.post(`/assets/${assetId}/tags`, { tags });
  }

  async removeTag(assetId: string, tag: string): Promise<void> {
    await apiClient.delete(`/assets/${assetId}/tags/${tag}`);
  }
}

// 创建API服务实例
export const apiService = new ApiService();

// 向后兼容的别名
export const getAssets = apiService.fetchAssets.bind(apiService);
export const getAsset = apiService.fetchAssetById.bind(apiService);
export const getAssetStats = apiService.fetchAssetStats.bind(apiService);
export const createAsset = apiService.createAsset.bind(apiService);
export const updateAsset = apiService.updateAsset.bind(apiService);
export const deleteAsset = apiService.deleteAsset.bind(apiService);
export const exportAssets = apiService.exportAssets.bind(apiService);
export const exportAssetsCSV = apiService.exportAssetsCSV.bind(apiService);
export const importAssets = apiService.importAssets.bind(apiService);
export const getAssetHistory = apiService.getAssetHistory.bind(apiService);

export const getWorkflows = apiService.fetchWorkflows.bind(apiService);
export const getWorkflow = apiService.fetchWorkflowById.bind(apiService);
export const getWorkflowStats = apiService.fetchWorkflowStats.bind(apiService);
export const getPendingWorkflows = apiService.fetchPendingWorkflows.bind(apiService);
export const createWorkflow = apiService.createWorkflow.bind(apiService);
export const approveWorkflow = apiService.approveWorkflow.bind(apiService);
export const rejectWorkflow = apiService.rejectWorkflow.bind(apiService);

export const login = apiService.login.bind(apiService);
export const logout = apiService.logout.bind(apiService);
export const getCurrentUser = apiService.getCurrentUser.bind(apiService);
export const changePassword = apiService.changePassword.bind(apiService);
export const createUser = apiService.createUser.bind(apiService);
export const getUsers = apiService.getUsers.bind(apiService);
export const getUser = apiService.getUser.bind(apiService);
export const updateUserStatus = apiService.updateUserStatus.bind(apiService);

export const sendChat = apiService.sendChatMessage.bind(apiService);
export const handleFeishuWebhook = apiService.handleFeishuWebhook.bind(apiService);

export const getSystemSettings = apiService.getSystemSettings.bind(apiService);
export const updateSystemSettings = apiService.updateSystemSettings.bind(apiService);

export const generateReport = apiService.generateReport.bind(apiService);
export const searchAssets = apiService.searchAssets.bind(apiService);
export const getAssetTypes = apiService.getAssetTypes.bind(apiService);
export const getAssetLocations = apiService.getAssetLocations.bind(apiService);
export const getDepartments = apiService.getDepartments.bind(apiService);
export const getOwners = apiService.getOwners.bind(apiService);
export const getAllTags = apiService.getAllTags.bind(apiService);
export const addTags = apiService.addTags.bind(apiService);
export const removeTag = apiService.removeTag.bind(apiService);

export default apiService;