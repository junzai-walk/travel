import React, { useState, useEffect } from 'react';
import './Checklist.css';
import { api } from '../utils/axiosConfig.js';
import { useCategory } from '../contexts/CategoryContext';

const Checklist = () => {
  // 使用分类上下文
  const {
    categories,
    addCategory,
    deleteCategory,
    isDefaultCategory,
    isLoading: categoriesLoading
  } = useCategory();

  // 必备清单相关状态
  const [checklistData, setChecklistData] = useState([]);
  const [editingChecklistItem, setEditingChecklistItem] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // 自定义分类管理状态
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // 从API加载数据
  useEffect(() => {
    loadChecklistData();
  }, []);

  // 从API加载清单数据
  const loadChecklistData = async () => {
    try {
      const result = await api.get('/checklist');
      if (result.status === 'success' && result.data.items.length > 0) {
        // 转换API数据格式为前端格式
        const formattedData = result.data.items.map(item => ({
          id: item.id,
          item: item.item_name,
          checked: item.is_completed,
          category: item.category
        }));
        setChecklistData(formattedData);
      } else {
        // 如果没有数据，使用默认数据
        setChecklistData(getDefaultChecklist());
      }
    } catch (error) {
      console.error('从API加载清单数据失败:', error);
      setChecklistData(getDefaultChecklist());
    }
  };

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
    { id: 11, item: '防晒霜', checked: false, category: '洗护用品' },
    { id: 12, item: '湿纸巾', checked: false, category: '生活用品' }
  ];

  // 显示保存消息
  const showSaveMessageFunc = () => {
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  // 添加新分类
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('分类名称不能为空');
      return;
    }

    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
      setCategoryError('');
      showSaveMessageFunc();
    } catch (error) {
      setCategoryError(error.message);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (categoryName) => {
    if (window.confirm(`确定要删除分类"${categoryName}"吗？\n注意：删除分类不会删除该分类下的物品，这些物品将被移动到"自定义"分类。`)) {
      try {
        await deleteCategory(categoryName);

        // 将该分类下的物品移动到"自定义"分类
        const updatedChecklistData = checklistData.map(item =>
          item.category === categoryName ? { ...item, category: '自定义' } : item
        );
        setChecklistData(updatedChecklistData);

        // 更新后端数据
        for (const item of checklistData.filter(item => item.category === categoryName)) {
          try {
            await api.put(`/checklist/${item.id}`, {
              item_name: item.item,
              category: '自定义',
              priority: '中',
              is_completed: item.checked,
              notes: ''
            });
          } catch (error) {
            console.error('更新物品分类失败:', error);
          }
        }

        showSaveMessageFunc();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // 切换清单项目的勾选状态
  const toggleChecklistItem = async (itemId) => {
    try {
      const result = await api.patch(`/checklist/${itemId}/toggle`);
      if (result.status === 'success') {
        // 更新本地状态
        const newChecklistData = checklistData.map(item =>
          item.id === itemId ? { ...item, checked: result.data.is_completed } : item
        );
        setChecklistData(newChecklistData);
        showSaveMessageFunc();
      }
    } catch (error) {
      console.error('切换清单项目状态失败:', error);
    }
  };

  // 添加新的清单项目
  const addChecklistItem = async () => {
    if (newChecklistItem.trim() === '') return;
    if (newItemCategory === '') {
      alert('请选择物品分类');
      return;
    }

    try {
      const result = await api.post('/checklist', {
        item_name: newChecklistItem.trim(),
        category: newItemCategory,
        priority: '中',
        is_completed: false,
        notes: ''
      });

      if (result.status === 'success') {
        // 添加到本地状态
        const newItem = {
          id: result.data.id,
          item: result.data.item_name,
          checked: result.data.is_completed,
          category: result.data.category
        };
        setChecklistData([...checklistData, newItem]);
        setNewChecklistItem('');
        setNewItemCategory('');
        showSaveMessageFunc();
      } else {
        throw new Error('添加清单项目失败');
      }
    } catch (error) {
      console.error('添加清单项目失败:', error);
      alert(error.message || '添加失败，请重试');
    }
  };

  // 删除清单项目
  const deleteChecklistItem = async (itemId) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      try {
        const result = await api.delete(`/checklist/${itemId}`);
        if (result.status === 'success') {
          // 从本地状态中移除
          const newChecklistData = checklistData.filter(item => item.id !== itemId);
          setChecklistData(newChecklistData);
          showSaveMessageFunc();
        } else {
          throw new Error('删除清单项目失败');
        }
      } catch (error) {
        console.error('删除清单项目失败:', error);
        alert(error.message || '删除失败，请重试');
      }
    }
  };

  // 编辑清单项目
  const editChecklistItem = async (itemId, newText) => {
    if (newText.trim() === '') return;

    try {
      const item = checklistData.find(item => item.id === itemId);
      const result = await api.put(`/checklist/${itemId}`, {
        item_name: newText.trim(),
        category: item.category,
        priority: '中',
        is_completed: item.checked,
        notes: ''
      });

      if (result.status === 'success') {
        // 更新本地状态
        const newChecklistData = checklistData.map(item =>
          item.id === itemId ? { ...item, item: newText.trim() } : item
        );
        setChecklistData(newChecklistData);
        setEditingChecklistItem(null);
        showSaveMessageFunc();
      } else {
        throw new Error('编辑清单项目失败');
      }
    } catch (error) {
      console.error('编辑清单项目失败:', error);
      alert(error.message || '编辑失败，请重试');
    }
  };

  // 重置必备清单为默认数据
  const resetChecklistToDefault = async () => {
    if (window.confirm('确定要重置为默认清单吗？这将清除您的所有自定义修改。')) {
      try {
        // 首先删除所有现有数据
        for (const item of checklistData) {
          await api.delete(`/checklist/${item.id}`);
        }

        // 重新加载默认数据
        await loadChecklistData();
        showSaveMessageFunc();
      } catch (error) {
        console.error('重置清单失败:', error);
        alert(error.message || '重置失败，请重试');
      }
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

        {/* 分类管理 */}
        <div className="category-management mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0">🏷️ 分类管理</h5>
                </div>
                <div className="col-md-6 text-md-end">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                  >
                    {showAddCategory ? '取消' : '➕ 添加新分类'}
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {showAddCategory && (
                <div className="add-category-form mb-3 p-3 bg-light rounded">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          setCategoryError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        className={`form-control ${categoryError ? 'is-invalid' : ''}`}
                        placeholder="输入新分类名称..."
                      />
                      {categoryError && (
                        <div className="invalid-feedback">{categoryError}</div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-success w-100"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                      >
                        ✅ 创建分类
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="categories-list">
                <h6 className="mb-3">当前分类：</h6>
                <div className="row g-2">
                  {categories.map(category => (
                    <div key={category} className="col-auto">
                      <div className="category-tag d-flex align-items-center">
                        <span className="badge bg-secondary me-2 p-2">
                          {category}
                          {!isDefaultCategory(category) && (
                            <button
                              className="btn-close btn-close-white ms-2"
                              style={{ fontSize: '0.6em' }}
                              onClick={() => handleDeleteCategory(category)}
                              title={`删除分类: ${category}`}
                            ></button>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <small className="text-muted mt-2 d-block">
                  💡 系统默认分类不能删除，自定义分类可以删除
                </small>
              </div>
            </div>
          </div>
        </div>

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
                    disabled={categoriesLoading}
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
                    disabled={!newChecklistItem.trim() || !newItemCategory || categoriesLoading}
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
