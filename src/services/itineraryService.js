/**
 * 行程安排数据转换服务
 * 处理前端嵌套结构与后端扁平结构之间的转换
 */

import { itineraryAPI } from './api.js';
import { validateItineraryData } from '../utils/dataValidation.js';

// 默认图标映射
const DEFAULT_ICONS = {
  '交通': '🚄',
  '住宿': '🏨',
  '餐饮': '🍜',
  '景点': '🌊',
  '购物': '🛍️',
  '娱乐': '🎮',
  '其他': '📍'
};

// 根据活动内容推断图标
const inferIcon = (activity) => {
  const activityLower = activity.toLowerCase();
  
  if (activityLower.includes('高铁') || activityLower.includes('火车') || activityLower.includes('地铁') || activityLower.includes('公交')) {
    return '🚄';
  }
  if (activityLower.includes('酒店') || activityLower.includes('入住') || activityLower.includes('退房')) {
    return '🏨';
  }
  if (activityLower.includes('早餐') || activityLower.includes('午餐') || activityLower.includes('晚餐') || activityLower.includes('觅食')) {
    return '🍜';
  }
  if (activityLower.includes('湖') || activityLower.includes('园') || activityLower.includes('博物馆') || activityLower.includes('景区')) {
    return '🌊';
  }
  if (activityLower.includes('购买') || activityLower.includes('特产') || activityLower.includes('购物')) {
    return '🛍️';
  }
  
  return '📍';
};

// 将后端数据转换为前端格式
export const transformBackendToFrontend = (backendData) => {
  if (!backendData || !Array.isArray(backendData)) {
    return [];
  }

  // 按日期分组
  const groupedByDate = backendData.reduce((acc, item) => {
    const dateKey = item.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {});

  // 转换为前端格式
  const frontendData = Object.keys(groupedByDate)
    .sort()
    .map((dateKey, index) => {
      const activities = groupedByDate[dateKey]
        .sort((a, b) => {
          // 首先按时间排序，然后按创建时间排序（保持添加顺序）
          const timeCompare = a.time.localeCompare(b.time);
          if (timeCompare !== 0) {
            return timeCompare;
          }
          // 如果时间相同，按创建时间排序（新添加的在后面）
          if (a.created_at && b.created_at) {
            return new Date(a.created_at) - new Date(b.created_at);
          }
          // 如果没有创建时间，按ID排序（新的ID通常更大）
          return (a.id || 0) - (b.id || 0);
        })
        .map(item => ({
          id: item.id, // 保存后端ID用于更新和删除
          time: item.time,
          activity: item.activity,
          description: item.description || '',
          tips: item.tips || '',
          icon: inferIcon(item.activity),
          location: item.location || '',
          duration: item.duration || null,
          status: item.status || '计划中',
          originalDate: item.date // 保存原始日期信息
        }));

      // 生成日期标题
      const date = new Date(dateKey);
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dayName = dayNames[date.getDay()];
      const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;

      return {
        day: dayName,
        date: monthDay,
        title: `第${index + 1}天 - ${dayName}`,
        originalDate: dateKey, // 保存原始日期信息
        activities
      };
    });

  return frontendData;
};

// 将前端数据转换为后端格式
export const transformFrontendToBackend = (frontendData, preserveOriginalDates = true) => {
  if (!frontendData || !Array.isArray(frontendData)) {
    return [];
  }

  const backendData = [];

  frontendData.forEach((day, dayIndex) => {
    if (!day.activities || !Array.isArray(day.activities)) {
      return;
    }

    // 获取日期字符串
    let dateString;

    if (preserveOriginalDates && day.originalDate) {
      // 如果有原始日期信息，使用原始日期
      dateString = day.originalDate;
    } else if (preserveOriginalDates && day.activities.length > 0 && day.activities[0].originalDate) {
      // 如果活动中有原始日期信息，使用第一个活动的原始日期
      dateString = day.activities[0].originalDate;
    } else {
      // 回退到计算日期（用于新创建的行程）
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayIndex);
      dateString = baseDate.toISOString().split('T')[0];
    }

    day.activities.forEach(activity => {
      // 使用数据验证工具确保数据格式正确
      const rawData = {
        date: activity.originalDate || dateString, // 优先使用活动的原始日期
        time: activity.time,
        activity: activity.activity,
        description: activity.description || '',
        tips: activity.tips || '',
        location: activity.location || '',
        duration: activity.duration, // 让验证工具处理null值
        status: activity.status || '计划中'
      };

      // 验证并格式化数据
      const backendItem = validateItineraryData(rawData);

      // 如果有ID，说明是更新操作
      if (activity.id) {
        backendItem.id = activity.id;
      }

      backendData.push(backendItem);
    });
  });

  return backendData;
};

