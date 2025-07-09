import React, { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import './Header.css';

const Header = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const menuItems = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'plan', label: '行程安排', icon: '📅' },
    { id: 'transport', label: '交通指南', icon: '🚄' },
    { id: 'food', label: '美食推荐', icon: '🍜' },
    { id: 'accommodation', label: '住宿推荐', icon: '🏨' },
    { id: 'map', label: '地图导览', icon: '🗺️' }
  ];

  // 处理全局搜索结果选择
  const handleGlobalSearchResult = (result, targetPage) => {
    // 跳转到对应页面
    setActiveSection(targetPage);
    setIsMenuOpen(false);
    setShowSearch(false);

    // 可以在这里添加额外的逻辑，比如高亮显示搜索结果
    console.log('Global search result selected:', result, 'Target page:', targetPage);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🎒 南京→徐州 周末游</h1>
          <p>轻松愉快的双人旅行攻略</p>
        </div>

        {/* 全局搜索 */}
        <div className="header-search">
          <GlobalSearch
            onResultSelect={handleGlobalSearchResult}
            setActiveSection={setActiveSection}
          />
        </div>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
