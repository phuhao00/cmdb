import axios from 'axios';

// API Configuration
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3000' : ''}/api/v1`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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
export const fetchWorkflows = (params = {}) => {
  return apiClient.get('/workflows', { params });
};

export const fetchWorkflowById = (id) => {
  return apiClient.get(`/workflows/${id}`);
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