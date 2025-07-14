/**
 * 徐州旅游指南 API 服务
 * 提供与后端 API 交互的方法
 * 已适配 MongoDB + Mongoose 后端
 */

// API 基础 URL
const API_BASE_URL = 'http://175.178.87.16:30001/api';

// 通用请求方法
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || '请求失败',
        data
      };
    }

    return data;
  } catch (error) {
    console.error('API 请求错误:', error);
    // 如果是网络错误，提供更友好的错误信息
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw {
        status: 0,
        message: '无法连接到服务器，请检查后端服务是否启动',
        data: null
      };
    }
    throw error;
  }
};

// ID 验证工具函数
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// 出行清单 API
export const checklistAPI = {
  // 获取所有清单项目
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/checklist?${queryParams}`);
  },
  
  // 获取指定清单项目
  getById: async (id) => {
    return request(`/checklist/${id}`);
  },
  
  // 创建新的清单项目
  create: async (data) => {
    return request('/checklist', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新指定清单项目
  update: async (id, data) => {
    return request(`/checklist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // 删除指定清单项目
  delete: async (id) => {
    return request(`/checklist/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 切换完成状态
  toggleStatus: async (id) => {
    return request(`/checklist/${id}/toggle`, {
      method: 'PATCH'
    });
  }
};

// 行程安排 API
export const itineraryAPI = {
  // 获取所有行程安排
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/itinerary?${queryParams}`);
  },
  
  // 获取指定行程安排
  getById: async (id) => {
    return request(`/itinerary/${id}`);
  },
  
  // 创建新的行程安排
  create: async (data) => {
    return request('/itinerary', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新指定行程安排（全量更新）
  update: async (id, data) => {
    return request(`/itinerary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 部分更新指定行程安排
  partialUpdate: async (id, data) => {
    return request(`/itinerary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // 删除指定行程安排
  delete: async (id) => {
    return request(`/itinerary/${id}`, {
      method: 'DELETE'
    });
  },

  // 更新行程状态
  updateStatus: async (id, status) => {
    return request(`/itinerary/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

// 活动规划 API
export const activitiesAPI = {
  // 获取所有活动规划
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/activities?${queryParams}`);
  },
  
  // 获取指定活动规划
  getById: async (id) => {
    return request(`/activities/${id}`);
  },
  
  // 创建新的活动规划
  create: async (data) => {
    return request('/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新指定活动规划
  update: async (id, data) => {
    return request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // 删除指定活动规划
  delete: async (id) => {
    return request(`/activities/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 获取活动分类统计
  getCategoryStats: async () => {
    return request('/activities/stats/categories');
  }
};

// 预算参考 API
export const budgetAPI = {
  // 获取所有预算参考
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/budget/reference?${queryParams}`);
  },
  
  // 获取指定预算参考
  getById: async (id) => {
    return request(`/budget/reference/${id}`);
  },
  
  // 创建新的预算参考
  create: async (data) => {
    return request('/budget/reference', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新指定预算参考
  update: async (id, data) => {
    return request(`/budget/reference/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // 删除指定预算参考
  delete: async (id) => {
    return request(`/budget/reference/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 获取预算分析数据
  getAnalysis: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/budget/analysis?${queryParams}`);
  },
  
  // 获取预算分类统计
  getCategoryStats: async () => {
    return request('/budget/stats/categories');
  }
};

// 实际支出 API
export const expensesAPI = {
  // 获取所有实际支出
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/expenses?${queryParams}`);
  },
  
  // 获取指定实际支出
  getById: async (id) => {
    return request(`/expenses/${id}`);
  },
  
  // 创建新的实际支出
  create: async (data) => {
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  // 更新指定实际支出
  update: async (id, data) => {
    return request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  // 删除指定实际支出
  delete: async (id) => {
    return request(`/expenses/${id}`, {
      method: 'DELETE'
    });
  },
  
  // 获取支出统计摘要
  getSummary: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return request(`/expenses/stats/summary?${queryParams}`);
  }
};

// 导出所有 API
export default {
  checklistAPI,
  itineraryAPI,
  activitiesAPI,
  budgetAPI,
  expensesAPI
};
