import React, { useState, useEffect } from 'react';
import './Checklist.css';

const Checklist = () => {
  // 必备清单相关状态
  const [checklistData, setChecklistData] = useState([]);
  const [editingChecklistItem, setEditingChecklistItem] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // 可用的分类选项
  const categories = [
    '证件类', '电子设备', '衣物类', '生活用品', '财务类', 
    '医疗用品', '食物类', '护肤用品', '自定义'
  ];

  // 从localStorage加载数据
  useEffect(() => {
    const savedChecklist = localStorage.getItem('xuzhou-travel-checklist');
    if (savedChecklist) {
      try {
        const parsedChecklist = JSON.parse(savedChecklist);
        setChecklistData(parsedChecklist);
      } catch (error) {
        console.error('Error loading checklist data:', error);
        setChecklistData(getDefaultChecklist());
      }
    } else {
      setChecklistData(getDefaultChecklist());
    }
  }, []);

  // 获取默认必备清单数据
  const getDefaultChecklist = () => [
    { id: 1, item: '身份证', checked: false, category: '证件类' },
    { id: 2, item: '手机充电器', checked: false, category: '电子设备' },
    { id: 3, item: '换洗衣物', checked: false, category: '衣物类' },
    { id: 4, item: '洗漱用品', checked: false, category: '生活用品' },
    { id: 5, item: '现金和银行卡', checked: false, category: '财务类' },
    { id: 6, item: '舒适的鞋子', checked: false, category: '衣物类' },
    { id: 7, item: '雨伞', checked: false, category: '生活用品' },
    { id: 8, item: '常用药品', checked: false, category: '医疗用品' },
    { id: 9, item: '相机或拍照设备', checked: false, category: '电子设备' },
    { id: 10, item: '零食和水', checked: false, category: '食物类' },
    { id: 11, item: '防晒霜', checked: false, category: '护肤用品' },
    { id: 12, item: '湿纸巾', checked: false, category: '生活用品' }
  ];

  // 保存必备清单数据到localStorage
  const saveChecklistData = (newChecklistData) => {
    localStorage.setItem('xuzhou-travel-checklist', JSON.stringify(newChecklistData));
    setChecklistData(newChecklistData);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  // 切换清单项目的勾选状态
  const toggleChecklistItem = (itemId) => {
    const newChecklistData = checklistData.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    saveChecklistData(newChecklistData);
  };

  // 添加新的清单项目
  const addChecklistItem = () => {
    if (newChecklistItem.trim() === '') return;
    if (newItemCategory === '') {
      alert('请选择物品分类');
      return;
    }

    const newItem = {
      id: Date.now(),
      item: newChecklistItem.trim(),
      checked: false,
      category: newItemCategory
    };

    const newChecklistData = [...checklistData, newItem];
    saveChecklistData(newChecklistData);
    setNewChecklistItem('');
    setNewItemCategory('');
  };

  // 删除清单项目
  const deleteChecklistItem = (itemId) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      const newChecklistData = checklistData.filter(item => item.id !== itemId);
      saveChecklistData(newChecklistData);
    }
  };

  // 编辑清单项目
  const editChecklistItem = (itemId, newText) => {
    if (newText.trim() === '') return;
    const newChecklistData = checklistData.map(item =>
      item.id === itemId ? { ...item, item: newText.trim() } : item
    );
    saveChecklistData(newChecklistData);
    setEditingChecklistItem(null);
  };

  // 重置必备清单为默认数据
  const resetChecklistToDefault = () => {
    if (window.confirm('确定要重置为默认清单吗？这将清除您的所有自定义修改。')) {
      localStorage.removeItem('xuzhou-travel-checklist');
      setChecklistData(getDefaultChecklist());
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
    }
  };

  // 按分类分组清单数据
  const groupedChecklistData = () => {
    const grouped = {};
    checklistData.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  return (
    <div className="checklist">
      <div className="container py-5">
        <div className="section-header text-center mb-5">
          <h2 className="display-5 mb-3">📋 出行清单</h2>
          <p className="lead text-muted">徐州旅行必备物品清单，确保不遗漏重要物品</p>
          <div className="mt-3">
            <small className="text-muted me-3">💡 勾选已准备的物品，点击物品名称可编辑</small>
            <button className="btn btn-outline-primary btn-sm" onClick={resetChecklistToDefault}>
              重置为默认清单
            </button>
          </div>
        </div>

        {showSaveMessage && (
          <div className="alert alert-success text-center">
            ✅ 清单已保存到本地
          </div>
        )}

        {/* 添加新项目 */}
        <div className="add-item-section mb-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">➕ 添加新物品</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                    className="form-control"
                    placeholder="输入物品名称..."
                  />
                </div>
                <div className="col-md-4">
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="">选择分类</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100"
                    onClick={addChecklistItem}
                    disabled={!newChecklistItem.trim() || !newItemCategory}
                  >
                    ➕ 添加物品
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 按分类显示清单项目 */}
        <div className="checklist-categories">
          {Object.entries(groupedChecklistData()).map(([category, items]) => (
            <div key={category} className="category-section mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h5 className="mb-0">{category}</h5>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <small className="text-muted">
                        {items.filter(item => item.checked).length} / {items.length} 已准备
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {items.map((item) => (
                      <div key={item.id} className="col-lg-4 col-md-6">
                        <div className={`checklist-item card h-100 ${item.checked ? 'checked' : ''}`}>
                          <div className="card-body d-flex align-items-center">
                            <div className="form-check me-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleChecklistItem(item.id)}
                                id={`checklist-${item.id}`}
                              />
                            </div>
                            <div className="flex-grow-1">
                              {editingChecklistItem === item.id ? (
                                <div className="edit-item-container">
                                  <input
                                    type="text"
                                    defaultValue={item.item}
                                    onBlur={(e) => editChecklistItem(item.id, e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        editChecklistItem(item.id, e.target.value);
                                      }
                                    }}
                                    className="form-control form-control-sm"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div
                                  className={`item-text ${item.checked ? 'text-decoration-line-through text-muted' : ''}`}
                                  onClick={() => setEditingChecklistItem(item.id)}
                                  style={{cursor: 'pointer'}}
                                  title="点击编辑"
                                >
                                  {item.item}
                                </div>
                              )}
                            </div>
                            <button
                              className="btn btn-outline-danger btn-sm ms-2"
                              onClick={() => deleteChecklistItem(item.id)}
                              title="删除项目"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="checklist-stats mt-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">📊 清单统计</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <h6 className="mb-1">总计物品</h6>
                  <span className="h4 text-primary">{checklistData.length}</span>
                </div>
                <div className="col-md-4">
                  <h6 className="mb-1">已准备</h6>
                  <span className="h4 text-success">{checklistData.filter(item => item.checked).length}</span>
                </div>
                <div className="col-md-4">
                  <h6 className="mb-1">完成度</h6>
                  <span className="h4 text-info">
                    {checklistData.length > 0 ? Math.round((checklistData.filter(item => item.checked).length / checklistData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
