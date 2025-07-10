import React, { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import './Header.css';

const Header = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const menuItems = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'checklist', label: '出行清单', icon: '📋' },
    { id: 'plan', label: '行程安排', icon: '📅' },
    { id: 'transport', label: '交通指南', icon: '🚄' },
    { id: 'food', label: '美食', icon: '🍜' },
    { id: 'accommodation', label: '住宿', icon: '🏨' },
    { id: 'map', label: '地图', icon: '🗺️' },
    { id: 'api-test', label: 'API测试', icon: '🧪' }
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
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid px-3">
          {/* Logo */}
          <div className="navbar-brand logo">
            <h1 className="mb-0">🎒 南京→徐州 周末游</h1>
            <p className="mb-0 d-none d-md-block" style={{textAlign:'center'}}>轻松愉快的双人旅行攻略</p>
          </div>

          {/* 移动端菜单切换按钮 */}
          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="切换导航菜单"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* 导航菜单 */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            {/* 全局搜索 */}
            <div className="mx-auto d-none d-lg-block" style={{maxWidth: '400px', width: '100%'}}>
              <GlobalSearch
                style={{display:'none'}}
                onResultSelect={handleGlobalSearchResult}
                setActiveSection={setActiveSection}
              />
            </div>

            {/* 导航项 */}
            <ul className="navbar-nav ms-auto">
              {menuItems.map(item => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-pill mx-1 ${
                      activeSection === item.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="nav-icon me-2">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* 移动端搜索 */}
            <div className="d-lg-none mt-3">
              <GlobalSearch
                onResultSelect={handleGlobalSearchResult}
                setActiveSection={setActiveSection}
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
