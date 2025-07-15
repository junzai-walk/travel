/**
 * Axios 统一配置文件
 * 提供统一的HTTP请求配置、拦截器和错误处理
 */

import axios from 'axios';

// 环境配置
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API 基础 URL 配置
const getBaseURL = () => {
  // 优先使用环境变量配置
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 回退到默认配置
  if (isDevelopment) {
    // 开发环境使用代理，避免跨域问题
    return '/api';
  } else {
    // 生产环境使用实际服务器地址
    const host = import.meta.env.VITE_SERVER_HOST || '175.178.87.16';
    const port = import.meta.env.VITE_SERVER_PORT || '30001';
    return `http://${host}:${port}/api`;
  }
};

// 创建主要的 axios 实例
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 15秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 创建用于外部API的 axios 实例（如天气API）
export const externalApiClient = axios.create({
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 请求拦截器 - 主要API
apiClient.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🚀 [${timestamp}] API请求: ${config.method?.toUpperCase()} ${config.url}`);
    
    // 添加请求时间戳
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 主要API
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`✅ [${timestamp}] API响应: ${response.config.url} - ${response.status} (${duration}ms)`);
    
    // 直接返回数据部分，简化组件中的使用
    return response.data;
  },
  (error) => {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] API响应错误:`, error);
    
    // 统一错误处理
    return handleApiError(error);
  }
);

// 请求拦截器 - 外部API
externalApiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 外部API请求: ${config.method?.toUpperCase()} ${config.url}`);
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    console.error('❌ 外部API请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 外部API
externalApiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`✅ 外部API响应: ${response.config.url} - ${response.status} (${duration}ms)`);
    return response.data;
  },
  (error) => {
    console.error('❌ 外部API响应错误:', error);
    return handleApiError(error);
  }
);

// 统一错误处理函数
const handleApiError = (error) => {
  let errorResponse = {
    status: 0,
    message: '未知错误',
    data: null,
    timestamp: new Date().toISOString()
  };

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    // 超时错误
    errorResponse = {
      status: 408,
      message: '请求超时，请检查网络连接',
      data: null,
      timestamp: new Date().toISOString()
    };
  } else if (error.code === 'ERR_NETWORK') {
    // 网络错误
    errorResponse = {
      status: 0,
      message: '无法连接到服务器，使用本地数据',
      data: null,
      timestamp: new Date().toISOString()
    };
  } else if (error.response) {
    // 服务器响应错误
    errorResponse = {
      status: error.response.status,
      message: error.response.data?.message || getStatusMessage(error.response.status),
      data: error.response.data,
      timestamp: new Date().toISOString()
    };
  } else if (error.request) {
    // 请求发送但没有响应
    errorResponse = {
      status: 0,
      message: '服务器无响应，请稍后重试',
      data: null,
      timestamp: new Date().toISOString()
    };
  } else {
    // 其他错误
    errorResponse = {
      status: 0,
      message: error.message || '请求失败',
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  return Promise.reject(errorResponse);
};

// 根据状态码获取友好的错误信息
const getStatusMessage = (status) => {
  const statusMessages = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '禁止访问',
    404: '请求的资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    409: '请求冲突',
    422: '请求参数验证失败',
    429: '请求过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  };
  
  return statusMessages[status] || `服务器错误 (${status})`;
};

// 导出便捷的请求方法
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// 导出外部API便捷方法
export const externalApi = {
  get: (url, config = {}) => externalApiClient.get(url, config),
  post: (url, data = {}, config = {}) => externalApiClient.post(url, data, config),
};

// 导出配置信息（用于调试）
export const getApiConfig = () => ({
  baseURL: getBaseURL(),
  isDevelopment,
  isProduction,
  timeout: apiClient.defaults.timeout,
});

// 健康检查方法
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error };
  }
};

export default apiClient;
