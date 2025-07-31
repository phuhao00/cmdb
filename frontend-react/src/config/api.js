// API 配置文件
// 支持环境变量配置，支持开发、测试、生产环境

const getApiConfig = () => {
  // 检测运行环境
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDocker = window.location.hostname !== 'localhost';
  
  // 动态确定API地址
  let defaultApiBaseUrl, defaultAiApiBaseUrl;
  
  if (process.env.REACT_APP_API_BASE_URL) {
    // 如果明确配置了环境变量，使用环境变量
    defaultApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    defaultAiApiBaseUrl = process.env.REACT_APP_AI_API_BASE_URL;
  } else {
    // 根据运行环境自动判断
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '8081';
    
    defaultApiBaseUrl = `${protocol}//${hostname}:${port}/api/v1`;
    defaultAiApiBaseUrl = `${protocol}//${hostname}:${port}/api`;
  }

  return {
    // 通用API配置
    API_BASE_URL: defaultApiBaseUrl,
    AI_API_BASE_URL: defaultAiApiBaseUrl,
    
    // 超时配置
    API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
    AI_API_TIMEOUT: parseInt(process.env.REACT_APP_AI_API_TIMEOUT) || 30000,
    
    // 调试模式
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true' || isDevelopment,
    
    // 环境信息
    ENVIRONMENT: {
      isDevelopment,
      isDocker,
      nodeEnv: process.env.NODE_ENV,
    }
  };
};

export default getApiConfig();