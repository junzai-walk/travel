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
  }, []);

  // 保存数据到localStorage
  const saveBudgetData = (newBudgetData) => {
    localStorage.setItem('xuzhou-travel-budget', JSON.stringify(newBudgetData));
    setBudgetData(newBudgetData);
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

  const itinerary = [
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



  return (
    <div className="travel-plan">
      <div className="section-header">
        <h2>📅 行程安排</h2>
        <p>轻松愉快的徐州周末游，两天一夜精华体验</p>
      </div>

      <div className="itinerary-container">
        {itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="day-section">
            <div className="day-header">
              <div className="day-info">
                <h3>{day.day}</h3>
                <span className="date">{day.date}</span>
              </div>
              <h4 className="day-title">{day.title}</h4>
            </div>

            <div className="activities-timeline">
              {day.activities.map((activity, actIndex) => (
                <div key={actIndex} className="activity-item">
                  <div className="time-marker">
                    <span className="time">{activity.time}</span>
                    <div className="timeline-dot"></div>
                  </div>
                  
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-icon">{activity.icon}</span>
                      <h5>{activity.activity}</h5>
                    </div>
                    
                    <p className="activity-description">{activity.description}</p>
                    
                    <div className="activity-tips">
                      💡 {activity.tips}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="budget-section">
        <div className="budget-header">
          <h3>💰 预算参考</h3>
          <div className="budget-controls">
            <p className="budget-hint">💡 点击金额可以编辑自定义预算</p>
            <button className="reset-budget-btn" onClick={resetToDefault}>
              重置为默认预算
            </button>
          </div>
        </div>

        {showSaveMessage && (
          <div className="save-message">
            ✅ 预算已保存到本地
          </div>
        )}

        <div className="budget-container">
          <div className="budget-grid">
            {budgetData.map((item) => (
              <div key={item.id} className="budget-item">
                <div className="budget-category">{item.category}</div>
                <div className="budget-amount-container">
                  {editingItem === item.id ? (
                    <div className="budget-edit-container">
                      <div className="budget-input-wrapper">
                        <span className="currency-symbol">¥</span>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => handleInputChange(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, item.id)}
                          className="budget-input"
                          autoFocus
                          placeholder="输入金额"
                        />
                      </div>
                      <div className="budget-edit-buttons">
                        <button
                          className="save-btn"
                          onClick={() => saveEdit(item.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={cancelEditing}
                        >
                          ✕
                        </button>
                      </div>
                      {errorMessage && (
                        <div className="error-message">{errorMessage}</div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="budget-amount editable"
                      onClick={() => startEditing(item)}
                      title="点击编辑金额"
                    >
                      ¥{item.amount}
                    </div>
                  )}
                </div>
                <div className="budget-detail">{item.detail}</div>
              </div>
            ))}

            {/* 总计行 */}
            <div className="budget-item total">
              <div className="budget-category">总计</div>
              <div className="budget-amount">¥{totalAmount}</div>
              <div className="budget-detail">两人周末游预算</div>
            </div>
          </div>
        </div>
      </div>

      <div className="plan-tips">
        <h3>🎯 行程建议</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>⏰ 时间安排</h4>
            <p>行程相对轻松，不会过于紧凑<br/>
               可根据实际情况调整时间<br/>
               重点是享受两人时光</p>
          </div>
          <div className="tip-card">
            <h4>🌤️ 天气准备</h4>
            <p>查看天气预报<br/>
               准备合适的衣物<br/>
               雨天备选室内活动</p>
          </div>
          <div className="tip-card">
            <h4>📱 必备APP</h4>
            <p>高德地图、大众点评<br/>
               12306、支付宝<br/>
               相机APP记录美好</p>
          </div>
          <div className="tip-card">
            <h4>🎒 行李清单</h4>
            <p>身份证、充电器<br/>
               舒适的鞋子<br/>
               少量现金和银行卡</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPlan;
