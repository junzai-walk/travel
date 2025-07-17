// 错误处理工具
// 提供统一的错误处理和用户友好的错误信息

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  UNKNOWN: 'unknown'
};

/**
 * 错误信息映射
 */
const ERROR_MESSAGES = {
  [ErrorTypes.VALIDATION]: '输入数据格式不正确',
  [ErrorTypes.NETWORK]: '网络连接失败，请检查网络设置',
  [ErrorTypes.SERVER]: '服务器错误，请稍后重试',
  [ErrorTypes.PERMISSION]: '权限不足，无法执行此操作',
  [ErrorTypes.NOT_FOUND]: '请求的资源不存在',
  [ErrorTypes.UNKNOWN]: '发生未知错误，请稍后重试'
};

/**
 * 解析错误类型
 * @param {Error|Object} error - 错误对象
 * @returns {string} - 错误类型
 */
export const getErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;

  // 网络错误
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return ErrorTypes.NETWORK;
  }

  // HTTP状态码错误
  if (error.response?.status) {
    const status = error.response.status;
    if (status >= 400 && status < 500) {
      if (status === 404) return ErrorTypes.NOT_FOUND;
      if (status === 403 || status === 401) return ErrorTypes.PERMISSION;
      return ErrorTypes.VALIDATION;
    }
    if (status >= 500) return ErrorTypes.SERVER;
  }

  // 验证错误
  if (error.name === 'ValidationError' || error.type === 'validation') {
    return ErrorTypes.VALIDATION;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * 获取用户友好的错误信息
 * @param {Error|Object} error - 错误对象
 * @returns {string} - 用户友好的错误信息
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES[ErrorTypes.UNKNOWN];

  // 如果有自定义错误信息，优先使用
  if (error.message && typeof error.message === 'string') {
    // 检查是否为API返回的错误信息
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // 检查是否为验证错误
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        return errors.map(err => err.msg || err.message || err).join('; ');
      }
    }

    return error.message;
  }

  // 使用默认错误信息
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType];
};

/**
 * 处理富文本相关错误
 * @param {Error|Object} error - 错误对象
 * @returns {Object} - 处理后的错误信息
 */
export const handleRichTextError = (error) => {
  const errorType = getErrorType(error);
  const message = getErrorMessage(error);

  return {
    type: errorType,
    message,
    isRetryable: errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.SERVER,
    suggestions: getSuggestions(errorType)
  };
};

/**
 * 获取错误处理建议
 * @param {string} errorType - 错误类型
 * @returns {Array} - 建议列表
 */
const getSuggestions = (errorType) => {
  switch (errorType) {
    case ErrorTypes.VALIDATION:
      return [
        '请检查输入内容的格式',
        '确保文本长度不超过限制',
        '移除不支持的格式或字符'
      ];
    case ErrorTypes.NETWORK:
      return [
        '检查网络连接',
        '稍后重试',
        '联系管理员'
      ];
    case ErrorTypes.SERVER:
      return [
        '稍后重试',
        '如果问题持续存在，请联系技术支持'
      ];
    case ErrorTypes.PERMISSION:
      return [
        '联系管理员获取权限',
        '确认登录状态'
      ];
    default:
      return ['稍后重试', '如果问题持续存在，请联系技术支持'];
  }
};

/**
 * 创建错误通知
 * @param {Error|Object} error - 错误对象
 * @param {Object} options - 选项
 * @returns {Object} - 通知对象
 */
export const createErrorNotification = (error, options = {}) => {
  const {
    title = '操作失败',
    duration = 5000,
    showSuggestions = true
  } = options;

  const errorInfo = handleRichTextError(error);

  return {
    title,
    message: errorInfo.message,
    type: 'error',
    duration,
    suggestions: showSuggestions ? errorInfo.suggestions : [],
    isRetryable: errorInfo.isRetryable
  };
};

/**
 * 日志记录错误
 * @param {Error|Object} error - 错误对象
 * @param {Object} context - 上下文信息
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: getErrorMessage(error),
    type: getErrorType(error),
    timestamp: new Date().toISOString(),
    context,
    stack: error.stack,
    userAgent: navigator.userAgent
  };

  // 在开发环境中输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // 在生产环境中可以发送到错误监控服务
  // 例如：Sentry, LogRocket 等
};

/**
 * 重试机制
 * @param {Function} fn - 要重试的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟（毫秒）
 * @returns {Promise} - 执行结果
 */
export const retryOperation = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试，或者错误不可重试，直接抛出
      if (i === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

/**
 * 判断错误是否可重试
 * @param {Error|Object} error - 错误对象
 * @returns {boolean} - 是否可重试
 */
const isRetryableError = (error) => {
  const errorType = getErrorType(error);
  return errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.SERVER;
};

/**
 * 创建错误边界组件的错误处理器
 * @param {Error} error - 错误对象
 * @param {Object} errorInfo - 错误信息
 */
export const handleComponentError = (error, errorInfo) => {
  const errorData = {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString()
  };

  logError(error, errorData);

  // 可以在这里添加错误上报逻辑
  return createErrorNotification(error, {
    title: '组件错误',
    duration: 0 // 不自动消失
  });
};
