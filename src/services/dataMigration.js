/**
 * 数据迁移服务
 * 将localStorage中的数据迁移到后端API
 */

import { itineraryService, transformFrontendToBackend } from './itineraryService.js';
import { itineraryAPI } from './api.js';

// 迁移状态常量
export const MIGRATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// 检查是否需要迁移
export const needsMigration = () => {
  // 检查localStorage中是否有行程数据
  const localItinerary = localStorage.getItem('xuzhou-travel-itinerary');
  
  // 检查是否已经迁移过
  const migrationStatus = localStorage.getItem('xuzhou-migration-status');
  
  return localItinerary && migrationStatus !== MIGRATION_STATUS.COMPLETED;
};

// 获取localStorage中的行程数据
export const getLocalItineraryData = () => {
  try {
    const localData = localStorage.getItem('xuzhou-travel-itinerary');
    if (localData) {
      return JSON.parse(localData);
    }
    return null;
  } catch (error) {
    console.error('读取本地行程数据失败:', error);
    return null;
  }
};

// 备份localStorage数据
export const backupLocalData = () => {
  try {
    const timestamp = new Date().toISOString();
    const backupData = {
      timestamp,
      itinerary: getLocalItineraryData(),
      budget: localStorage.getItem('xuzhou-travel-budget'),
      actualExpense: localStorage.getItem('xuzhou-travel-actual-expense')
    };
    
    localStorage.setItem('xuzhou-data-backup', JSON.stringify(backupData));
    console.log('本地数据备份完成:', timestamp);
    return true;
  } catch (error) {
    console.error('备份本地数据失败:', error);
    return false;
  }
};

// 迁移行程数据
export const migrateItineraryData = async (onProgress = null) => {
  try {
    // 设置迁移状态
    localStorage.setItem('xuzhou-migration-status', MIGRATION_STATUS.IN_PROGRESS);
    
    if (onProgress) onProgress('开始迁移行程数据...', 10);
    
    // 获取本地数据
    const localData = getLocalItineraryData();
    if (!localData || !Array.isArray(localData)) {
      throw new Error('没有找到有效的本地行程数据');
    }
    
    if (onProgress) onProgress('解析本地数据...', 20);
    
    // 转换数据格式
    const backendData = transformFrontendToBackend(localData);
    
    if (onProgress) onProgress('上传数据到服务器...', 40);
    
    // 批量创建行程项
    const results = [];
    const total = backendData.length;
    
    for (let i = 0; i < backendData.length; i++) {
      const item = backendData[i];
      try {
        // 直接使用itineraryAPI创建，而不是addActivity
        const result = await itineraryAPI.create({
          date: item.date,
          time: item.time,
          activity: item.activity,
          description: item.description,
          tips: item.tips,
          location: item.location,
          duration: item.duration,
          status: item.status
        });
        results.push(result);

        if (onProgress) {
          const progress = 40 + Math.floor((i + 1) / total * 50);
          onProgress(`上传进度: ${i + 1}/${total}`, progress);
        }
      } catch (error) {
        console.error(`迁移第${i + 1}项失败:`, error);
        // 继续迁移其他项
      }
    }
    
    if (onProgress) onProgress('迁移完成，清理本地数据...', 95);
    
    // 迁移成功，标记状态
    localStorage.setItem('xuzhou-migration-status', MIGRATION_STATUS.COMPLETED);
    localStorage.setItem('xuzhou-migration-date', new Date().toISOString());
    
    if (onProgress) onProgress('迁移完成！', 100);
    
    return {
      success: true,
      migratedCount: results.length,
      totalCount: backendData.length,
      results
    };
    
  } catch (error) {
    console.error('迁移失败:', error);
    localStorage.setItem('xuzhou-migration-status', MIGRATION_STATUS.FAILED);
    localStorage.setItem('xuzhou-migration-error', error.message);
    
    if (onProgress) onProgress(`迁移失败: ${error.message}`, 0);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// 清理本地数据（迁移成功后）
export const cleanupLocalData = () => {
  try {
    // 只清理行程数据，保留其他数据
    localStorage.removeItem('xuzhou-travel-itinerary');
    console.log('本地行程数据清理完成');
    return true;
  } catch (error) {
    console.error('清理本地数据失败:', error);
    return false;
  }
};

// 恢复本地数据（迁移失败时）
export const restoreLocalData = () => {
  try {
    const backupData = localStorage.getItem('xuzhou-data-backup');
    if (backupData) {
      const backup = JSON.parse(backupData);
      
      if (backup.itinerary) {
        localStorage.setItem('xuzhou-travel-itinerary', backup.itinerary);
      }
      if (backup.budget) {
        localStorage.setItem('xuzhou-travel-budget', backup.budget);
      }
      if (backup.actualExpense) {
        localStorage.setItem('xuzhou-travel-actual-expense', backup.actualExpense);
      }
      
      console.log('本地数据恢复完成');
      return true;
    }
    return false;
  } catch (error) {
    console.error('恢复本地数据失败:', error);
    return false;
  }
};

// 重置迁移状态
export const resetMigrationStatus = () => {
  localStorage.removeItem('xuzhou-migration-status');
  localStorage.removeItem('xuzhou-migration-date');
  localStorage.removeItem('xuzhou-migration-error');
  console.log('迁移状态已重置');
};

// 获取迁移状态
export const getMigrationStatus = () => {
  return {
    status: localStorage.getItem('xuzhou-migration-status') || MIGRATION_STATUS.NOT_STARTED,
    date: localStorage.getItem('xuzhou-migration-date'),
    error: localStorage.getItem('xuzhou-migration-error')
  };
};

// 完整的迁移流程
export const performMigration = async (onProgress = null) => {
  try {
    if (onProgress) onProgress('检查迁移条件...', 0);
    
    // 检查是否需要迁移
    if (!needsMigration()) {
      if (onProgress) onProgress('无需迁移', 100);
      return { success: true, message: '无需迁移' };
    }
    
    if (onProgress) onProgress('备份本地数据...', 5);
    
    // 备份本地数据
    const backupSuccess = backupLocalData();
    if (!backupSuccess) {
      throw new Error('备份本地数据失败');
    }
    
    // 执行迁移
    const migrationResult = await migrateItineraryData(onProgress);
    
    if (migrationResult.success) {
      // 迁移成功，可选择性清理本地数据
      // cleanupLocalData(); // 暂时保留本地数据作为备份
      return migrationResult;
    } else {
      // 迁移失败，恢复本地数据
      restoreLocalData();
      return migrationResult;
    }
    
  } catch (error) {
    console.error('迁移流程失败:', error);
    
    // 尝试恢复本地数据
    restoreLocalData();
    
    if (onProgress) onProgress(`迁移失败: ${error.message}`, 0);
    
    return {
      success: false,
      error: error.message
    };
  }
};
