/**
 * 数据验证工具
 * 确保发送到API的数据格式正确
 */

// 验证和格式化日期
export const validateDate = (dateInput) => {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }
  
  if (typeof dateInput === 'string') {
    // 检查是否是有效的日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(dateInput)) {
      return dateInput;
    }
    
    // 尝试解析其他格式的日期
    const parsedDate = new Date(dateInput);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }
  
  if (dateInput instanceof Date) {
    if (!isNaN(dateInput.getTime())) {
      return dateInput.toISOString().split('T')[0];
    }
  }
  
  // 如果无法解析，返回今天的日期
  return new Date().toISOString().split('T')[0];
};

// 验证和格式化时间
export const validateTime = (timeInput) => {
  if (!timeInput) {
    return new Date().toTimeString().slice(0, 5);
  }
  
  if (typeof timeInput === 'string') {
    // 检查是否是有效的时间格式 HH:MM
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(timeInput)) {
      return timeInput;
    }
  }
  
  // 如果无法解析，返回当前时间
  return new Date().toTimeString().slice(0, 5);
};

// 验证和格式化金额
export const validateAmount = (amountInput) => {
  if (amountInput === null || amountInput === undefined || amountInput === '') {
    throw new Error('金额不能为空');
  }
  
  const numValue = parseFloat(amountInput);
  
  if (isNaN(numValue)) {
    throw new Error('金额必须是有效数字');
  }
  
  if (numValue < 0) {
    throw new Error('金额不能为负数');
  }
  
  if (numValue > 999999) {
    throw new Error('金额不能超过999999');
  }
  
  // 保留两位小数
  return Math.round(numValue * 100) / 100;
};

// 验证和格式化持续时间（分钟）
export const validateDuration = (durationInput) => {
  if (durationInput === null || durationInput === undefined || durationInput === '') {
    return 60; // 默认60分钟
  }
  
  const numValue = parseInt(durationInput);
  
  if (isNaN(numValue)) {
    return 60; // 默认60分钟
  }
  
  if (numValue <= 0) {
    throw new Error('预计时长必须是正整数（分钟）');
  }
  
  if (numValue > 1440) { // 24小时 = 1440分钟
    throw new Error('预计时长不能超过24小时');
  }
  
  return numValue;
};

// 验证支出记录数据
export const validateExpenseData = (expenseData) => {
  const validated = {
    category: expenseData.category || '其他',
    amount: validateAmount(expenseData.amount),
    description: expenseData.description || '',
    date: validateDate(expenseData.date),
    time: validateTime(expenseData.time),
    location: expenseData.location || '',
    payment_method: expenseData.payment_method || '其他',
    notes: expenseData.notes || '',
    is_planned: Boolean(expenseData.is_planned)
  };
  
  return validated;
};

// 验证行程数据
export const validateItineraryData = (itineraryData) => {
  const validated = {
    date: validateDate(itineraryData.date),
    time: validateTime(itineraryData.time),
    activity: itineraryData.activity || '新活动',
    description: itineraryData.description || '',
    tips: itineraryData.tips || '',
    icon: itineraryData.icon || '📍', // 添加图标字段验证
    location: itineraryData.location || '',
    duration: validateDuration(itineraryData.duration),
    status: itineraryData.status || '计划中'
  };

  return validated;
};

// 验证清单数据
export const validateChecklistData = (checklistData) => {
  const validated = {
    item_name: checklistData.item_name || checklistData.item || '新物品',
    category: checklistData.category || '其他',
    priority: checklistData.priority || '中',
    is_completed: Boolean(checklistData.is_completed || checklistData.checked),
    notes: checklistData.notes || ''
  };

  return validated;
};

// 验证活动数据
export const validateActivityData = (activityData) => {
  const validated = {
    title: activityData.title || '新活动',
    category: activityData.category || '其他',
    description: activityData.description || '',
    location: activityData.location || '',
    estimated_cost: activityData.estimated_cost ? validateAmount(activityData.estimated_cost) : null,
    estimated_duration: activityData.estimated_duration ? validateDuration(activityData.estimated_duration) : null,
    priority: activityData.priority || '可选',
    season_suitable: activityData.season_suitable || '',
    tips: activityData.tips || '',
    contact_info: activityData.contact_info || '',
    opening_hours: activityData.opening_hours || ''
  };

  // 验证必需字段
  if (!validated.title || validated.title.trim() === '') {
    throw new Error('活动标题不能为空');
  }

  // 验证分类
  const validCategories = ['景点游览', '美食体验', '文化活动', '休闲娱乐', '购物', '交通', '住宿', '其他'];
  if (!validCategories.includes(validated.category)) {
    validated.category = '其他';
  }

  // 验证优先级
  const validPriorities = ['必去', '推荐', '可选'];
  if (!validPriorities.includes(validated.priority)) {
    validated.priority = '可选';
  }

  // 验证字符串长度
  if (validated.title.length > 200) {
    validated.title = validated.title.substring(0, 200);
  }
  if (validated.description && validated.description.length > 2000) {
    validated.description = validated.description.substring(0, 2000);
  }
  if (validated.location && validated.location.length > 200) {
    validated.location = validated.location.substring(0, 200);
  }
  if (validated.season_suitable && validated.season_suitable.length > 100) {
    validated.season_suitable = validated.season_suitable.substring(0, 100);
  }
  if (validated.tips && validated.tips.length > 2000) {
    validated.tips = validated.tips.substring(0, 2000);
  }
  if (validated.contact_info && validated.contact_info.length > 200) {
    validated.contact_info = validated.contact_info.substring(0, 200);
  }
  if (validated.opening_hours && validated.opening_hours.length > 100) {
    validated.opening_hours = validated.opening_hours.substring(0, 100);
  }

  return validated;
};

// 验证预算数据
export const validateBudgetData = (budgetData) => {
  const validated = {
    category: budgetData.category || '其他',
    item_name: budgetData.item_name || budgetData.item || '新项目',
    min_amount: validateAmount(budgetData.min_amount || 0),
    max_amount: validateAmount(budgetData.max_amount || 0),
    recommended_amount: validateAmount(budgetData.recommended_amount || 0),
    unit: budgetData.unit || '元',
    description: budgetData.description || '',
    tips: budgetData.tips || '',
    is_essential: Boolean(budgetData.is_essential)
  };
  
  // 确保最大金额不小于最小金额
  if (validated.max_amount < validated.min_amount) {
    validated.max_amount = validated.min_amount;
  }
  
  // 确保推荐金额在最小和最大金额之间
  if (validated.recommended_amount < validated.min_amount) {
    validated.recommended_amount = validated.min_amount;
  }
  if (validated.recommended_amount > validated.max_amount) {
    validated.recommended_amount = validated.max_amount;
  }
  
  return validated;
};

// 通用数据清理函数
export const sanitizeData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

// 检查必需字段
export const checkRequiredFields = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`缺少必需字段: ${missing.join(', ')}`);
  }
  
  return true;
};

// 导出所有验证函数
export default {
  validateDate,
  validateTime,
  validateAmount,
  validateDuration,
  validateExpenseData,
  validateItineraryData,
  validateChecklistData,
  validateActivityData,
  validateBudgetData,
  sanitizeData,
  checkRequiredFields
};
