import React, { useState, useEffect } from 'react';
import './TravelPlan.css';
import { itineraryService } from '../services/itineraryService.js';
import { performMigration, needsMigration, getMigrationStatus } from '../services/dataMigration.js';
import { api, healthCheck } from '../utils/axiosConfig.js';
import { validateExpenseData, validateItineraryData } from '../utils/dataValidation.js';
import RichTextEditor from './RichTextEditor.jsx';

const TravelPlan = () => {
  // 默认预算数据
  const defaultBudgetData = [
    { id: 'transport', category: '交通费', amount: 495, detail: 'G2700高铁¥290+K347火车¥205', editable: true },
    { id: 'accommodation', category: '住宿费', amount: 498, detail: '季末轻居酒店两晚 ¥249×2', editable: true },
    { id: 'food', category: '餐饮费', amount: 300, detail: '三餐+小吃（两人）', editable: true },
    { id: 'tickets', category: '门票费', amount: 100, detail: '景点门票（两人）', editable: true },
    { id: 'localTransport', category: '市内交通', amount: 50, detail: '地铁+公交+打车', editable: true },
    { id: 'shopping', category: '购物费', amount: 100, detail: '特产+纪念品', editable: true }
  ];

  // 状态管理
  const [budgetData, setBudgetData] = useState(defaultBudgetData);
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 预算备注编辑相关状态
  const [editingBudgetDetail, setEditingBudgetDetail] = useState(null);
  const [editingBudgetDetailValue, setEditingBudgetDetailValue] = useState('');

  // 新增预算项目相关状态
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [newBudgetItem, setNewBudgetItem] = useState({
    category: '',
    item_name: '',
    min_amount: '',
    max_amount: '',
    recommended_amount: '',
    unit: '元',
    description: '',
    tips: ''
  });

  // 实际消费支出相关状态
  const [actualExpenseData, setActualExpenseData] = useState([]);
  const [editingActualExpense, setEditingActualExpense] = useState(null);
  const [editingActualExpenseValue, setEditingActualExpenseValue] = useState('');

  // 新增支出记录相关状态
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [newExpenseItem, setNewExpenseItem] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    payment_method: '其他',
    notes: ''
  });

  // 实际消费详细说明编辑相关状态
  const [editingActualExpenseDetail, setEditingActualExpenseDetail] = useState(null);
  const [editingActualExpenseDetailValue, setEditingActualExpenseDetailValue] = useState('');

  // 行程编辑相关状态
  const [editingActivity, setEditingActivity] = useState(null); // 格式: {dayIndex, actIndex, field}
  const [editingActivityValue, setEditingActivityValue] = useState('');
  const [itineraryData, setItineraryData] = useState([]);

  // API相关状态
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ message: '', progress: 0 });

  // 标题编辑相关状态
  const [editingTitle, setEditingTitle] = useState(null); // 格式: {dayIndex, field} field可以是'day', 'date', 'title'
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // 富文本编辑相关状态
  const [selectedText, setSelectedText] = useState('');
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({ start: 0, end: 0 });
  const [isSelectionBold, setIsSelectionBold] = useState(false);



  // 加载数据
  useEffect(() => {
    loadAllData();
  }, []);

  // 检查网络连接
  const checkConnection = async () => {
    try {
      const result = await healthCheck();
      return result.success;
    } catch (error) {
      console.error('健康检查失败:', error);
      return false;
    }
  };

  // 加载所有数据
  const loadAllData = async () => {
    setIsLoading(true);
    setApiError('');

    try {
      // 检查网络连接
      const isConnected = await checkConnection();

      if (!isConnected) {
        setApiError('无法连接到服务器，使用本地数据');
        loadLocalData();
        loadBudgetData();
        loadActualExpenseData();
        return;
      }

      // 检查是否需要迁移
      if (needsMigration()) {
        setMigrationStatus(getMigrationStatus());
        setShowMigrationDialog(true);
        // 暂时加载本地数据
        loadLocalData();
      } else {
        // 从API加载行程数据
        await loadItineraryFromAPI();
      }

      // 加载其他数据
      await loadBudgetDataFromAPI();
      await loadActualExpenseDataFromAPI();

    } catch (error) {
      console.error('加载数据失败:', error);
      setApiError(error.message || '加载数据失败，使用本地数据');
      // 回退到本地数据
      loadLocalData();
      loadBudgetData();
      loadActualExpenseData();
    } finally {
      setIsLoading(false);
    }
  };

  // 从API加载行程数据
  const loadItineraryFromAPI = async () => {
    try {
      const data = await itineraryService.getAll();

      // 如果API返回空数据，检查是否需要使用种子数据
      if (!data || data.length === 0) {
        console.log('API返回空数据，使用默认行程数据');
        const defaultData = getDefaultItinerary();

        // 尝试将默认数据保存到API（使用未来日期）
        try {
          await itineraryService.saveAll(defaultData);
          console.log('默认数据已保存到API');
          setItineraryData(defaultData);
        } catch (saveError) {
          console.warn('保存默认数据到API失败，使用本地数据:', saveError);
          setItineraryData(defaultData);
        }
      } else {
        setItineraryData(data);
      }
    } catch (error) {
      console.error('从API加载行程数据失败:', error);
      throw error;
    }
  };

  // 加载本地数据（备用方案）
  const loadLocalData = () => {
    const savedItinerary = localStorage.getItem('xuzhou-travel-itinerary');
    if (savedItinerary) {
      try {
        const parsedItinerary = JSON.parse(savedItinerary);
        setItineraryData(parsedItinerary);
      } catch (error) {
        console.error('Error loading local itinerary data:', error);
        setItineraryData(getDefaultItinerary());
      }
    } else {
      setItineraryData(getDefaultItinerary());
    }
  };

  // 从API加载预算数据
  const loadBudgetDataFromAPI = async () => {
    try {
      const result = await api.get('/budget');
      if (result.status === 'success' && result.data.items.length > 0) {
        // 转换API数据格式为前端格式
        const formattedData = result.data.items.map(item => ({
          id: item.id,
          category: item.category,
          amount: parseFloat(item.recommended_amount || 0),
          detail: item.description || item.item_name,
          editable: true,
          min_amount: parseFloat(item.min_amount || 0),
          max_amount: parseFloat(item.max_amount || 0),
          unit: item.unit || '元',
          tips: item.tips || ''
        }));
        setBudgetData(formattedData);
      } else {
        setBudgetData(defaultBudgetData);
      }
    } catch (error) {
      console.error('从API加载预算数据失败:', error);
      loadBudgetData(); // 回退到本地数据
    }
  };

  // 创建新的预算参考项目
  const createBudgetItem = async (budgetData) => {
    try {
      const result = await api.post('/budget/reference', {
        category: budgetData.category,
        item_name: budgetData.item_name,
        min_amount: budgetData.min_amount,
        max_amount: budgetData.max_amount,
        recommended_amount: budgetData.recommended_amount,
        unit: budgetData.unit || '元',
        description: budgetData.description,
        tips: budgetData.tips,
        is_essential: budgetData.is_essential || true
      });

      if (result.status === 'success') {
        await loadBudgetDataFromAPI(); // 重新加载数据
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
        return result.data;
      } else {
        throw new Error('创建预算项目失败');
      }
    } catch (error) {
      console.error('创建预算项目失败:', error);
      setErrorMessage(error.message || '创建预算项目失败，请重试');
      throw error;
    }
  };

  // 更新预算参考项目
  const updateBudgetItem = async (itemId, budgetData) => {
    try {
      const result = await api.put(`/budget/reference/${itemId}`, budgetData);

      if (result.status === 'success') {
        await loadBudgetDataFromAPI(); // 重新加载数据
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
        return result.data;
      } else {
        throw new Error('更新预算项目失败');
      }
    } catch (error) {
      console.error('更新预算项目失败:', error);
      setErrorMessage(error.message || '更新预算项目失败，请重试');
      throw error;
    }
  };

  // 删除预算参考项目
  const deleteBudgetItem = async (itemId) => {
    try {
      const result = await api.delete(`/budget/reference/${itemId}`);

      if (result.status === 'success') {
        await loadBudgetDataFromAPI(); // 重新加载数据
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
        return true;
      } else {
        throw new Error('删除预算项目失败');
      }
    } catch (error) {
      console.error('删除预算项目失败:', error);
      setErrorMessage(error.message || '删除预算项目失败，请重试');
      throw error;
    }
  };

  // 加载预算数据（本地备用）
  const loadBudgetData = () => {
    const savedBudget = localStorage.getItem('xuzhou-travel-budget');
    let loadedData;
    if (savedBudget) {
      try {
        const parsedBudget = JSON.parse(savedBudget);
        setBudgetData(parsedBudget);
        loadedData = parsedBudget;
      } catch (error) {
        console.error('Error loading budget data:', error);
        setBudgetData(defaultBudgetData);
        loadedData = defaultBudgetData;
      }
    } else {
      setBudgetData(defaultBudgetData);
      loadedData = defaultBudgetData;
    }

    // 触发自定义事件，通知其他组件预算数据已加载
    window.dispatchEvent(new CustomEvent('budgetDataChanged', {
      detail: { budgetData: loadedData }
    }));
  };

  // 从API加载实际支出数据
  const loadActualExpenseDataFromAPI = async () => {
    try {
      const result = await api.get('/expenses');
      if (result.status === 'success' && result.data.items.length > 0) {
        // 按分类汇总支出数据
        const categoryTotals = {};
        result.data.items.forEach(item => {
          if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = {
              amount: 0,
              details: [],
              items: [],
              count: 0
            };
          }
          categoryTotals[item.category].amount += parseFloat(item.amount);
          categoryTotals[item.category].details.push(item.description);
          categoryTotals[item.category].items.push(item);
          categoryTotals[item.category].count++;
        });

        // 转换为前端格式
        const formattedData = Object.keys(categoryTotals).map((category) => ({
          id: category.toLowerCase().replace(/\s+/g, ''),
          category: category,
          amount: categoryTotals[category].amount,
          detail: categoryTotals[category].details.join(', '),
          items: categoryTotals[category].items,
          count: categoryTotals[category].count,
          editable: true
        }));

        setActualExpenseData(formattedData.length > 0 ? formattedData : getDefaultActualExpenseData());
      } else {
        setActualExpenseData(getDefaultActualExpenseData());
      }
    } catch (error) {
      console.error('从API加载实际支出数据失败:', error);
      loadActualExpenseData(); // 回退到本地数据
    }
  };

  // 创建新的支出记录
  const createExpenseItem = async (expenseData) => {
    try {
      // 使用数据验证工具确保数据格式正确
      const validatedData = validateExpenseData(expenseData);

      const result = await api.post('/expenses', validatedData);

      if (result.status === 'success') {
        await loadActualExpenseDataFromAPI(); // 重新加载数据
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
        return result.data;
      } else {
        throw new Error('创建支出记录失败');
      }
    } catch (error) {
      console.error('创建支出记录失败:', error);
      setErrorMessage(error.message || '创建支出记录失败，请重试');
      throw error;
    }
  };

  // 更新支出记录
  const updateExpenseItem = async (itemId, expenseData) => {
    try {
      // 使用数据验证工具确保数据格式正确
      const validatedData = validateExpenseData(expenseData);

      const result = await api.put(`/expenses/${itemId}`, validatedData);

      if (result.status === 'success') {
        await loadActualExpenseDataFromAPI(); // 重新加载数据
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
        return result.data;
      } else {
        throw new Error('更新支出记录失败');
      }
    } catch (error) {
      console.error('更新支出记录失败:', error);
      setErrorMessage(error.message || '更新支出记录失败，请重试');
      throw error;
    }
  };

  // 删除支出记录
  const deleteExpenseItem = async (itemId) => {
    try {
      const result = await api.delete(`/expenses/${itemId}`);

      if (result.status === 'success') {
        await loadActualExpenseDataFromAPI(); // 重新加载数据
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
        return true;
      } else {
        throw new Error('删除支出记录失败');
      }
    } catch (error) {
      console.error('删除支出记录失败:', error);
      setErrorMessage(error.message || '删除支出记录失败，请重试');
      throw error;
    }
  };

  // 加载实际消费数据（本地备用）
  const loadActualExpenseData = () => {
    const savedActualExpense = localStorage.getItem('xuzhou-travel-actual-expense');
    if (savedActualExpense) {
      try {
        const parsedActualExpense = JSON.parse(savedActualExpense);
        setActualExpenseData(parsedActualExpense);
      } catch (error) {
        console.error('Error loading actual expense data:', error);
        setActualExpenseData(getDefaultActualExpenseData());
      }
    } else {
      setActualExpenseData(getDefaultActualExpenseData());
    }
  };



  // 获取默认实际消费数据
  const getDefaultActualExpenseData = () => [
    { id: 'transport', category: '交通费', amount: 0, detail: '实际交通支出' },
    { id: 'accommodation', category: '住宿费', amount: 0, detail: '实际住宿支出' },
    { id: 'food', category: '餐饮费', amount: 0, detail: '实际餐饮支出' },
    { id: 'tickets', category: '门票费', amount: 0, detail: '实际门票支出' },
    { id: 'localTransport', category: '市内交通', amount: 0, detail: '实际市内交通支出' },
    { id: 'shopping', category: '购物费', amount: 0, detail: '实际购物支出' }
  ];

  // 保存数据到localStorage
  const saveBudgetData = (newBudgetData) => {
    localStorage.setItem('xuzhou-travel-budget', JSON.stringify(newBudgetData));
    setBudgetData(newBudgetData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);

    // 触发自定义事件，通知其他组件预算数据已更新
    window.dispatchEvent(new CustomEvent('budgetDataChanged', {
      detail: { budgetData: newBudgetData }
    }));
  };

  // 保存实际消费数据到localStorage
  const saveActualExpenseData = (newActualExpenseData) => {
    localStorage.setItem('xuzhou-travel-actual-expense', JSON.stringify(newActualExpenseData));
    setActualExpenseData(newActualExpenseData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  // 添加新预算项目
  const handleAddBudgetItem = async () => {
    try {
      // 验证必填字段
      if (!newBudgetItem.category || !newBudgetItem.item_name || !newBudgetItem.recommended_amount) {
        setErrorMessage('请填写分类、项目名称和推荐金额');
        return;
      }

      const minAmount = parseFloat(newBudgetItem.min_amount) || 0;
      const maxAmount = parseFloat(newBudgetItem.max_amount) || parseFloat(newBudgetItem.recommended_amount);
      const recommendedAmount = parseFloat(newBudgetItem.recommended_amount);

      if (recommendedAmount <= 0) {
        setErrorMessage('推荐金额必须大于0');
        return;
      }

      if (maxAmount < minAmount) {
        setErrorMessage('最高金额不能小于最低金额');
        return;
      }

      if (recommendedAmount < minAmount || recommendedAmount > maxAmount) {
        setErrorMessage('推荐金额必须在最低和最高金额之间');
        return;
      }

      const budgetData = {
        category: newBudgetItem.category,
        item_name: newBudgetItem.item_name,
        min_amount: minAmount,
        max_amount: maxAmount,
        recommended_amount: recommendedAmount,
        unit: newBudgetItem.unit || '元',
        description: newBudgetItem.description || newBudgetItem.item_name,
        tips: newBudgetItem.tips || '',
        is_essential: true
      };

      await createBudgetItem(budgetData);

      // 重置表单
      setNewBudgetItem({
        category: '',
        item_name: '',
        min_amount: '',
        max_amount: '',
        recommended_amount: '',
        unit: '元',
        description: '',
        tips: ''
      });
      setShowAddBudgetForm(false);
      setErrorMessage('');
    } catch (error) {
      // 错误已在createBudgetItem中处理
    }
  };

  // 取消添加预算项目
  const handleCancelAddBudget = () => {
    setNewBudgetItem({
      category: '',
      item_name: '',
      min_amount: '',
      max_amount: '',
      recommended_amount: '',
      unit: '元',
      description: '',
      tips: ''
    });
    setShowAddBudgetForm(false);
    setErrorMessage('');
  };

  // 添加新支出记录
  const handleAddExpenseItem = async () => {
    try {
      // 验证必填字段
      if (!newExpenseItem.category || !newExpenseItem.amount || !newExpenseItem.description) {
        setErrorMessage('请填写分类、金额和描述');
        return;
      }

      const amount = parseFloat(newExpenseItem.amount);
      if (amount <= 0) {
        setErrorMessage('金额必须大于0');
        return;
      }

      if (amount > 999999) {
        setErrorMessage('金额不能超过999999');
        return;
      }

      const expenseData = {
        category: newExpenseItem.category,
        amount: amount,
        description: newExpenseItem.description,
        date: newExpenseItem.date,
        time: newExpenseItem.time,
        location: newExpenseItem.location,
        payment_method: newExpenseItem.payment_method,
        notes: newExpenseItem.notes,
        is_planned: false
      };

      await createExpenseItem(expenseData);

      // 重置表单
      setNewExpenseItem({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        location: '',
        payment_method: '其他',
        notes: ''
      });
      setShowAddExpenseForm(false);
      setErrorMessage('');
    } catch (error) {
      // 错误已在createExpenseItem中处理
    }
  };

  // 取消添加支出记录
  const handleCancelAddExpense = () => {
    setNewExpenseItem({
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      location: '',
      payment_method: '其他',
      notes: ''
    });
    setShowAddExpenseForm(false);
    setErrorMessage('');
  };

  // 开始编辑
  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditValue(item.amount.toString());
    setErrorMessage('');
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingItem(null);
    setEditValue('');
    setErrorMessage('');
  };

  // 保存编辑
  const saveEdit = async (itemId) => {
    const numValue = parseFloat(editValue);

    // 验证输入
    if (isNaN(numValue) || numValue < 0) {
      setErrorMessage('请输入有效的正数');
      return;
    }

    if (numValue > 999999) {
      setErrorMessage('金额不能超过999999');
      return;
    }

    try {
      // 找到要更新的项目
      const item = budgetData.find(item => item.id === itemId);
      if (!item) {
        setErrorMessage('找不到要更新的预算项目');
        return;
      }

      // 准备更新数据
      const updateData = {
        category: item.category,
        item_name: item.detail || item.category,
        min_amount: item.min_amount || 0,
        max_amount: Math.max(item.max_amount || numValue, numValue),
        recommended_amount: numValue,
        unit: item.unit || '元',
        description: item.detail || item.category,
        tips: item.tips || '',
        is_essential: true
      };

      // 调用API更新
      await updateBudgetItem(itemId, updateData);

      setEditingItem(null);
      setEditValue('');
      setErrorMessage('');
    } catch (error) {
      // 错误已在updateBudgetItem中处理
    }
  };

  // 重置为默认预算
  const resetToDefault = async () => {
    if (window.confirm('确定要重置为默认预算吗？这将清除您的所有自定义修改。')) {
      try {
        // 重新加载API数据
        await loadBudgetDataFromAPI();

        // 如果API没有数据，使用默认数据
        if (budgetData.length === 0) {
          setBudgetData(defaultBudgetData);
        }

        localStorage.removeItem('xuzhou-travel-budget');
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
      } catch (error) {
        console.error('Error resetting budget data:', error);
        setBudgetData(defaultBudgetData);
        setErrorMessage('重置失败，已使用默认数据');
      }
    }
  };

  // 计算总计
  const totalAmount = budgetData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalActualAmount = actualExpenseData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const totalDifference = totalActualAmount - totalAmount;

  // 金额格式化函数
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  // 获取对比数据
  const getComparisonData = () => {
    return budgetData.map(budgetItem => {
      const actualItem = actualExpenseData.find(actual => actual.id === budgetItem.id);
      const actualAmount = actualItem ? actualItem.amount : 0;
      const difference = actualAmount - budgetItem.amount;
      const percentage = budgetItem.amount > 0 ? ((difference / budgetItem.amount) * 100) : 0;

      return {
        ...budgetItem,
        actualAmount,
        difference,
        percentage: Math.round(percentage * 100) / 100
      };
    });
  };

  // 处理键盘事件
  const handleKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveEdit(itemId);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 验证输入
  const handleInputChange = (value) => {
    // 只允许数字和小数点
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setEditValue(value);
      setErrorMessage('');
    }
  };

  // 验证实际消费输入
  const handleActualExpenseInputChange = (value) => {
    // 只允许数字和小数点
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      setEditingActualExpenseValue(value);
      setErrorMessage('');
    }
  };

  // 开始编辑预算备注
  const startEditingBudgetDetail = (itemId, currentDetail) => {
    setEditingBudgetDetail(itemId);
    setEditingBudgetDetailValue(currentDetail || '');
  };

  // 取消编辑预算备注
  const cancelEditingBudgetDetail = () => {
    setEditingBudgetDetail(null);
    setEditingBudgetDetailValue('');
  };

  // 保存预算备注编辑
  const saveBudgetDetailEdit = async (itemId) => {
    if (editingBudgetDetailValue.trim() === '') {
      setErrorMessage('备注不能为空');
      return;
    }

    try {
      // 找到要更新的项目
      const item = budgetData.find(item => item.id === itemId);
      if (!item) {
        setErrorMessage('找不到要更新的预算项目');
        return;
      }

      // 准备更新数据，保持原有字段并更新description
      const updateData = {
        category: item.category,
        item_name: item.detail || item.category,
        min_amount: item.min_amount || 0,
        max_amount: item.max_amount || item.amount,
        recommended_amount: item.amount,
        unit: item.unit || '元',
        description: editingBudgetDetailValue.trim(), // 更新description字段
        tips: item.tips || '',
        is_essential: true
      };

      // 调用API更新数据库
      await updateBudgetItem(itemId, updateData);

      setEditingBudgetDetail(null);
      setEditingBudgetDetailValue('');
      setErrorMessage('');
    } catch (error) {
      // 错误已在updateBudgetItem中处理
      console.error('保存预算备注失败:', error);
    }
  };

  // 处理预算备注编辑的键盘事件
  const handleBudgetDetailKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveBudgetDetailEdit(itemId);
    } else if (e.key === 'Escape') {
      cancelEditingBudgetDetail();
    }
  };

  // 处理删除预算项目
  const handleDeleteBudgetItem = async (itemId) => {
    const item = budgetData.find(item => item.id === itemId);
    const itemName = item ? item.category : '该项目';

    if (window.confirm(`确定要删除"${itemName}"吗？此操作不可撤销。`)) {
      try {
        await deleteBudgetItem(itemId);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
      } catch (error) {
        // 错误已在deleteBudgetItem中处理
        console.error('删除预算项目失败:', error);
      }
    }
  };

  // 开始编辑实际消费
  const startEditingActualExpense = (item) => {
    setEditingActualExpense(item.id);
    setEditingActualExpenseValue(item.amount.toString());
    setErrorMessage('');
  };

  // 取消编辑实际消费
  const cancelEditingActualExpense = () => {
    setEditingActualExpense(null);
    setEditingActualExpenseValue('');
    setErrorMessage('');
  };

  // 保存实际消费编辑
  const saveActualExpenseEdit = async (itemId) => {
    const numValue = parseFloat(editingActualExpenseValue);

    // 验证输入
    if (isNaN(numValue) || numValue < 0) {
      setErrorMessage('请输入有效的正数');
      return;
    }

    if (numValue > 999999) {
      setErrorMessage('金额不能超过999999');
      return;
    }

    try {
      // 找到要更新的分类项目
      const categoryItem = actualExpenseData.find(item => item.id === itemId);
      if (!categoryItem) {
        setErrorMessage('找不到要更新的支出分类');
        return;
      }

      // 如果该分类有现有记录，更新最新的一条记录
      if (categoryItem.items && categoryItem.items.length > 0) {
        // 获取最新的记录（按创建时间排序，取最后一个）
        const latestItem = categoryItem.items.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        )[0];

        // 准备更新数据
        const expenseData = {
          category: latestItem.category,
          amount: numValue,
          description: latestItem.description,
          date: latestItem.date,
          time: latestItem.time,
          location: latestItem.location || '',
          payment_method: latestItem.payment_method || '其他',
          receipt_number: latestItem.receipt_number || '',
          notes: latestItem.notes || '',
          is_planned: latestItem.is_planned || false
        };

        // 调用API更新现有记录
        await updateExpenseItem(latestItem.id, expenseData);
      } else {
        // 如果没有现有记录，创建新记录
        const expenseData = {
          category: categoryItem.category,
          amount: numValue,
          description: `${categoryItem.category}支出`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          payment_method: '其他',
          receipt_number: '',
          notes: `${categoryItem.category}支出记录`,
          is_planned: false
        };

        await createExpenseItem(expenseData);
      }

      setEditingActualExpense(null);
      setEditingActualExpenseValue('');
      setErrorMessage('');
    } catch (error) {
      // 错误已在updateExpenseItem或createExpenseItem中处理
      console.error('保存实际消费编辑失败:', error);
    }
  };

  // 处理实际消费编辑的键盘事件
  const handleActualExpenseKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveActualExpenseEdit(itemId);
    } else if (e.key === 'Escape') {
      cancelEditingActualExpense();
    }
  };

  // 重置实际消费为默认数据
  const resetActualExpenseToDefault = async () => {
    if (window.confirm('确定要重置实际消费数据吗？这将清除您的所有记录。')) {
      try {
        // 重新加载API数据
        await loadActualExpenseDataFromAPI();

        // 如果API没有数据，使用默认数据
        if (actualExpenseData.length === 0) {
          setActualExpenseData(getDefaultActualExpenseData());
        }

        localStorage.removeItem('xuzhou-travel-actual-expense');
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
      } catch (error) {
        console.error('Error resetting expense data:', error);
        setActualExpenseData(getDefaultActualExpenseData());
        setErrorMessage('重置失败，已使用默认数据');
      }
    }
  };

  // 开始编辑实际消费详细说明
  const startEditingActualExpenseDetail = (itemId, currentDetail) => {
    setEditingActualExpenseDetail(itemId);
    setEditingActualExpenseDetailValue(currentDetail || '');
  };

  // 取消编辑实际消费详细说明
  const cancelEditingActualExpenseDetail = () => {
    setEditingActualExpenseDetail(null);
    setEditingActualExpenseDetailValue('');
  };

  // 保存实际消费详细说明编辑
  const saveActualExpenseDetailEdit = async (itemId) => {
    if (editingActualExpenseDetailValue.trim() === '') {
      setErrorMessage('说明不能为空');
      return;
    }

    try {
      // 找到要更新的分类项目
      const categoryItem = actualExpenseData.find(item => item.id === itemId);
      if (!categoryItem) {
        setErrorMessage('找不到要更新的支出分类');
        return;
      }

      // 如果该分类有现有记录，更新最新的一条记录
      if (categoryItem.items && categoryItem.items.length > 0) {
        // 获取最新的记录（按创建时间排序，取最后一个）
        const latestItem = categoryItem.items.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        )[0];

        // 准备更新数据，只更新description字段
        const expenseData = {
          category: latestItem.category,
          amount: latestItem.amount,
          description: editingActualExpenseDetailValue.trim(),
          date: latestItem.date,
          time: latestItem.time,
          location: latestItem.location || '',
          payment_method: latestItem.payment_method || '其他',
          receipt_number: latestItem.receipt_number || '',
          notes: latestItem.notes || '',
          is_planned: latestItem.is_planned || false
        };

        // 调用API更新现有记录
        await updateExpenseItem(latestItem.id, expenseData);
      } else {
        // 如果没有现有记录，创建新记录
        const expenseData = {
          category: categoryItem.category,
          amount: 0,
          description: editingActualExpenseDetailValue.trim(),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          payment_method: '其他',
          receipt_number: '',
          notes: `${categoryItem.category}支出记录`,
          is_planned: false
        };

        await createExpenseItem(expenseData);
      }

      setEditingActualExpenseDetail(null);
      setEditingActualExpenseDetailValue('');
      setErrorMessage('');
    } catch (error) {
      // 错误已在updateExpenseItem或createExpenseItem中处理
      console.error('保存实际消费详细说明失败:', error);
    }
  };

  // 处理实际消费详细说明编辑的键盘事件
  const handleActualExpenseDetailKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveActualExpenseDetailEdit(itemId);
    } else if (e.key === 'Escape') {
      cancelEditingActualExpenseDetail();
    }
  };

  // 保存行程数据到API
  const saveItineraryData = async (newItineraryData) => {
    try {
      setIsLoading(true);
      setApiError('');

      // 如果还没有迁移，先保存到localStorage
      if (needsMigration()) {
        localStorage.setItem('xuzhou-travel-itinerary', JSON.stringify(newItineraryData));
        setItineraryData(newItineraryData);
      } else {
        // 保存到API
        console.log('保存行程数据到API:', newItineraryData);
        await itineraryService.saveAll(newItineraryData);
        setItineraryData(newItineraryData);
      }

      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
    } catch (error) {
      console.error('保存行程数据失败:', error);

      // 提供更详细的错误信息
      let errorMessage = '保存失败';
      if (error.message) {
        if (error.message.includes('行程日期不能早于今天')) {
          errorMessage = '保存失败：包含过去的日期，请检查行程日期设置';
        } else if (error.message.includes('数据验证失败')) {
          errorMessage = `数据验证失败：${error.message}`;
        } else if (error.message.includes('网络')) {
          errorMessage = '网络连接失败，数据已保存到本地';
        } else {
          errorMessage = error.message;
        }
      }

      setApiError(errorMessage);

      // 回退到localStorage保存
      try {
        localStorage.setItem('xuzhou-travel-itinerary', JSON.stringify(newItineraryData));
        setItineraryData(newItineraryData);
        console.log('数据已保存到本地存储作为备份');
      } catch (localError) {
        console.error('本地保存也失败:', localError);
        setApiError('保存失败：无法保存到服务器和本地存储');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 开始编辑行程活动
  const startEditingActivity = (dayIndex, actIndex, field, currentValue) => {
    setEditingActivity({ dayIndex, actIndex, field, originalHtml: currentValue });
    // 确保传递正确的HTML内容给RichTextEditor
    setEditingActivityValue(currentValue || '');

    // 重置选择状态
    setIsSelectionBold(false);
    setCurrentSelection({ start: 0, end: 0 });
  };

  // 取消编辑行程活动
  const cancelEditingActivity = () => {
    setEditingActivity(null);
    setEditingActivityValue('');
  };

  // 保存行程活动编辑
  const saveActivityEdit = async () => {
    if (!editingActivity) return;

    const { dayIndex, actIndex, field } = editingActivity;
    const newItineraryData = [...itineraryData];

    // 使用RichTextEditor传递的值
    let valueToSave = editingActivityValue;

    // 更新对应字段的值
    newItineraryData[dayIndex].activities[actIndex][field] = valueToSave;

    await saveItineraryData(newItineraryData);
    setEditingActivity(null);
    setEditingActivityValue('');
    setIsSelectionBold(false);
    setCurrentSelection({ start: 0, end: 0 });
  };

  // 处理行程编辑的键盘事件
  const handleActivityKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter 保存
      e.preventDefault();
      saveActivityEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingActivity();
    }
    // 允许 Enter 键在 contentEditable 中正常换行
  };

  // 开始编辑标题
  const startEditingTitle = (dayIndex, field, currentValue) => {
    setEditingTitle({ dayIndex, field, originalHtml: currentValue });
    setEditingTitleValue(currentValue || '');

    // 重置选择状态
    setIsSelectionBold(false);
    setCurrentSelection({ start: 0, end: 0 });

    // 对于富文本字段，需要在下一个渲染周期设置HTML内容
    setTimeout(() => {
      setEditableTitleContent(currentValue || '');
    }, 10);
  };

  // 取消编辑标题
  const cancelEditingTitle = () => {
    setEditingTitle(null);
    setEditingTitleValue('');
  };

  // 保存标题编辑
  const saveTitleEdit = () => {
    if (!editingTitle) return;

    const { dayIndex, field } = editingTitle;
    const newItineraryData = [...itineraryData];

    // 从contentEditable元素获取HTML内容
    let valueToSave = getEditableTitleContent() || editingTitleValue;

    // 更新对应字段的值
    newItineraryData[dayIndex][field] = valueToSave;

    saveItineraryData(newItineraryData);
    setEditingTitle(null);
    setEditingTitleValue('');
    setIsSelectionBold(false);
    setCurrentSelection({ start: 0, end: 0 });
  };

  // 处理标题编辑的键盘事件
  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      // Ctrl+Enter 保存
      e.preventDefault();
      saveTitleEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingTitle();
    }
  };



  // 获取contentEditable元素的HTML内容
  const getEditableContent = () => {
    const editableDiv = document.querySelector('.wysiwyg-editor');
    return editableDiv ? editableDiv.innerHTML : '';
  };

  // 设置contentEditable元素的HTML内容
  const setEditableContent = (html) => {
    const editableDiv = document.querySelector('.wysiwyg-editor');
    if (editableDiv) {
      editableDiv.innerHTML = html || '';
    }
  };

  // 获取contentEditable元素的纯文本内容
  const getEditablePlainText = () => {
    const editableDiv = document.querySelector('.wysiwyg-editor');
    return editableDiv ? (editableDiv.textContent || editableDiv.innerText || '') : '';
  };

  // 获取标题编辑器的HTML内容
  const getEditableTitleContent = () => {
    const editableDiv = document.querySelector('.wysiwyg-title-editor');
    return editableDiv ? editableDiv.innerHTML : '';
  };

  // 设置标题编辑器的HTML内容
  const setEditableTitleContent = (html) => {
    const editableDiv = document.querySelector('.wysiwyg-title-editor');
    if (editableDiv) {
      editableDiv.innerHTML = html || '';
    }
  };

  // 检查当前选中内容是否已加粗
  const checkIfSelectionIsBold = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // 检查选中内容或其父元素是否包含strong标签
    let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

    while (element && element.classList &&
           !element.classList.contains('wysiwyg-editor') &&
           !element.classList.contains('wysiwyg-title-editor')) {
      if (element.tagName === 'STRONG') {
        return true;
      }
      element = element.parentElement;
    }

    return false;
  };

  // 处理文本选择变化
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      setIsSelectionBold(false);
      return;
    }

    const isBold = checkIfSelectionIsBold();
    setIsSelectionBold(isBold);

    // 更新编辑值为当前HTML内容
    if (editingTitle) {
      const currentHtml = getEditableTitleContent();
      setEditingTitleValue(currentHtml);
    } else {
      const currentHtml = getEditableContent();
      setEditingActivityValue(currentHtml);
    }
  };

  // 富文本编辑相关函数
  const applyTextFormat = (format, value = null) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    switch (format) {
      case 'bold':
        // 使用浏览器原生的execCommand来处理加粗
        document.execCommand('bold', false, null);
        break;

      case 'color':
        // 使用浏览器原生的execCommand来处理颜色
        document.execCommand('foreColor', false, value);
        break;

      default:
        return;
    }

    // 更新编辑值
    if (editingTitle) {
      const newHtml = getEditableTitleContent();
      setEditingTitleValue(newHtml);
    } else {
      const newHtml = getEditableContent();
      setEditingActivityValue(newHtml);
    }

    // 更新选择状态
    setTimeout(() => {
      handleTextSelection();
    }, 10);
  };

  // 渲染HTML内容
  const renderHTMLContent = (content) => {
    return { __html: content };
  };



  // 标准化活动对象，确保包含所有必需字段
  const normalizeActivity = (activity) => {
    return {
      time: activity.time || '09:00',
      activity: activity.activity || '新活动',
      description: activity.description || '',
      tips: activity.tips || '',
      icon: activity.icon || '📍',
      location: activity.location || '',
      duration: activity.duration || 60, // 默认60分钟
      status: activity.status || '计划中',
      originalDate: activity.originalDate
    };
  };

  // 获取默认行程数据
  const getDefaultItinerary = () => {
    // 计算默认日期（从今天开始的周五）
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0是周日，6是周六
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7; // 计算到下一个周五的天数

    const fridayDate = new Date(today);
    fridayDate.setDate(today.getDate() + daysUntilFriday);

    const saturdayDate = new Date(fridayDate);
    saturdayDate.setDate(fridayDate.getDate() + 1);

    const sundayDate = new Date(fridayDate);
    sundayDate.setDate(fridayDate.getDate() + 2);

    // 格式化日期
    const formatDate = (date) => date.toISOString().split('T')[0];
    const formatMonthDay = (date) => `${date.getMonth() + 1}月${date.getDate()}日`;

    return [
    {
      day: '周五',
      date: formatMonthDay(fridayDate),
      title: '出发日 - 南京到徐州',
      originalDate: formatDate(fridayDate), // 添加原始日期
      activities: [
        normalizeActivity({
          time: '19:30',
          activity: '南京南站集合',
          description: '提前1小时到达，取票安检',
          tips: 'G2700次高铁，建议提前网上购票',
          icon: '🚄',
          location: '南京南站',
          duration: 30,
          originalDate: formatDate(fridayDate)
        }),
        normalizeActivity({
          time: '20:31',
          activity: '乘坐高铁G2700',
          description: '南京南 → 徐州东，约1小时34分钟',
          tips: '可以在车上休息，准备第二天的行程',
          icon: '🚄',
          location: '高铁上',
          duration: 94,
          originalDate: formatDate(fridayDate)
        }),
        normalizeActivity({
          time: '22:05',
          activity: '到达徐州东站',
          description: '出站后乘坐地铁或打车前往酒店',
          tips: '地铁1号线可直达市区，约30分钟',
          icon: '🏨',
          location: '徐州东站',
          duration: 35,
          originalDate: formatDate(fridayDate)
        }),
        normalizeActivity({
          time: '22:40',
          activity: '季末轻居酒店入住',
          description: '办理入住手续，稍作休息',
          tips: '酒店位于人民广场地铁站附近，交通便利',
          icon: '🛏️',
          location: '季末轻居酒店',
          duration: 20,
          originalDate: formatDate(fridayDate)
        }),
        normalizeActivity({
          time: '23:00',
          activity: '附近觅食',
          description: '寻找附近的夜宵或小吃',
          tips: '可以尝试徐州烙馍或羊肉汤',
          icon: '🍜',
          location: '酒店附近',
          duration: 60,
          originalDate: formatDate(fridayDate)
        })
      ]
    },
    {
      day: '周六',
      date: formatMonthDay(saturdayDate),
      title: '徐州深度游',
      originalDate: formatDate(saturdayDate), // 添加原始日期
      activities: [
        normalizeActivity({
          time: '08:00',
          activity: '酒店早餐',
          description: '享用丰盛的早餐，为一天的行程做准备',
          tips: '如果酒店没有早餐，可以去附近吃羊肉汤',
          icon: '🥐',
          location: '季末轻居酒店',
          duration: 60,
          originalDate: formatDate(saturdayDate)
        }),
        normalizeActivity({
          time: '09:00',
          activity: '云龙湖风景区',
          description: '徐州最美的景点，湖光山色，适合散步拍照',
          tips: '建议租借共享单车环湖，约2-3小时',
          icon: '🌊',
          location: '云龙湖风景区',
          duration: 180,
          originalDate: formatDate(saturdayDate)
        }),
        normalizeActivity({
          time: '12:00',
          activity: '湖边午餐',
          description: '在云龙湖附近的餐厅享用午餐',
          tips: '推荐淮海食府，环境好适合情侣',
          icon: '🍽️',
          location: '淮海食府',
          duration: 120,
          originalDate: formatDate(saturdayDate)
        }),
        normalizeActivity({
          time: '14:00',
          activity: '彭祖园',
          description: '了解徐州历史文化，园林景观优美',
          tips: '适合慢慢游览，拍照留念',
          icon: '🏛️',
          location: '彭祖园',
          duration: 120,
          originalDate: formatDate(saturdayDate)
        }),
        normalizeActivity({
          time: '16:00',
          activity: '马市街小吃街',
          description: '品尝各种徐州特色小吃',
          tips: '不要吃太饱，留肚子尝试更多美食',
          icon: '🍡',
          location: '马市街小吃街',
          duration: 120,
          originalDate: formatDate(saturdayDate)
        }),
        normalizeActivity({
          time: '18:00',
          activity: '徐州博物馆',
          description: '了解徐州深厚的历史文化',
          tips: '周六延长开放时间，可以慢慢参观',
          icon: '🏛️',
          location: '徐州博物馆',
          duration: 120,
          originalDate: formatDate(saturdayDate)
        }),
        normalizeActivity({
          time: '20:00',
          activity: '晚餐时光',
          description: '选择一家有特色的餐厅享用晚餐',
          tips: '可以选择有情调的餐厅，增进感情',
          icon: '🍷',
          location: '市中心餐厅',
          duration: 120,
          originalDate: formatDate(saturdayDate)
        })
      ]
    },
    {
      day: '周日',
      date: formatMonthDay(sundayDate),
      title: '返程日 - 轻松游览',
      originalDate: formatDate(sundayDate), // 添加原始日期
      activities: [
        normalizeActivity({
          time: '09:00',
          activity: '酒店退房',
          description: '整理行李，办理退房手续',
          tips: '可以把行李寄存在酒店，轻松游览',
          icon: '🧳',
          location: '季末轻居酒店',
          duration: 30,
          originalDate: formatDate(sundayDate)
        }),
        normalizeActivity({
          time: '09:30',
          activity: '户部山古建筑群',
          description: '徐州历史文化街区，古色古香',
          tips: '适合拍照，了解徐州传统建筑',
          icon: '🏘️',
          location: '户部山古建筑群',
          duration: 90,
          originalDate: formatDate(sundayDate)
        }),
        normalizeActivity({
          time: '11:00',
          activity: '购买特产',
          description: '购买徐州特产作为伴手礼',
          tips: '蜜三刀、牛蒡茶都是不错的选择',
          icon: '🛍️',
          location: '特产店',
          duration: 60,
          originalDate: formatDate(sundayDate)
        }),
        normalizeActivity({
          time: '12:00',
          activity: '最后一餐',
          description: '享用徐州的最后一顿美食',
          tips: '可以再次品尝最喜欢的徐州菜',
          icon: '🍜',
          location: '徐州餐厅',
          duration: 90,
          originalDate: formatDate(sundayDate)
        }),
        normalizeActivity({
          time: '14:30',
          activity: '前往徐州站',
          description: '取行李，前往徐州站（注意是徐州站不是徐州东站）',
          tips: '预留充足时间，K347次火车从徐州站发车',
          icon: '🚇',
          location: '徐州站',
          duration: 68,
          originalDate: formatDate(sundayDate)
        }),
        normalizeActivity({
          time: '15:38',
          activity: '返程火车K347',
          description: '徐州站 → 南京站，约4小时13分钟',
          tips: '可以在车上整理照片，回味旅程',
          icon: '🚄',
          location: '火车上',
          duration: 253,
          originalDate: formatDate(sundayDate)
        }),
        normalizeActivity({
          time: '19:51',
          activity: '到达南京站',
          description: '愉快的徐州之旅结束',
          tips: '记得分享旅行的美好回忆',
          icon: '🏠',
          location: '南京站',
          duration: 30,
          originalDate: formatDate(sundayDate)
        })
      ]
    }
  ];
  };

  // 执行数据迁移
  const handleMigration = async () => {
    try {
      setMigrationProgress({ message: '开始迁移...', progress: 0 });

      const result = await performMigration((message, progress) => {
        setMigrationProgress({ message, progress });
      });

      if (result.success) {
        setShowMigrationDialog(false);
        setMigrationStatus(null);
        // 重新加载数据
        await loadItineraryFromAPI();
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);
      } else {
        setApiError(result.error || '迁移失败');
      }
    } catch (error) {
      console.error('迁移过程出错:', error);
      setApiError(error.message || '迁移失败');
    }
  };

  // 跳过迁移
  const skipMigration = () => {
    setShowMigrationDialog(false);
    setMigrationStatus(null);
  };

  // 新增活动
  const addActivity = async (dayIndex) => {
    try {
      setIsLoading(true);
      setApiError('');

      const currentDay = itineraryData[dayIndex];

      // 确保使用未来的日期
      let activityDate = currentDay.originalDate;

      // 如果原始日期是过去的日期，使用未来的日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const originalDate = new Date(activityDate);

      if (originalDate < today) {
        // 计算未来的日期：今天 + dayIndex 天
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + dayIndex + 1); // +1 确保是未来日期
        activityDate = futureDate.toISOString().split('T')[0];

        console.log(`调整活动日期: ${currentDay.originalDate} -> ${activityDate}`);
      }

      const newActivity = {
        time: '09:00',
        activity: '新活动',
        description: '请编辑活动描述',
        tips: '请添加小贴士',
        icon: '📍',
        location: '',
        duration: 60, // 默认60分钟
        status: '计划中',
        originalDate: activityDate // 使用调整后的日期
      };

      const newItineraryData = [...itineraryData];
      newItineraryData[dayIndex].activities.push(newActivity);

      await saveItineraryData(newItineraryData);

      // 显示成功提示
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);

    } catch (error) {
      console.error('添加活动失败:', error);

      // 提供更详细的错误信息
      let errorMessage = '添加活动失败';
      if (error.message) {
        if (error.message.includes('行程日期不能早于今天')) {
          errorMessage = '无法添加活动：日期不能是过去的日期，请刷新页面获取最新数据';
        } else if (error.message.includes('数据验证失败')) {
          errorMessage = `数据验证失败：${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }

      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除活动
  const deleteActivity = async (dayIndex, actIndex) => {
    if (window.confirm('确定要删除这个活动吗？')) {
      try {
        setIsLoading(true);
        setApiError('');

        const newItineraryData = [...itineraryData];
        const activity = newItineraryData[dayIndex].activities[actIndex];

        // 如果活动有ID，需要从后端删除
        if (activity.id && !needsMigration()) {
          try {
            await itineraryService.deleteActivity(activity.id);
          } catch (error) {
            console.error('删除活动失败:', error);
            setApiError(error.message || '删除活动失败');
            return;
          }
        }

        newItineraryData[dayIndex].activities.splice(actIndex, 1);
        await saveItineraryData(newItineraryData);

        // 显示成功提示
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);

      } catch (error) {
        console.error('删除活动失败:', error);
        setApiError(error.message || '删除活动失败');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 重置行程为默认数据
  const resetItineraryToDefault = async () => {
    if (window.confirm('确定要重置为默认行程吗？这将清除您的所有自定义修改。')) {
      try {
        setIsLoading(true);

        if (!needsMigration()) {
          // 如果已迁移，需要清除后端数据
          const response = await itineraryService.getAll(true); // 强制刷新
          const currentData = response || [];

          // 删除所有现有数据
          for (const day of currentData) {
            if (day.activities) {
              for (const activity of day.activities) {
                if (activity.id) {
                  await itineraryService.deleteActivity(activity.id);
                }
              }
            }
          }
        } else {
          // 清除本地存储
          localStorage.removeItem('xuzhou-travel-itinerary');
        }

        const defaultData = getDefaultItinerary();
        await saveItineraryData(defaultData);

      } catch (error) {
        console.error('重置行程失败:', error);
        setApiError(error.message || '重置失败');
        // 回退到本地重置
        localStorage.removeItem('xuzhou-travel-itinerary');
        setItineraryData(getDefaultItinerary());
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 2000);
      } finally {
        setIsLoading(false);
      }
    }
  };



  return (
    <div className="travel-plan">
      <div className="container py-5">
        <div className="section-header text-center mb-5">
          <h2 className="display-5 mb-3">📅 行程安排</h2>
          <p className="lead text-muted">轻松愉快的徐州周末游，两天一夜精华体验</p>
          <div className="mt-3">
            <small className="text-muted me-3">💡 点击任意内容可以编辑自定义行程</small>
            <button className="btn btn-outline-primary btn-sm" onClick={resetItineraryToDefault} disabled={isLoading}>
              {isLoading ? '处理中...' : '重置为默认行程'}
            </button>
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="alert alert-info mt-3">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">加载中...</span>
                </div>
                正在处理，请稍候...
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {apiError && (
            <div className="alert alert-warning mt-3 alert-dismissible fade show">
              <strong>提示：</strong> {apiError}
              <button type="button" className="btn-close" onClick={() => setApiError('')}></button>
            </div>
          )}

          {/* 成功提示 */}
          {showSaveMessage && (
            <div className="alert alert-success mt-3">
              <i className="fas fa-check-circle me-2"></i>
              保存成功！
            </div>
          )}
        </div>

        {/* 数据迁移对话框 */}
        {showMigrationDialog && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">数据迁移</h5>
                </div>
                <div className="modal-body">
                  <p>检测到您有本地保存的行程数据，是否要迁移到云端？</p>
                  <p className="text-muted small">迁移后您的数据将保存在服务器上，可以在不同设备间同步。</p>

                  {migrationProgress.progress > 0 && (
                    <div className="mt-3">
                      <div className="progress mb-2">
                        <div
                          className="progress-bar"
                          style={{width: `${migrationProgress.progress}%`}}
                        ></div>
                      </div>
                      <small className="text-muted">{migrationProgress.message}</small>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={skipMigration}
                    disabled={migrationProgress.progress > 0}
                  >
                    暂时跳过
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleMigration}
                    disabled={migrationProgress.progress > 0}
                  >
                    {migrationProgress.progress > 0 ? '迁移中...' : '开始迁移'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="itinerary-container">
          {itineraryData.map((day, dayIndex) => (
            <div key={dayIndex} className="day-section mb-5">
              <div className="row">
                <div className="col-12">
                  <div className="day-header card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <div className="day-info d-flex align-items-center">
                            {editingTitle &&
                             editingTitle.dayIndex === dayIndex &&
                             editingTitle.field === 'day' ? (
                              <div className="title-edit-container me-3">
                                <div
                                  contentEditable
                                  onInput={(e) => {
                                    const html = e.target.innerHTML;
                                    setEditingTitleValue(html);
                                  }}
                                  onKeyDown={handleTitleKeyPress}
                                  onMouseUp={handleTextSelection}
                                  onKeyUp={handleTextSelection}
                                  onSelect={handleTextSelection}
                                  className="form-control wysiwyg-title-editor h4 mb-0"
                                  style={{
                                    minHeight: '40px',
                                    padding: '8px 12px',
                                    border: '2px solid #007bff',
                                    borderRadius: '0.375rem',
                                    outline: 'none',
                                    display: 'inline-block',
                                    minWidth: '120px'
                                  }}
                                  suppressContentEditableWarning={true}
                                  data-placeholder="日期（所见即所得编辑）"
                                />
                                {/* 富文本编辑工具栏 */}
                                <div className="format-toolbar mb-2 p-2 bg-light rounded mt-2">
                                  <div className="d-flex gap-2 align-items-center">
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${isSelectionBold ? 'btn-primary' : 'btn-outline-secondary'}`}
                                      onClick={() => applyTextFormat('bold')}
                                      title={isSelectionBold ? "取消加粗" : "加粗"}
                                    >
                                      <strong>B</strong>
                                    </button>
                                    <div className="color-picker d-flex gap-1">
                                      {['#000000', '#ffffff','#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          className="btn btn-sm color-btn"
                                          style={{backgroundColor: color, width: '20px', height: '20px', padding: 0}}
                                          onClick={() => applyTextFormat('color', color)}
                                          title={`设置颜色为 ${color}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={saveTitleEdit}
                                  >
                                    ✓ 保存
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelEditingTitle}
                                  >
                                    ✕ 取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <h3
                                className="h4 mb-0 me-3 editable-field"
                                style={{cursor: 'pointer'}}
                                onClick={() => startEditingTitle(dayIndex, 'day', day.day)}
                                title="点击编辑日期"
                                dangerouslySetInnerHTML={renderHTMLContent(day.day)}
                              />
                            )}

                            {editingTitle &&
                             editingTitle.dayIndex === dayIndex &&
                             editingTitle.field === 'date' ? (
                              <div className="title-edit-container">
                                <div
                                  contentEditable
                                  onInput={(e) => {
                                    const html = e.target.innerHTML;
                                    setEditingTitleValue(html);
                                  }}
                                  onKeyDown={handleTitleKeyPress}
                                  onMouseUp={handleTextSelection}
                                  onKeyUp={handleTextSelection}
                                  onSelect={handleTextSelection}
                                  className="form-control wysiwyg-title-editor badge bg-primary"
                                  style={{
                                    minHeight: '30px',
                                    padding: '8px 12px',
                                    border: '2px solid #007bff',
                                    borderRadius: '0.375rem',
                                    outline: 'none',
                                    display: 'inline-block',
                                    minWidth: '100px',
                                    color: 'white'
                                  }}
                                  suppressContentEditableWarning={true}
                                  data-placeholder="日期标签（所见即所得编辑）"
                                />
                                {/* 富文本编辑工具栏 */}
                                <div className="format-toolbar mb-2 p-2 bg-light rounded mt-2">
                                  <div className="d-flex gap-2 align-items-center">
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${isSelectionBold ? 'btn-primary' : 'btn-outline-secondary'}`}
                                      onClick={() => applyTextFormat('bold')}
                                      title={isSelectionBold ? "取消加粗" : "加粗"}
                                    >
                                      <strong>B</strong>
                                    </button>
                                    <div className="color-picker d-flex gap-1">
                                      {[ '#000000', '#ffffff','#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          className="btn btn-sm color-btn"
                                          style={{backgroundColor: color, width: '20px', height: '20px', padding: 0}}
                                          onClick={() => applyTextFormat('color', color)}
                                          title={`设置颜色为 ${color}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={saveTitleEdit}
                                  >
                                    ✓ 保存
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelEditingTitle}
                                  >
                                    ✕ 取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span
                                className="badge bg-primary editable-field"
                                style={{cursor: 'pointer'}}
                                onClick={() => startEditingTitle(dayIndex, 'date', day.date)}
                                title="点击编辑日期标签"
                                dangerouslySetInnerHTML={renderHTMLContent(day.date)}
                              />
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          {editingTitle &&
                           editingTitle.dayIndex === dayIndex &&
                           editingTitle.field === 'title' ? (
                            <div className="title-edit-container">
                              <div
                                contentEditable
                                onInput={(e) => {
                                  const html = e.target.innerHTML;
                                  setEditingTitleValue(html);
                                }}
                                onKeyDown={handleTitleKeyPress}
                                onMouseUp={handleTextSelection}
                                onKeyUp={handleTextSelection}
                                onSelect={handleTextSelection}
                                className="form-control wysiwyg-title-editor h5 mb-0"
                                style={{
                                  minHeight: '40px',
                                  padding: '8px 12px',
                                  border: '2px solid #007bff',
                                  borderRadius: '0.375rem',
                                  outline: 'none',
                                  textAlign: 'right'
                                }}
                                suppressContentEditableWarning={true}
                                data-placeholder="行程标题（所见即所得编辑）"
                              />
                              {/* 富文本编辑工具栏 */}
                              <div className="format-toolbar mb-2 p-2 bg-light rounded mt-2">
                                <div className="d-flex gap-2 align-items-center">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${isSelectionBold ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => applyTextFormat('bold')}
                                    title={isSelectionBold ? "取消加粗" : "加粗"}
                                  >
                                    <strong>B</strong>
                                  </button>
                                  <div className="color-picker d-flex gap-1">
                                    {['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1', '#000000', '#ffffff'].map(color => (
                                      <button
                                        key={color}
                                        type="button"
                                        className="btn btn-sm color-btn"
                                        style={{backgroundColor: color, width: '20px', height: '20px', padding: 0}}
                                        onClick={() => applyTextFormat('color', color)}
                                        title={`设置颜色为 ${color}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={saveTitleEdit}
                                >
                                  ✓ 保存
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={cancelEditingTitle}
                                >
                                  ✕ 取消
                                </button>
                              </div>
                            </div>
                          ) : (
                            <h4
                              className="h5 mb-0 text-md-end mt-2 mt-md-0 editable-field"
                              style={{cursor: 'pointer'}}
                              onClick={() => startEditingTitle(dayIndex, 'title', day.title)}
                              title="点击编辑行程标题"
                              dangerouslySetInnerHTML={renderHTMLContent(day.title)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="activities-timeline">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="row mb-4">
                    <div className="col-md-2 col-3">
                      <div className="time-marker text-center">
                        {editingActivity &&
                         editingActivity.dayIndex === dayIndex &&
                         editingActivity.actIndex === actIndex &&
                         editingActivity.field === 'time' ? (
                          <div className="time-edit-container">
                            <input
                              type="text"
                              value={editingActivityValue}
                              onChange={(e) => setEditingActivityValue(e.target.value)}
                              onKeyDown={handleActivityKeyPress}
                              className="form-control form-control-sm"
                              autoFocus
                              placeholder="时间"
                            />
                            <div className="d-flex gap-1 mt-1">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={saveActivityEdit}
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={cancelEditingActivity}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span
                            className="time badge bg-secondary editable-field"
                            style={{color: '#fff', cursor: 'pointer'}}
                            onClick={() => startEditingActivity(dayIndex, actIndex, 'time', activity.time)}
                            title="点击编辑时间"
                          >
                            {activity.time}
                          </span>
                        )}
                        <div className="timeline-dot mx-auto mt-2"></div>
                      </div>
                    </div>

                    <div className="col-md-10 col-9">
                      <div className="activity-content card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="activity-header d-flex align-items-center mb-3">
                            <span className="activity-icon fs-4 me-3">{activity.icon}</span>
                            {editingActivity &&
                             editingActivity.dayIndex === dayIndex &&
                             editingActivity.actIndex === actIndex &&
                             editingActivity.field === 'activity' ? (
                              <div className="activity-edit-container flex-grow-1">
                                <input
                                  type="text"
                                  value={editingActivityValue}
                                  onChange={(e) => setEditingActivityValue(e.target.value)}
                                  onKeyDown={handleActivityKeyPress}
                                  className="form-control"
                                  autoFocus
                                  placeholder="活动名称"
                                />
                                <div className="d-flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={saveActivityEdit}
                                  >
                                    ✓ 保存
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelEditingActivity}
                                  >
                                    ✕ 取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center justify-content-between flex-grow-1">
                                <h5
                                  className="mb-0 editable-field"
                                  style={{cursor: 'pointer'}}
                                  onClick={() => startEditingActivity(dayIndex, actIndex, 'activity', activity.activity)}
                                  title="点击编辑活动名称"
                                >
                                  {activity.activity}
                                </h5>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteActivity(dayIndex, actIndex)}
                                  title="删除此活动"
                                  disabled={isLoading}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>

                          {editingActivity &&
                           editingActivity.dayIndex === dayIndex &&
                           editingActivity.actIndex === actIndex &&
                           editingActivity.field === 'description' ? (
                            <div className="description-edit-container mb-3">
                              <RichTextEditor
                                value={editingActivityValue}
                                onChange={setEditingActivityValue}
                                onSave={saveActivityEdit}
                                onCancel={cancelEditingActivity}
                                placeholder="活动描述（所见即所得编辑）"
                                minHeight="100px"
                                autoFocus={true}
                              />
                            </div>
                          ) : (
                            <div
                              className="activity-description text-muted mb-3 editable-field"
                              style={{cursor: 'pointer'}}
                              onClick={() => startEditingActivity(dayIndex, actIndex, 'description', activity.description)}
                              title="点击编辑描述"
                              dangerouslySetInnerHTML={renderHTMLContent(activity.description)}
                            />
                          )}

                          {editingActivity &&
                           editingActivity.dayIndex === dayIndex &&
                           editingActivity.actIndex === actIndex &&
                           editingActivity.field === 'tips' ? (
                            <div className="tips-edit-container">
                              <RichTextEditor
                                value={editingActivityValue}
                                onChange={setEditingActivityValue}
                                onSave={saveActivityEdit}
                                onCancel={cancelEditingActivity}
                                placeholder="提示信息（所见即所得编辑）"
                                minHeight="80px"
                                autoFocus={true}
                              />
                            </div>
                          ) : (
                            <div
                              className="activity-tips alert alert-info mb-0 editable-field"
                              style={{cursor: 'pointer'}}
                              onClick={() => startEditingActivity(dayIndex, actIndex, 'tips', activity.tips)}
                              title="点击编辑提示"
                            >
                              <small>💡 <span dangerouslySetInnerHTML={renderHTMLContent(activity.tips)} /></small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 新增活动按钮 */}
                <div className="row mb-4">
                  <div className="col-md-2 col-3">
                    <div className="text-center">
                      <div className="timeline-dot mx-auto" style={{backgroundColor: '#28a745'}}></div>
                    </div>
                  </div>
                  <div className="col-md-10 col-9">
                    <button
                      className="btn btn-outline-success w-100"
                      onClick={() => addActivity(dayIndex)}
                      disabled={isLoading}
                      style={{borderStyle: 'dashed'}}
                    >
                      <i className="fas fa-plus me-2"></i>
                      添加新活动
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 预算部分 */}
        <div className="budget-section mt-5">
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h3 className="h5 mb-0">💰 预算参考</h3>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <small className="me-3">💡 点击金额可以编辑自定义预算</small>
                      <button
                        className="btn btn-outline-light btn-sm me-2"
                        onClick={() => setShowAddBudgetForm(true)}
                      >
                        ➕ 添加预算项目
                      </button>
                      <button className="btn btn-outline-light btn-sm" onClick={resetToDefault}>
                        重置为默认预算
                      </button>
                    </div>
                  </div>
                </div>

                {showSaveMessage && (
                  <div className="alert alert-success mb-0">
                    ✅ 预算已保存到本地
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger mb-0">
                    ❌ {errorMessage}
                  </div>
                )}

                {/* 添加新预算项目表单 */}
                {showAddBudgetForm && (
                  <div className="card-body border-bottom">
                    <h6 className="mb-3">➕ 添加新预算项目</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">分类 *</label>
                        <select
                          className="form-select"
                          value={newBudgetItem.category}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, category: e.target.value})}
                        >
                          <option value="">请选择分类</option>
                          <option value="交通费">交通费</option>
                          <option value="住宿费">住宿费</option>
                          <option value="餐饮费">餐饮费</option>
                          <option value="门票费">门票费</option>
                          <option value="购物费">购物费</option>
                          <option value="娱乐费">娱乐费</option>
                          <option value="其他费用">其他费用</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">项目名称 *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newBudgetItem.item_name}
                          onChange={(e) => setNewBudgetItem({...newBudgetItem, item_name: e.target.value})}
                          placeholder="例如：高铁票"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">最低金额</label>
                        <div className="input-group">
                          <span className="input-group-text">¥</span>
                          <input
                            type="number"
                            className="form-control"
                            value={newBudgetItem.min_amount}
                            onChange={(e) => setNewBudgetItem({...newBudgetItem, min_amount: e.target.value})}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">推荐金额 *</label>
                        <div className="input-group">
                          <span className="input-group-text">¥</span>
                          <input
                            type="number"
                            className="form-control"
                            value={newBudgetItem.recommended_amount}
                            onChange={(e) => setNewBudgetItem({...newBudgetItem, recommended_amount: e.target.value})}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">最高金额</label>
                        <div className="input-group">
                          <span className="input-group-text">¥</span>
                          <input
                            type="number"
                            className="form-control"
                            value={newBudgetItem.max_amount}
                            onChange={(e) => setNewBudgetItem({...newBudgetItem, max_amount: e.target.value})}
                            placeholder="自动设置"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">描述</label>
                        <RichTextEditor
                          value={newBudgetItem.description}
                          onChange={(value) => setNewBudgetItem({...newBudgetItem, description: value})}
                          placeholder="详细描述这个预算项目..."
                          minHeight="80px"
                          showSaveButtons={false}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">省钱小贴士</label>
                        <RichTextEditor
                          value={newBudgetItem.tips}
                          onChange={(value) => setNewBudgetItem({...newBudgetItem, tips: value})}
                          placeholder="分享一些省钱小贴士..."
                          minHeight="60px"
                          showSaveButtons={false}
                        />
                      </div>
                      <div className="col-md-12">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={handleAddBudgetItem}
                          >
                            ✓ 添加
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={handleCancelAddBudget}
                          >
                            ✕ 取消
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-body">
                  <div className="row g-3">
                    {budgetData.map((item) => (
                      <div key={item.id} className="col-lg-4 col-md-6">
                        <div className="budget-item card h-100">
                          <div className="card-body">
                            <h6 className="card-title">{item.category}</h6>
                            <div className="budget-amount-container">
                              {editingItem === item.id ? (
                                <div className="budget-edit-container">
                                  <div className="input-group mb-2">
                                    <span className="input-group-text">¥</span>
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => handleInputChange(e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, item.id)}
                                      className="form-control"
                                      autoFocus
                                      placeholder="输入金额"
                                    />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => saveEdit(item.id)}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={cancelEditing}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  {errorMessage && (
                                    <div className="text-danger small mt-1">{errorMessage}</div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="budget-amount h4 text-primary cursor-pointer"
                                  onClick={() => startEditing(item)}
                                  title="点击编辑金额"
                                  style={{cursor: 'pointer'}}
                                >
                                  ¥{formatAmount(item.amount)}
                                </div>
                              )}
                            </div>
                            {editingBudgetDetail === item.id ? (
                              <div className="budget-detail-edit-container">
                                <RichTextEditor
                                  value={editingBudgetDetailValue}
                                  onChange={setEditingBudgetDetailValue}
                                  onSave={() => saveBudgetDetailEdit(item.id)}
                                  onCancel={cancelEditingBudgetDetail}
                                  placeholder="输入预算详细说明..."
                                  minHeight="60px"
                                  autoFocus={true}
                                />
                                {errorMessage && (
                                  <div className="text-danger small mt-1">{errorMessage}</div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p
                                  className="card-text text-muted small editable-field"
                                  style={{cursor: 'pointer'}}
                                  onClick={() => startEditingBudgetDetail(item.id, item.detail)}
                                  title="点击编辑备注"
                                  dangerouslySetInnerHTML={renderHTMLContent(item.detail)}
                                />
                                <div className="d-flex justify-content-end mt-2">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteBudgetItem(item.id)}
                                    title="删除此预算项目"
                                  >
                                    🗑️ 删除
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 总计行 */}
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-4">
                              <h5 className="mb-0">总计</h5>
                            </div>
                            <div className="col-md-4">
                              <h4 className="text-success mb-0">¥{formatAmount(totalAmount)}</h4>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-0">两人周末游预算</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 实际消费支出模块 */}
        <div className="actual-expense-section mt-5">
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h3 className="h5 mb-0">💳 实际消费支出</h3>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <small className="me-3">💡 点击金额记录实际花费</small>
                      <button
                        className="btn btn-outline-dark btn-sm me-2"
                        onClick={() => setShowAddExpenseForm(true)}
                      >
                        ➕ 添加支出记录
                      </button>
                      <button className="btn btn-outline-dark btn-sm" onClick={resetActualExpenseToDefault}>
                        重置消费记录
                      </button>
                    </div>
                  </div>
                </div>

                {showSaveMessage && (
                  <div className="alert alert-success mb-0">
                    ✅ 消费记录已保存到本地
                  </div>
                )}

                {/* 添加新支出记录表单 */}
                {showAddExpenseForm && (
                  <div className="card-body border-bottom">
                    <h6 className="mb-3">➕ 添加新支出记录</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">分类 *</label>
                        <select
                          className="form-select"
                          value={newExpenseItem.category}
                          onChange={(e) => setNewExpenseItem({...newExpenseItem, category: e.target.value})}
                        >
                          <option value="">请选择分类</option>
                          <option value="交通费">交通费</option>
                          <option value="住宿费">住宿费</option>
                          <option value="餐饮费">餐饮费</option>
                          <option value="门票费">门票费</option>
                          <option value="购物费">购物费</option>
                          <option value="娱乐费">娱乐费</option>
                          <option value="其他费用">其他费用</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">金额 *</label>
                        <div className="input-group">
                          <span className="input-group-text">¥</span>
                          <input
                            type="number"
                            className="form-control"
                            value={newExpenseItem.amount}
                            onChange={(e) => setNewExpenseItem({...newExpenseItem, amount: e.target.value})}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">日期</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newExpenseItem.date}
                          onChange={(e) => setNewExpenseItem({...newExpenseItem, date: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">时间</label>
                        <input
                          type="time"
                          className="form-control"
                          value={newExpenseItem.time}
                          onChange={(e) => setNewExpenseItem({...newExpenseItem, time: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">支付方式</label>
                        <select
                          className="form-select"
                          value={newExpenseItem.payment_method}
                          onChange={(e) => setNewExpenseItem({...newExpenseItem, payment_method: e.target.value})}
                        >
                          <option value="现金">现金</option>
                          <option value="支付宝">支付宝</option>
                          <option value="微信支付">微信支付</option>
                          <option value="银行卡">银行卡</option>
                          <option value="信用卡">信用卡</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">地点</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newExpenseItem.location}
                          onChange={(e) => setNewExpenseItem({...newExpenseItem, location: e.target.value})}
                          placeholder="消费地点"
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">描述 *</label>
                        <RichTextEditor
                          value={newExpenseItem.description}
                          onChange={(value) => setNewExpenseItem({...newExpenseItem, description: value})}
                          placeholder="详细描述这笔支出..."
                          minHeight="60px"
                          showSaveButtons={false}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">备注</label>
                        <RichTextEditor
                          value={newExpenseItem.notes}
                          onChange={(value) => setNewExpenseItem({...newExpenseItem, notes: value})}
                          placeholder="其他备注信息..."
                          minHeight="60px"
                          showSaveButtons={false}
                        />
                      </div>
                      <div className="col-md-12">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-warning"
                            onClick={handleAddExpenseItem}
                          >
                            ✓ 添加
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={handleCancelAddExpense}
                          >
                            ✕ 取消
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-body">
                  <div className="row g-3">
                    {actualExpenseData.map((item) => (
                      <div key={item.id} className="col-lg-4 col-md-6">
                        <div className="actual-expense-item card h-100">
                          <div className="card-body">
                            <h6 className="card-title">{item.category}</h6>
                            <div className="expense-amount-container">
                              {editingActualExpense === item.id ? (
                                <div className="expense-edit-container">
                                  <div className="input-group mb-2">
                                    <span className="input-group-text">¥</span>
                                    <input
                                      type="text"
                                      value={editingActualExpenseValue}
                                      onChange={(e) => handleActualExpenseInputChange(e.target.value)}
                                      onKeyDown={(e) => handleActualExpenseKeyPress(e, item.id)}
                                      className="form-control"
                                      autoFocus
                                      placeholder="输入实际金额"
                                    />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => saveActualExpenseEdit(item.id)}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={cancelEditingActualExpense}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  {errorMessage && (
                                    <div className="text-danger small mt-1">{errorMessage}</div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="expense-amount h4 text-warning cursor-pointer"
                                  onClick={() => startEditingActualExpense(item)}
                                  title="点击编辑实际金额"
                                  style={{cursor: 'pointer'}}
                                >
                                  ¥{formatAmount(item.amount)}
                                </div>
                              )}
                            </div>
                            {editingActualExpenseDetail === item.id ? (
                              <div className="actual-expense-detail-edit-container">
                                <RichTextEditor
                                  value={editingActualExpenseDetailValue}
                                  onChange={setEditingActualExpenseDetailValue}
                                  onSave={() => saveActualExpenseDetailEdit(item.id)}
                                  onCancel={cancelEditingActualExpenseDetail}
                                  placeholder="输入消费详细说明..."
                                  minHeight="60px"
                                  autoFocus={true}
                                />
                                {errorMessage && (
                                  <div className="text-danger small mt-1">{errorMessage}</div>
                                )}
                              </div>
                            ) : (
                              <p
                                className="card-text text-muted small editable-field"
                                style={{cursor: 'pointer'}}
                                onClick={() => startEditingActualExpenseDetail(item.id, item.detail)}
                                title="点击编辑说明"
                                dangerouslySetInnerHTML={renderHTMLContent(item.detail)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 实际消费总计行 */}
                    <div className="col-12">
                      <div className="card bg-warning bg-opacity-25">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-4">
                              <h5 className="mb-0">实际总计</h5>
                            </div>
                            <div className="col-md-4">
                              <h4 className="text-warning mb-0">¥{formatAmount(totalActualAmount)}</h4>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-0">
                                差异: <span className={totalDifference >= 0 ? 'text-danger' : 'text-success'}>
                                  {totalDifference >= 0 ? '+' : ''}¥{formatAmount(Math.abs(totalDifference))}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 预算vs实际对比分析 */}
        <div className="comparison-analysis-section mt-5">
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h3 className="h5 mb-0">📊 预算vs实际对比分析</h3>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {getComparisonData().map((item) => (
                      <div key={item.id} className="col-lg-6 col-md-12">
                        <div className="comparison-item card h-100">
                          <div className="card-body">
                            <h6 className="card-title">{item.category}</h6>
                            <div className="comparison-bars mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-muted">预算</span>
                                <span className="fw-bold text-primary">¥{formatAmount(item.amount)}</span>
                              </div>
                              <div className="progress mb-2" style={{height: '20px'}}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{width: '100%'}}
                                >
                                  预算 ¥{formatAmount(item.amount)}
                                </div>
                              </div>

                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-muted">实际</span>
                                <span className="fw-bold text-warning">¥{formatAmount(item.actualAmount)}</span>
                              </div>
                              <div className="progress mb-2" style={{height: '20px'}}>
                                <div
                                  className="progress-bar bg-warning"
                                  style={{width: item.amount > 0 ? `${Math.min((item.actualAmount / item.amount) * 100, 200)}%` : '0%'}}
                                >
                                  实际 ¥{formatAmount(item.actualAmount)}
                                </div>
                              </div>
                            </div>

                            <div className="comparison-summary">
                              <div className="d-flex justify-content-between">
                                <span>差异:</span>
                                <span className={item.difference >= 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                  {item.difference >= 0 ? '+' : ''}¥{formatAmount(Math.abs(item.difference))}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>比例:</span>
                                <span className={item.percentage >= 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                  {item.percentage >= 0 ? '+' : ''}{item.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 总体分析 */}
                  <div className="overall-analysis mt-4 p-3 bg-light rounded">
                    <h6 className="mb-3">📈 总体分析</h6>
                    <div className="row text-center">
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className="text-primary mb-1">¥{formatAmount(totalAmount)}</h5>
                          <small className="text-muted">预算总额</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className="text-warning mb-1">¥{formatAmount(totalActualAmount)}</h5>
                          <small className="text-muted">实际总额</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className={totalDifference >= 0 ? 'text-danger mb-1' : 'text-success mb-1'}>
                            {totalDifference >= 0 ? '+' : ''}¥{formatAmount(Math.abs(totalDifference))}
                          </h5>
                          <small className="text-muted">总差异</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className={totalDifference >= 0 ? 'text-danger mb-1' : 'text-success mb-1'}>
                            {totalAmount > 0 ? `${totalDifference >= 0 ? '+' : ''}${(((totalDifference / totalAmount) * 100)).toFixed(1)}%` : '0%'}
                          </h5>
                          <small className="text-muted">总比例</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 行程建议 */}
        <div className="plan-tips mt-5">
          <h3 className="text-center mb-4">🎯 行程建议</h3>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black">⏰ 时间安排</h4>
                  <p className="small text-muted">行程相对轻松，不会过于紧凑<br/>
                     可根据实际情况调整时间<br/>
                     重点是享受两人时光</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black" >🌤️ 天气准备</h4>
                  <p className="small text-muted">查看天气预报<br/>
                     准备合适的衣物<br/>
                     雨天备选室内活动</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black">📱 必备APP</h4>
                  <p className="small text-muted">高德地图、大众点评<br/>
                     12306、支付宝<br/>
                     相机APP记录美好</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black">🎒 行李清单</h4>
                  <p className="small text-muted">身份证、充电器<br/>
                     舒适的鞋子<br/>
                     少量现金和银行卡</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlan;
