import React, { useState, useEffect } from 'react';
import './TravelPlan.css';

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

  // 实际消费支出相关状态
  const [actualExpenseData, setActualExpenseData] = useState([]);
  const [editingActualExpense, setEditingActualExpense] = useState(null);
  const [editingActualExpenseValue, setEditingActualExpenseValue] = useState('');

  // 实际消费详细说明编辑相关状态
  const [editingActualExpenseDetail, setEditingActualExpenseDetail] = useState(null);
  const [editingActualExpenseDetailValue, setEditingActualExpenseDetailValue] = useState('');

  // 行程编辑相关状态
  const [editingActivity, setEditingActivity] = useState(null); // 格式: {dayIndex, actIndex, field}
  const [editingActivityValue, setEditingActivityValue] = useState('');
  const [itineraryData, setItineraryData] = useState([]);

  // 标题编辑相关状态
  const [editingTitle, setEditingTitle] = useState(null); // 格式: {dayIndex, field} field可以是'day', 'date', 'title'
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // 富文本编辑相关状态
  const [selectedText, setSelectedText] = useState('');
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({ start: 0, end: 0 });
  const [isSelectionBold, setIsSelectionBold] = useState(false);



  // 从localStorage加载数据
  useEffect(() => {
    const savedBudget = localStorage.getItem('xuzhou-travel-budget');
    if (savedBudget) {
      try {
        const parsedBudget = JSON.parse(savedBudget);
        setBudgetData(parsedBudget);
      } catch (error) {
        console.error('Error loading budget data:', error);
      }
    }

    // 加载行程数据
    const savedItinerary = localStorage.getItem('xuzhou-travel-itinerary');
    if (savedItinerary) {
      try {
        const parsedItinerary = JSON.parse(savedItinerary);
        setItineraryData(parsedItinerary);
      } catch (error) {
        console.error('Error loading itinerary data:', error);
        setItineraryData(getDefaultItinerary());
      }
    } else {
      setItineraryData(getDefaultItinerary());
    }

    // 加载实际消费数据
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


  }, []);



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
  };

  // 保存实际消费数据到localStorage
  const saveActualExpenseData = (newActualExpenseData) => {
    localStorage.setItem('xuzhou-travel-actual-expense', JSON.stringify(newActualExpenseData));
    setActualExpenseData(newActualExpenseData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
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
  const saveEdit = (itemId) => {
    const numValue = parseFloat(editValue);

    // 验证输入
    if (isNaN(numValue) || numValue < 0) {
      setErrorMessage('请输入有效的正数');
      return;
    }

    if (numValue > 99999) {
      setErrorMessage('金额不能超过99999');
      return;
    }

    // 更新数据
    const newBudgetData = budgetData.map(item =>
      item.id === itemId ? { ...item, amount: numValue } : item
    );

    saveBudgetData(newBudgetData);
    setEditingItem(null);
    setEditValue('');
    setErrorMessage('');
  };

  // 重置为默认预算
  const resetToDefault = () => {
    if (window.confirm('确定要重置为默认预算吗？这将清除您的所有自定义修改。')) {
      localStorage.removeItem('xuzhou-travel-budget');
      setBudgetData(defaultBudgetData);
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
    }
  };

  // 计算总计
  const totalAmount = budgetData.reduce((sum, item) => sum + item.amount, 0);
  const totalActualAmount = actualExpenseData.reduce((sum, item) => sum + item.amount, 0);
  const totalDifference = totalActualAmount - totalAmount;

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
  const saveBudgetDetailEdit = (itemId) => {
    if (editingBudgetDetailValue.trim() === '') {
      setErrorMessage('备注不能为空');
      return;
    }

    // 更新数据
    const newBudgetData = budgetData.map(item =>
      item.id === itemId ? { ...item, detail: editingBudgetDetailValue.trim() } : item
    );

    saveBudgetData(newBudgetData);
    setEditingBudgetDetail(null);
    setEditingBudgetDetailValue('');
    setErrorMessage('');
  };

  // 处理预算备注编辑的键盘事件
  const handleBudgetDetailKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveBudgetDetailEdit(itemId);
    } else if (e.key === 'Escape') {
      cancelEditingBudgetDetail();
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
  const saveActualExpenseEdit = (itemId) => {
    const numValue = parseFloat(editingActualExpenseValue);

    // 验证输入
    if (isNaN(numValue) || numValue < 0) {
      setErrorMessage('请输入有效的正数');
      return;
    }

    if (numValue > 99999) {
      setErrorMessage('金额不能超过99999');
      return;
    }

    // 更新数据
    const newActualExpenseData = actualExpenseData.map(item =>
      item.id === itemId ? { ...item, amount: numValue } : item
    );

    saveActualExpenseData(newActualExpenseData);
    setEditingActualExpense(null);
    setEditingActualExpenseValue('');
    setErrorMessage('');
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
  const resetActualExpenseToDefault = () => {
    if (window.confirm('确定要重置实际消费数据吗？这将清除您的所有记录。')) {
      localStorage.removeItem('xuzhou-travel-actual-expense');
      setActualExpenseData(getDefaultActualExpenseData());
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
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
  const saveActualExpenseDetailEdit = (itemId) => {
    if (editingActualExpenseDetailValue.trim() === '') {
      setErrorMessage('说明不能为空');
      return;
    }

    // 更新数据
    const newActualExpenseData = actualExpenseData.map(item =>
      item.id === itemId ? { ...item, detail: editingActualExpenseDetailValue.trim() } : item
    );

    saveActualExpenseData(newActualExpenseData);
    setEditingActualExpenseDetail(null);
    setEditingActualExpenseDetailValue('');
    setErrorMessage('');
  };

  // 处理实际消费详细说明编辑的键盘事件
  const handleActualExpenseDetailKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      saveActualExpenseDetailEdit(itemId);
    } else if (e.key === 'Escape') {
      cancelEditingActualExpenseDetail();
    }
  };

  // 保存行程数据到localStorage
  const saveItineraryData = (newItineraryData) => {
    localStorage.setItem('xuzhou-travel-itinerary', JSON.stringify(newItineraryData));
    setItineraryData(newItineraryData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  // 开始编辑行程活动
  const startEditingActivity = (dayIndex, actIndex, field, currentValue) => {
    setEditingActivity({ dayIndex, actIndex, field, originalHtml: currentValue });
    setEditingActivityValue(currentValue || '');

    // 重置选择状态
    setIsSelectionBold(false);
    setCurrentSelection({ start: 0, end: 0 });

    // 对于富文本字段，需要在下一个渲染周期设置HTML内容
    if (field === 'description' || field === 'tips') {
      setTimeout(() => {
        setEditableContent(currentValue || '');
      }, 10);
    }
  };

  // 取消编辑行程活动
  const cancelEditingActivity = () => {
    setEditingActivity(null);
    setEditingActivityValue('');
  };

  // 保存行程活动编辑
  const saveActivityEdit = () => {
    if (!editingActivity) return;

    const { dayIndex, actIndex, field } = editingActivity;
    const newItineraryData = [...itineraryData];

    // 对于富文本字段，从contentEditable元素获取HTML内容
    let valueToSave = editingActivityValue;
    if (field === 'description' || field === 'tips') {
      valueToSave = getEditableContent() || editingActivityValue;
    }

    // 更新对应字段的值
    newItineraryData[dayIndex].activities[actIndex][field] = valueToSave;

    saveItineraryData(newItineraryData);
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



  // 获取默认行程数据
  const getDefaultItinerary = () => [
    {
      day: '周五',
      date: '7月18日',
      title: '出发日 - 南京到徐州',
      activities: [
        {
          time: '19:30',
          activity: '南京南站集合',
          description: '提前1小时到达，取票安检',
          tips: 'G2700次高铁，建议提前网上购票',
          icon: '🚄'
        },
        {
          time: '20:31',
          activity: '乘坐高铁G2700',
          description: '南京南 → 徐州东，约1小时34分钟',
          tips: '可以在车上休息，准备第二天的行程',
          icon: '🚄'
        },
        {
          time: '22:05',
          activity: '到达徐州东站',
          description: '出站后乘坐地铁或打车前往酒店',
          tips: '地铁1号线可直达市区，约30分钟',
          icon: '🏨'
        },
        {
          time: '22:40',
          activity: '季末轻居酒店入住',
          description: '办理入住手续，稍作休息',
          tips: '酒店位于人民广场地铁站附近，交通便利',
          icon: '🛏️'
        },
        {
          time: '23:00',
          activity: '附近觅食',
          description: '寻找附近的夜宵或小吃',
          tips: '可以尝试徐州烙馍或羊肉汤',
          icon: '🍜'
        }
      ]
    },
    {
      day: '周六',
      date: '全天',
      title: '徐州深度游',
      activities: [
        {
          time: '08:00',
          activity: '酒店早餐',
          description: '享用丰盛的早餐，为一天的行程做准备',
          tips: '如果酒店没有早餐，可以去附近吃羊肉汤',
          icon: '🥐'
        },
        {
          time: '09:00',
          activity: '云龙湖风景区',
          description: '徐州最美的景点，湖光山色，适合散步拍照',
          tips: '建议租借共享单车环湖，约2-3小时',
          icon: '🌊'
        },
        {
          time: '12:00',
          activity: '湖边午餐',
          description: '在云龙湖附近的餐厅享用午餐',
          tips: '推荐淮海食府，环境好适合情侣',
          icon: '🍽️'
        },
        {
          time: '14:00',
          activity: '彭祖园',
          description: '了解徐州历史文化，园林景观优美',
          tips: '适合慢慢游览，拍照留念',
          icon: '🏛️'
        },
        {
          time: '16:00',
          activity: '马市街小吃街',
          description: '品尝各种徐州特色小吃',
          tips: '不要吃太饱，留肚子尝试更多美食',
          icon: '🍡'
        },
        {
          time: '18:00',
          activity: '徐州博物馆',
          description: '了解徐州深厚的历史文化',
          tips: '周六延长开放时间，可以慢慢参观',
          icon: '🏛️'
        },
        {
          time: '20:00',
          activity: '晚餐时光',
          description: '选择一家有特色的餐厅享用晚餐',
          tips: '可以选择有情调的餐厅，增进感情',
          icon: '🍷'
        }
      ]
    },
    {
      day: '周日',
      date: '7月20日',
      title: '返程日 - 轻松游览',
      activities: [
        {
          time: '09:00',
          activity: '酒店退房',
          description: '整理行李，办理退房手续',
          tips: '可以把行李寄存在酒店，轻松游览',
          icon: '🧳'
        },
        {
          time: '09:30',
          activity: '户部山古建筑群',
          description: '徐州历史文化街区，古色古香',
          tips: '适合拍照，了解徐州传统建筑',
          icon: '🏘️'
        },
        {
          time: '11:00',
          activity: '购买特产',
          description: '购买徐州特产作为伴手礼',
          tips: '蜜三刀、牛蒡茶都是不错的选择',
          icon: '🛍️'
        },
        {
          time: '12:00',
          activity: '最后一餐',
          description: '享用徐州的最后一顿美食',
          tips: '可以再次品尝最喜欢的徐州菜',
          icon: '🍜'
        },
        {
          time: '14:30',
          activity: '前往徐州站',
          description: '取行李，前往徐州站（注意是徐州站不是徐州东站）',
          tips: '预留充足时间，K347次火车从徐州站发车',
          icon: '🚇'
        },
        {
          time: '15:38',
          activity: '返程火车K347',
          description: '徐州站 → 南京站，约4小时13分钟',
          tips: '可以在车上整理照片，回味旅程',
          icon: '🚄'
        },
        {
          time: '19:51',
          activity: '到达南京站',
          description: '愉快的徐州之旅结束',
          tips: '记得分享旅行的美好回忆',
          icon: '🏠'
        }
      ]
    }
  ];

  // 重置行程为默认数据
  const resetItineraryToDefault = () => {
    if (window.confirm('确定要重置为默认行程吗？这将清除您的所有自定义修改。')) {
      localStorage.removeItem('xuzhou-travel-itinerary');
      setItineraryData(getDefaultItinerary());
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
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
            <button className="btn btn-outline-primary btn-sm" onClick={resetItineraryToDefault}>
              重置为默认行程
            </button>
          </div>
        </div>

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
                                      {['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
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
                                      {['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
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
                                    {['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
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
                              <h5
                                className="mb-0 editable-field"
                                style={{cursor: 'pointer'}}
                                onClick={() => startEditingActivity(dayIndex, actIndex, 'activity', activity.activity)}
                                title="点击编辑活动名称"
                              >
                                {activity.activity}
                              </h5>
                            )}
                          </div>

                          {editingActivity &&
                           editingActivity.dayIndex === dayIndex &&
                           editingActivity.actIndex === actIndex &&
                           editingActivity.field === 'description' ? (
                            <div className="description-edit-container mb-3">
                              <div
                                contentEditable
                                onInput={(e) => {
                                  const html = e.target.innerHTML;
                                  setEditingActivityValue(html);
                                }}
                                onKeyDown={handleActivityKeyPress}
                                onMouseUp={handleTextSelection}
                                onKeyUp={handleTextSelection}
                                onSelect={handleTextSelection}
                                className="form-control wysiwyg-editor"
                                style={{
                                  minHeight: '100px',
                                  padding: '8px 12px',
                                  border: '1px solid #ced4da',
                                  borderRadius: '0.375rem',
                                  outline: 'none'
                                }}
                                suppressContentEditableWarning={true}
                                data-placeholder="活动描述（所见即所得编辑）"
                              />
                              {/* 富文本编辑工具栏 */}
                              <div className="format-toolbar mb-2 p-2 bg-light rounded">
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
                                    {/* <span className="small me-2">颜色:</span> */}
                                    {/* 红橙黄绿青蓝紫 */}
                                    {['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
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
                              <div
                                contentEditable
                                onInput={(e) => {
                                  const html = e.target.innerHTML;
                                  setEditingActivityValue(html);
                                }}
                                onKeyDown={handleActivityKeyPress}
                                onMouseUp={handleTextSelection}
                                onKeyUp={handleTextSelection}
                                onSelect={handleTextSelection}
                                className="form-control wysiwyg-editor"
                                style={{
                                  minHeight: '80px',
                                  padding: '8px 12px',
                                  border: '1px solid #ced4da',
                                  borderRadius: '0.375rem',
                                  outline: 'none'
                                }}
                                suppressContentEditableWarning={true}
                                data-placeholder="提示信息（所见即所得编辑）"
                              />
                              {/* 富文本编辑工具栏 */}
                              <div className="format-toolbar mb-2 p-2 bg-light rounded">
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
                                    {/* <span className="small me-2">颜色:</span> */}
                                    {['#dc3545', '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#0d6efd', '#6f42c1'].map(color => (
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
                                  ¥{item.amount}
                                </div>
                              )}
                            </div>
                            {editingBudgetDetail === item.id ? (
                              <div className="budget-detail-edit-container">
                                <input
                                  type="text"
                                  value={editingBudgetDetailValue}
                                  onChange={(e) => setEditingBudgetDetailValue(e.target.value)}
                                  onKeyDown={(e) => handleBudgetDetailKeyPress(e, item.id)}
                                  className="form-control form-control-sm"
                                  autoFocus
                                  placeholder="输入预算详细说明..."
                                />
                                <div className="d-flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => saveBudgetDetailEdit(item.id)}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelEditingBudgetDetail}
                                  >
                                    ✕
                                  </button>
                                </div>
                                {errorMessage && (
                                  <div className="text-danger small mt-1">{errorMessage}</div>
                                )}
                              </div>
                            ) : (
                              <p
                                className="card-text text-muted small editable-field"
                                style={{cursor: 'pointer'}}
                                onClick={() => startEditingBudgetDetail(item.id, item.detail)}
                                title="点击编辑备注"
                              >
                                {item.detail}
                              </p>
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
                              <h4 className="text-success mb-0">¥{totalAmount}</h4>
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
                                  ¥{item.amount}
                                </div>
                              )}
                            </div>
                            {editingActualExpenseDetail === item.id ? (
                              <div className="actual-expense-detail-edit-container">
                                <input
                                  type="text"
                                  value={editingActualExpenseDetailValue}
                                  onChange={(e) => setEditingActualExpenseDetailValue(e.target.value)}
                                  onKeyDown={(e) => handleActualExpenseDetailKeyPress(e, item.id)}
                                  className="form-control form-control-sm"
                                  autoFocus
                                  placeholder="输入消费详细说明..."
                                />
                                <div className="d-flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => saveActualExpenseDetailEdit(item.id)}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={cancelEditingActualExpenseDetail}
                                  >
                                    ✕
                                  </button>
                                </div>
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
                              >
                                {item.detail}
                              </p>
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
                              <h4 className="text-warning mb-0">¥{totalActualAmount}</h4>
                            </div>
                            <div className="col-md-4">
                              <p className="text-muted mb-0">
                                差异: <span className={totalDifference >= 0 ? 'text-danger' : 'text-success'}>
                                  {totalDifference >= 0 ? '+' : ''}¥{totalDifference}
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
                                <span className="fw-bold text-primary">¥{item.amount}</span>
                              </div>
                              <div className="progress mb-2" style={{height: '20px'}}>
                                <div
                                  className="progress-bar bg-primary"
                                  style={{width: '100%'}}
                                >
                                  预算 ¥{item.amount}
                                </div>
                              </div>

                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-muted">实际</span>
                                <span className="fw-bold text-warning">¥{item.actualAmount}</span>
                              </div>
                              <div className="progress mb-2" style={{height: '20px'}}>
                                <div
                                  className="progress-bar bg-warning"
                                  style={{width: item.amount > 0 ? `${Math.min((item.actualAmount / item.amount) * 100, 200)}%` : '0%'}}
                                >
                                  实际 ¥{item.actualAmount}
                                </div>
                              </div>
                            </div>

                            <div className="comparison-summary">
                              <div className="d-flex justify-content-between">
                                <span>差异:</span>
                                <span className={item.difference >= 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                  {item.difference >= 0 ? '+' : ''}¥{item.difference}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>比例:</span>
                                <span className={item.percentage >= 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                  {item.percentage >= 0 ? '+' : ''}{item.percentage}%
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
                          <h5 className="text-primary mb-1">¥{totalAmount}</h5>
                          <small className="text-muted">预算总额</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className="text-warning mb-1">¥{totalActualAmount}</h5>
                          <small className="text-muted">实际总额</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className={totalDifference >= 0 ? 'text-danger mb-1' : 'text-success mb-1'}>
                            {totalDifference >= 0 ? '+' : ''}¥{totalDifference}
                          </h5>
                          <small className="text-muted">总差异</small>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="analysis-item">
                          <h5 className={totalAmount > 0 && ((totalDifference / totalAmount) * 100) >= 0 ? 'text-danger mb-1' : 'text-success mb-1'}>
                            {totalAmount > 0 ? `${totalDifference >= 0 ? '+' : ''}${Math.round(((totalDifference / totalAmount) * 100) * 100) / 100}%` : '0%'}
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