// 行程安排服务类
export class ItineraryService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  // 获取所有行程安排（前端格式）
  async getAll(forceRefresh = false) {
    try {
      // 检查缓存
      if (!forceRefresh && this.cache && this.lastFetch && 
          (Date.now() - this.lastFetch < this.cacheTimeout)) {
        return this.cache;
      }

      const response = await itineraryAPI.getAll();
      const backendData = response.data?.items || response.data || [];
      const frontendData = transformBackendToFrontend(backendData);
      
      // 更新缓存
      this.cache = frontendData;
      this.lastFetch = Date.now();
      
      return frontendData;
    } catch (error) {
      console.error('获取行程安排失败:', error);
      throw error;
    }
  }

  // 保存整个行程安排
  async saveAll(frontendData) {
    try {
      const backendData = transformFrontendToBackend(frontendData, true); // 保持原始日期
      
      // 获取现有数据用于比较
      const existingResponse = await itineraryAPI.getAll();
      const existingData = existingResponse.data?.items || existingResponse.data || [];
      const existingIds = new Set(existingData.map(item => item.id));
      
      const results = [];
      
      // 处理每个行程项
      for (const item of backendData) {
        if (item.id && existingIds.has(item.id)) {
          // 查找现有项进行比较
          const existingItem = existingData.find(existing => existing.id === item.id);

          if (existingItem) {
            // 检测变化的字段
            const changedFields = {};
            const fieldsToCheck = ['date', 'time', 'activity', 'description', 'tips', 'location', 'duration', 'status'];

            fieldsToCheck.forEach(field => {
              if (item[field] !== existingItem[field]) {
                changedFields[field] = item[field];
              }
            });

            // 只有当有字段变化时才更新
            if (Object.keys(changedFields).length > 0) {
              const result = await itineraryAPI.partialUpdate(item.id, changedFields);
              results.push(result);
            }
          } else {
            // 如果找不到现有项，使用全量更新作为备用
            const result = await itineraryAPI.update(item.id, item);
            results.push(result);
          }
        } else {
          // 创建新项
          const result = await itineraryAPI.create(item);
          results.push(result);
        }
      }
      
      // 删除不再存在的项
      const newIds = new Set(backendData.filter(item => item.id).map(item => item.id));
      for (const existingId of existingIds) {
        if (!newIds.has(existingId)) {
          await itineraryAPI.delete(existingId);
        }
      }
      
      // 清除缓存
      this.cache = null;
      this.lastFetch = null;
      
      return results;
    } catch (error) {
      console.error('保存行程安排失败:', error);
      throw error;
    }
  }

  // 添加新活动
  async addActivity(dayIndex, activity) {
    try {
      // 计算日期
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayIndex);
      const dateString = baseDate.toISOString().split('T')[0];

      const backendItem = {
        date: dateString,
        time: activity.time,
        activity: activity.activity,
        description: activity.description || '',
        tips: activity.tips || '',
        location: activity.location || '',
        duration: activity.duration || null,
        status: activity.status || '计划中'
      };

      const result = await itineraryAPI.create(backendItem);
      
      // 清除缓存
      this.cache = null;
      this.lastFetch = null;
      
      return result;
    } catch (error) {
      console.error('添加活动失败:', error);
      throw error;
    }
  }

  // 更新活动
  async updateActivity(activityId, updates) {
    try {
      const result = await itineraryAPI.update(activityId, updates);
      
      // 清除缓存
      this.cache = null;
      this.lastFetch = null;
      
      return result;
    } catch (error) {
      console.error('更新活动失败:', error);
      throw error;
    }
  }

  // 删除活动
  async deleteActivity(activityId) {
    try {
      const result = await itineraryAPI.delete(activityId);
      
      // 清除缓存
      this.cache = null;
      this.lastFetch = null;
      
      return result;
    } catch (error) {
      console.error('删除活动失败:', error);
      throw error;
    }
  }

  // 清除缓存
  clearCache() {
    this.cache = null;
    this.lastFetch = null;
  }
}

// 创建单例实例
export const itineraryService = new ItineraryService();
