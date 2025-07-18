import React, { useState, useEffect, useRef } from 'react';
import { iconCategories, getAllIcons, searchIcons, getIconByKey } from '../utils/iconData';
import './IconSelector.css';

const IconSelector = ({
  currentIcon,
  onIconSelect,
  onClose,
  isOpen,
  position = 'center',
  error = null
}) => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIcons, setFilteredIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // 获取当前图标的信息
  const getCurrentIconInfo = () => {
    if (!currentIcon) return null;
    
    // 如果是emoji，直接返回
    if (typeof currentIcon === 'string' && currentIcon.length <= 2) {
      return { display: currentIcon, type: 'emoji' };
    }
    
    // 如果是React图标key
    if (typeof currentIcon === 'string') {
      const IconComponent = getIconByKey(currentIcon);
      return IconComponent ? { 
        display: <IconComponent />, 
        type: 'react',
        key: currentIcon 
      } : null;
    }
    
    return null;
  };

  // 初始化图标列表
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setTimeout(() => {
        updateFilteredIcons();
        setIsLoading(false);
        // 聚焦搜索框
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, selectedCategory, searchQuery]);

  // 更新过滤后的图标列表
  const updateFilteredIcons = () => {
    let icons = [];
    
    if (searchQuery.trim()) {
      icons = searchIcons(searchQuery);
    } else if (selectedCategory === '全部') {
      icons = getAllIcons();
    } else {
      const categoryData = iconCategories[selectedCategory];
      if (categoryData) {
        icons = categoryData.icons.map(iconData => ({
          ...iconData,
          category: selectedCategory,
          categoryColor: categoryData.color
        }));
      }
    }
    
    setFilteredIcons(icons);
  };

  // 处理图标选择
  const handleIconSelect = (iconData) => {
    onIconSelect(iconData.key);
    onClose();
  };

  // 处理搜索
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setSelectedCategory('全部'); // 搜索时切换到全部分类
  };

  // 处理分类选择
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchQuery(''); // 选择分类时清空搜索
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentIconInfo = getCurrentIconInfo();
  const categories = ['全部', ...Object.keys(iconCategories)];

  return (
    <div className="icon-selector-overlay">
      <div 
        ref={modalRef}
        className={`icon-selector-modal ${position}`}
        role="dialog"
        aria-labelledby="icon-selector-title"
        aria-modal="true"
      >
        <div className="icon-selector-header">
          <h5 id="icon-selector-title" className="mb-0">
            🎨 选择图标
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="关闭"
          ></button>
        </div>

        <div className="icon-selector-body">
          {/* 错误提示 */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => {}} aria-label="关闭"></button>
            </div>
          )}

          {/* 当前图标显示 */}
          {currentIconInfo && (
            <div className="current-icon-display">
              <span className="current-icon-label">当前图标：</span>
              <span className="current-icon">
                {currentIconInfo.display}
              </span>
            </div>
          )}

          {/* 搜索框 */}
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text">
                🔍
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="form-control"
                placeholder="搜索图标..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 分类选择 */}
          <div className="category-tabs">
            <div className="nav nav-pills nav-fill">
              {categories.map(category => (
                <button
                  key={category}
                  className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    backgroundColor: selectedCategory === category && category !== '全部' 
                      ? iconCategories[category]?.color 
                      : undefined
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 图标网格 */}
          <div className="icons-container">
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">加载中...</span>
                </div>
                <p className="mt-2">加载图标中...</p>
              </div>
            ) : filteredIcons.length > 0 ? (
              <div className="icons-grid">
                {filteredIcons.map((iconData, index) => {
                  const IconComponent = iconData.icon;
                  const isSelected = currentIconInfo?.key === iconData.key;
                  
                  return (
                    <div
                      key={`${iconData.key}-${index}`}
                      className={`icon-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleIconSelect(iconData)}
                      title={`${iconData.name} (${iconData.category})`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleIconSelect(iconData);
                        }
                      }}
                    >
                      <div className="icon-wrapper">
                        <IconComponent />
                      </div>
                      <div className="icon-name">{iconData.name}</div>
                      {selectedCategory === '全部' && (
                        <div 
                          className="icon-category"
                          style={{ color: iconData.categoryColor }}
                        >
                          {iconData.category}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-icons-found">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p className="text-muted">
                  {searchQuery ? `未找到包含 "${searchQuery}" 的图标` : '该分类暂无图标'}
                </p>
                {searchQuery && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setSearchQuery('')}
                  >
                    清空搜索
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="icon-selector-footer">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {filteredIcons.length > 0 && `共 ${filteredIcons.length} 个图标`}
            </small>
            <div>
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={onClose}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconSelector;
