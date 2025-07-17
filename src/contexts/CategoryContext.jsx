import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/axiosConfig.js';

// 创建分类管理上下文
const CategoryContext = createContext();

// 自定义 Hook 用于使用分类上下文
export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory 必须在 CategoryProvider 内部使用');
  }
  return context;
};

// 分类数据提供者组件
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取默认分类
  const getDefaultCategories = () => ['证件类', '衣物类', '电子设备', '洗护用品',  '日常用品', '财务类', '医疗用品', '食物类'];

  // 从API加载分类数据
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.get('/categories');
      if (result.status === 'success' && result.data.categories.length > 0) {
        setCategories(result.data.categories);
      } else {
        // 如果没有数据，使用默认分类
        const defaultCategories = getDefaultCategories();
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('从API加载分类数据失败:', error);
      // 如果是404错误（API端点不存在），直接使用默认分类，不显示错误
      if (error.status === 404) {
        console.log('分类API端点不存在，使用默认分类');
      } else {
        setError(error.message);
      }
      // 回退到默认分类
      setCategories(getDefaultCategories());
    } finally {
      setIsLoading(false);
    }
  };

  // 保存默认分类到后端
  const saveDefaultCategories = async (defaultCategories) => {
    try {
      for (const category of defaultCategories) {
        await api.post('/categories', { name: category });
      }
    } catch (error) {
      console.error('保存默认分类失败:', error);
    }
  };

  // 添加新分类
  const addCategory = async (categoryName) => {
    if (!categoryName || categoryName.trim() === '') {
      throw new Error('分类名称不能为空');
    }

    const trimmedName = categoryName.trim();

    // 检查分类是否已存在
    if (categories.includes(trimmedName)) {
      throw new Error('该分类已存在');
    }

    // 直接更新本地状态（因为后端API可能不存在）
    setCategories(prev => [...prev, trimmedName]);

    // 尝试保存到后端，但不阻塞用户操作
    try {
      await api.post('/categories', { name: trimmedName });
      console.log('分类已保存到后端');
    } catch (error) {
      console.log('后端保存失败，仅保存到本地:', error.message);
    }

    return trimmedName;
  };

  // 删除分类
  const deleteCategory = async (categoryName) => {
    if (!categoryName) {
      throw new Error('分类名称不能为空');
    }

    // 检查是否为默认分类（不允许删除）
    const defaultCategories = getDefaultCategories();
    if (defaultCategories.includes(categoryName)) {
      throw new Error('不能删除系统默认分类');
    }

    // 直接更新本地状态
    setCategories(prev => prev.filter(cat => cat !== categoryName));

    // 尝试从后端删除，但不阻塞用户操作
    try {
      await api.delete(`/categories/${encodeURIComponent(categoryName)}`);
      console.log('分类已从后端删除');
    } catch (error) {
      console.log('后端删除失败，仅从本地删除:', error.message);
    }

    return true;
  };

  // 重命名分类
  const renameCategory = async (oldName, newName) => {
    if (!oldName || !newName || newName.trim() === '') {
      throw new Error('分类名称不能为空');
    }

    const trimmedNewName = newName.trim();
    
    // 检查新名称是否已存在
    if (categories.includes(trimmedNewName) && oldName !== trimmedNewName) {
      throw new Error('该分类名称已存在');
    }

    // 检查是否为默认分类（不允许重命名）
    const defaultCategories = getDefaultCategories();
    if (defaultCategories.includes(oldName)) {
      throw new Error('不能重命名系统默认分类');
    }

    try {
      const result = await api.put(`/categories/${encodeURIComponent(oldName)}`, { 
        name: trimmedNewName 
      });
      if (result.status === 'success') {
        // 更新本地状态
        setCategories(prev => prev.map(cat => cat === oldName ? trimmedNewName : cat));
        return trimmedNewName;
      } else {
        throw new Error('重命名分类失败');
      }
    } catch (error) {
      console.error('重命名分类失败:', error);
      // 如果API调用失败，仍然更新本地状态（离线模式）
      setCategories(prev => prev.map(cat => cat === oldName ? trimmedNewName : cat));
      return trimmedNewName;
    }
  };

  // 检查分类是否为默认分类
  const isDefaultCategory = (categoryName) => {
    return getDefaultCategories().includes(categoryName);
  };

  // 初始化时加载数据
  useEffect(() => {
    loadCategories();
  }, []);

  const contextValue = {
    categories,
    isLoading,
    error,
    loadCategories,
    addCategory,
    deleteCategory,
    renameCategory,
    isDefaultCategory,
    getDefaultCategories
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
