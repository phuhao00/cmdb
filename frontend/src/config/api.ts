// API 配置文件
// 支持环境变量配置，支持开发、测试、生产环境

interface ApiConfig {
  API_BASE_URL: string;
  AI_API_BASE_URL: string;
  API_TIMEOUT: number;
  AI_API_TIMEOUT: number;
  DEBUG_MODE: boolean;
  ENVIRONMENT: {
    isDevelopment: boolean;
    isDocker: boolean;
    nodeEnv: string | undefined;
  };
}

const getApiConfig = (): ApiConfig => {
  // 检测运行环境
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDocker = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  
  // 动态确定API地址
  let defaultApiBaseUrl: string, defaultAiApiBaseUrl: string;
  
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    // 如果明确配置了环境变量，使用环境变量
    defaultApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    defaultAiApiBaseUrl = process.env.NEXT_PUBLIC_AI_API_BASE_URL || '/api';
  } else if (typeof window !== 'undefined') {
    // 根据运行环境自动判断 (仅在客户端运行)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '8081';
    
    defaultApiBaseUrl = `${protocol}//${hostname}:${port}/api`;
    defaultAiApiBaseUrl = `${protocol}//${hostname}:${port}/api`;
  } else {
    // 服务端默认值
    defaultApiBaseUrl = '/api';
    defaultAiApiBaseUrl = '/api';
  }

  return {
    // 通用API配置
    API_BASE_URL: defaultApiBaseUrl,
    AI_API_BASE_URL: defaultAiApiBaseUrl,
    
    // 超时配置
    API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    AI_API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_AI_API_TIMEOUT || '30000'),
    
    // 调试模式
    DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' || isDevelopment,
    
    // 环境信息
    ENVIRONMENT: {
      isDevelopment,
      isDocker,
      nodeEnv: process.env.NODE_ENV,
    }
  };
};

export default getApiConfig();