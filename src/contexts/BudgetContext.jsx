import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/axiosConfig.js';

// 创建预算数据上下文
const BudgetContext = createContext();

// 自定义 Hook 用于使用预算上下文
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget 必须在 BudgetProvider 内部使用');
  }
  return context;
};

// 预算数据提供者组件
export const BudgetProvider = ({ children }) => {
  const [budgetData, setBudgetData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 金额格式化函数
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  // 计算总计金额
  const calculateTotalAmount = (data) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    setTotalAmount(total);
    return total;
  };

  // 从本地存储加载行程安排页面的预算数据
  const loadBudgetDataFromLocalStorage = () => {
    try {
      const storedData = localStorage.getItem('xuzhou-travel-budget');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // 转换行程安排页面的数据格式为首页格式
        const formattedData = parsedData.map(item => ({
          id: item.id,
          category: item.category,
          item_name: item.detail || item.category,
          amount: parseFloat(item.amount || 0),
          description: item.detail || item.category
        }));
        setBudgetData(formattedData);
        calculateTotalAmount(formattedData);
        console.log('成功从本地存储加载预算数据:', formattedData);
        console.log('原始数据:', parsedData);
        return true;
      }
    } catch (error) {
      console.error('从本地存储加载预算数据失败:', error);
    }
    return false;
  };

  // 从API加载预算数据
  const loadBudgetData = async () => {
    setIsLoading(true);
    setError(null);

    // 首先尝试从本地存储加载行程安排页面的数据
    const localDataLoaded = loadBudgetDataFromLocalStorage();
    if (localDataLoaded) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.get('/budget/reference');
      if (result.status === 'success' && result.data.items && result.data.items.length > 0) {
        // 转换API数据格式为前端格式，正确映射字段
        const formattedData = result.data.items.map(item => ({
          id: item.id,
          category: item.category,
          item_name: item.item_name,
          amount: parseFloat(item.recommended_amount || item.amount || 0), // 使用recommended_amount字段
          description: item.description || item.item_name || ''
        }));
        setBudgetData(formattedData);
        calculateTotalAmount(formattedData);
        console.log('成功从API加载预算数据:', formattedData);
      } else {
        console.log('API返回空数据，使用默认数据');
        // 如果没有数据，使用默认数据
        const defaultData = getDefaultBudgetData();
        setBudgetData(defaultData);
        calculateTotalAmount(defaultData);
      }
    } catch (error) {
      console.error('从API加载预算数据失败:', error);
      setError(error.message);
      // 回退到默认数据
      const defaultData = getDefaultBudgetData();
      setBudgetData(defaultData);
      calculateTotalAmount(defaultData);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取默认预算数据（与TravelPlan页面保持一致）
  const getDefaultBudgetData = () => [
    { id: 'transport', category: '交通费', item_name: 'G2700高铁¥290+K347火车¥205', amount: 495, description: 'G2700高铁¥290+K347火车¥205' },
    { id: 'accommodation', category: '住宿费', item_name: '季末轻居酒店两晚', amount: 498, description: '季末轻居酒店两晚 ¥249×2' },
    { id: 'food', category: '餐饮费', item_name: '三餐+小吃（两人）', amount: 300, description: '三餐+小吃（两人）' },
    { id: 'tickets', category: '门票费', item_name: '景点门票（两人）', amount: 100, description: '景点门票（两人）' },
    { id: 'localTransport', category: '市内交通', item_name: '地铁+公交+打车', amount: 50, description: '地铁+公交+打车' },
    { id: 'shopping', category: '购物费', item_name: '特产+纪念品', amount: 100, description: '特产+纪念品' }
  ];

  // 更新预算数据
  const updateBudgetData = (newData) => {
    setBudgetData(newData);
    calculateTotalAmount(newData);
  };

  // 添加预算项目
  const addBudgetItem = (item) => {
    const newData = [...budgetData, item];
    updateBudgetData(newData);
  };

  // 更新预算项目
  const updateBudgetItem = (itemId, updatedItem) => {
    const newData = budgetData.map(item => 
      item.id === itemId ? { ...item, ...updatedItem } : item
    );
    updateBudgetData(newData);
  };

  // 删除预算项目
  const deleteBudgetItem = (itemId) => {
    const newData = budgetData.filter(item => item.id !== itemId);
    updateBudgetData(newData);
  };

  // 监听本地存储变化，实现数据同步
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'xuzhou-travel-budget') {
        console.log('检测到预算数据变化，重新加载...');
        loadBudgetDataFromLocalStorage();
      }
    };

    // 监听storage事件（跨标签页）
    window.addEventListener('storage', handleStorageChange);

    // 监听自定义事件（同一页面内）
    const handleCustomStorageChange = () => {
      console.log('检测到同页面预算数据变化，重新加载...');
      loadBudgetDataFromLocalStorage();
    };

    window.addEventListener('budgetDataChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('budgetDataChanged', handleCustomStorageChange);
    };
  }, []);

  // 初始化时加载数据
  useEffect(() => {
    loadBudgetData();
  }, []);

  const contextValue = {
    budgetData,
    totalAmount,
    isLoading,
    error,
    formatAmount,
    loadBudgetData,
    updateBudgetData,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    calculateTotalAmount
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};

export default BudgetContext;
