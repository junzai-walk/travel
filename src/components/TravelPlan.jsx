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

  // 行程编辑相关状态
  const [editingActivity, setEditingActivity] = useState(null); // 格式: {dayIndex, actIndex, field}
  const [editingActivityValue, setEditingActivityValue] = useState('');
  const [itineraryData, setItineraryData] = useState([]);

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

  // 保存行程数据到localStorage
  const saveItineraryData = (newItineraryData) => {
    localStorage.setItem('xuzhou-travel-itinerary', JSON.stringify(newItineraryData));
    setItineraryData(newItineraryData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  // 开始编辑行程活动
  const startEditingActivity = (dayIndex, actIndex, field, currentValue) => {
    setEditingActivity({ dayIndex, actIndex, field });
    setEditingActivityValue(currentValue);
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

    // 更新对应字段的值
    newItineraryData[dayIndex].activities[actIndex][field] = editingActivityValue;

    saveItineraryData(newItineraryData);
    setEditingActivity(null);
    setEditingActivityValue('');
  };

  // 处理行程编辑的键盘事件
  const handleActivityKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveActivityEdit();
    } else if (e.key === 'Escape') {
      cancelEditingActivity();
    }
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
                            <h3 className="h4 mb-0 me-3">{day.day}</h3>
                            <span className="badge bg-primary">{day.date}</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h4 className="h5 mb-0 text-md-end mt-2 mt-md-0">{day.title}</h4>
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
                              <textarea
                                value={editingActivityValue}
                                onChange={(e) => setEditingActivityValue(e.target.value)}
                                onKeyDown={handleActivityKeyPress}
                                className="form-control"
                                rows="3"
                                autoFocus
                                placeholder="活动描述"
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
                            <p
                              className="activity-description text-muted mb-3 editable-field"
                              style={{cursor: 'pointer'}}
                              onClick={() => startEditingActivity(dayIndex, actIndex, 'description', activity.description)}
                              title="点击编辑描述"
                            >
                              {activity.description}
                            </p>
                          )}

                          {editingActivity &&
                           editingActivity.dayIndex === dayIndex &&
                           editingActivity.actIndex === actIndex &&
                           editingActivity.field === 'tips' ? (
                            <div className="tips-edit-container">
                              <textarea
                                value={editingActivityValue}
                                onChange={(e) => setEditingActivityValue(e.target.value)}
                                onKeyDown={handleActivityKeyPress}
                                className="form-control"
                                rows="2"
                                autoFocus
                                placeholder="提示信息"
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
                            <div
                              className="activity-tips alert alert-info mb-0 editable-field"
                              style={{cursor: 'pointer'}}
                              onClick={() => startEditingActivity(dayIndex, actIndex, 'tips', activity.tips)}
                              title="点击编辑提示"
                            >
                              <small>💡 {activity.tips}</small>
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
                            <p className="card-text text-muted small">{item.detail}</p>
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
