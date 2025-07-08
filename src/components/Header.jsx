import React, { useState } from 'react';
import './Header.css';

const Header = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'plan', label: '行程安排', icon: '📅' },
    { id: 'transport', label: '交通指南', icon: '🚄' },
    { id: 'food', label: '美食推荐', icon: '🍜' },
    { id: 'accommodation', label: '住宿推荐', icon: '🏨' },
    { id: 'map', label: '地图导览', icon: '🗺️' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🎒 南京→徐州 周末游</h1>
          <p>轻松愉快的双人旅行攻略</p>
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
