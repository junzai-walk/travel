import React from 'react';
import './Food.css';

const Food = () => {
  const specialties = [
    {
      name: '徐州烙馍',
      icon: '🥞',
      description: '徐州最具代表性的小吃，薄如纸张，香脆可口',
      price: '¥5-8/张',
      rating: 4.8,
      mustTry: true,
      tips: '配菜丰富，可以包各种菜品'
    },
    {
      name: '羊肉汤',
      icon: '🍲',
      description: '徐州传统名菜，汤白如奶，肉嫩汤鲜',
      price: '¥25-35/碗',
      rating: 4.7,
      mustTry: true,
      tips: '早餐或午餐都很棒，配烧饼更香'
    },
    {
      name: '蜜三刀',
      icon: '🍯',
      description: '徐州传统糕点，外酥内软，甜而不腻',
      price: '¥15-20/盒',
      rating: 4.5,
      mustTry: false,
      tips: '适合作为伴手礼带回南京'
    },
    {
      name: '徐州米线',
      icon: '🍜',
      description: '当地特色米线，汤头浓郁，配菜丰富',
      price: '¥12-18/碗',
      rating: 4.4,
      mustTry: false,
      tips: '分量足，女生可以考虑小份'
    }
  ];

  const restaurants = [
    {
      name: '老徐州羊肉汤馆',
      type: '传统小吃',
      address: '云龙区民主南路128号',
      rating: 4.8,
      price: '¥20-40/人',
      specialty: '羊肉汤、烙馍',
      hours: '06:00-14:00',
      tips: '早去不排队，羊肉汤是招牌',
      distance: '距离云龙湖500米'
    },
    {
      name: '马市街小吃街',
      type: '小吃街',
      address: '鼓楼区马市街',
      rating: 4.6,
      price: '¥30-60/人',
      specialty: '各种徐州小吃',
      hours: '17:00-23:00',
      tips: '晚上最热闹，品种最全',
      distance: '市中心，交通便利'
    },
    {
      name: '淮海食府',
      type: '淮扬菜',
      address: '泉山区淮海西路88号',
      rating: 4.5,
      price: '¥80-120/人',
      specialty: '淮扬菜、徐州菜',
      hours: '11:00-21:00',
      tips: '环境好，适合情侣用餐',
      distance: '距离彭祖园1公里'
    },
    {
      name: '回味鸭血粉丝汤',
      type: '连锁快餐',
      address: '多个分店',
      rating: 4.3,
      price: '¥15-25/人',
      specialty: '鸭血粉丝汤',
      hours: '07:00-22:00',
      tips: '连锁店，口味稳定',
      distance: '各景点附近都有'
    }
  ];

  const foodAreas = [
    {
      name: '马市街小吃街',
      icon: '🏮',
      description: '徐州最著名的小吃街，汇集各种地方特色',
      highlights: ['烙馍', '羊肉汤', '蜜三刀', '米线'],
      bestTime: '晚上17:00-22:00',
      transport: '地铁1号线马市街站'
    },
    {
      name: '云龙湖美食街',
      icon: '🌊',
      description: '湖边美食街，环境优美，适合情侣用餐',
      highlights: ['湖鲜', '烧烤', '茶餐厅', '咖啡厅'],
      bestTime: '全天',
      transport: '公交到云龙湖站'
    },
    {
      name: '金鹰购物中心',
      icon: '🏢',
      description: '现代化商场，各种连锁餐厅和网红店',
      highlights: ['火锅', '日料', '西餐', '奶茶'],
      bestTime: '全天',
      transport: '地铁1号线彭城广场站'
    }
  ];

  return (
    <div className="food">
      <div className="section-header">
        <h2>🍜 美食推荐</h2>
        <p>品味徐州，从舌尖开始的旅行</p>
      </div>

      <div className="food-section">
        <h3>🏆 必尝特色美食</h3>
        <div className="specialties-grid">
          {specialties.map((food, index) => (
            <div key={index} className={`specialty-card ${food.mustTry ? 'must-try' : ''}`}>
              {food.mustTry && <div className="must-try-badge">必尝</div>}
              <div className="food-icon">{food.icon}</div>
              <h4>{food.name}</h4>
              <p className="description">{food.description}</p>
              <div className="food-info">
                <div className="price">{food.price}</div>
                <div className="rating">
                  ⭐ {food.rating}
                </div>
              </div>
              <div className="tips">💡 {food.tips}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="food-section">
        <h3>🏪 推荐餐厅</h3>
        <div className="restaurants-grid">
          {restaurants.map((restaurant, index) => (
            <div key={index} className="restaurant-card">
              <div className="restaurant-header">
                <h4>{restaurant.name}</h4>
                <span className="restaurant-type">{restaurant.type}</span>
              </div>
              
              <div className="restaurant-info">
                <div className="info-row">
                  <span>📍</span>
                  <span>{restaurant.address}</span>
                </div>
                <div className="info-row">
                  <span>⭐</span>
                  <span>{restaurant.rating} 分</span>
                </div>
                <div className="info-row">
                  <span>💰</span>
                  <span>{restaurant.price}</span>
                </div>
                <div className="info-row">
                  <span>🍽️</span>
                  <span>{restaurant.specialty}</span>
                </div>
                <div className="info-row">
                  <span>🕐</span>
                  <span>{restaurant.hours}</span>
                </div>
                <div className="info-row">
                  <span>🚇</span>
                  <span>{restaurant.distance}</span>
                </div>
              </div>
              
              <div className="restaurant-tips">
                💡 {restaurant.tips}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="food-section">
        <h3>🗺️ 美食聚集地</h3>
        <div className="food-areas-grid">
          {foodAreas.map((area, index) => (
            <div key={index} className="food-area-card">
              <div className="area-icon">{area.icon}</div>
              <h4>{area.name}</h4>
              <p>{area.description}</p>
              
              <div className="highlights">
                <h5>🌟 特色美食</h5>
                <div className="highlight-tags">
                  {area.highlights.map((item, i) => (
                    <span key={i} className="highlight-tag">{item}</span>
                  ))}
                </div>
              </div>
              
              <div className="area-info">
                <div className="info-item">
                  <strong>最佳时间：</strong>{area.bestTime}
                </div>
                <div className="info-item">
                  <strong>交通：</strong>{area.transport}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="food-tips">
        <h3>🎯 用餐建议</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🕐 用餐时间</h4>
            <p>早餐：羊肉汤配烧饼<br/>
               午餐：淮扬菜正餐<br/>
               晚餐：小吃街觅食</p>
          </div>
          <div className="tip-card">
            <h4>💰 预算建议</h4>
            <p>两人三餐约¥150-200<br/>
               包含特色小吃和正餐<br/>
               可适当增加预算品尝更多</p>
          </div>
          <div className="tip-card">
            <h4>📱 实用APP</h4>
            <p>大众点评、美团<br/>
               查看评价和优惠<br/>
               提前预订热门餐厅</p>
          </div>
        </div>
      </div>

      {/* 滚动测试区域 */}
      <div className="scroll-test-section" style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff8e1',
        borderRadius: '10px',
        border: '2px dashed #ffcc02'
      }}>
        <h3 style={{ color: '#f57c00', marginBottom: '20px' }}>🍜 美食页面滚动测试</h3>
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4>🧪 测试步骤</h4>
          <p>验证美食推荐页面的滚动重置功能：</p>
          <ol>
            <li>滚动到这个橙色测试区域</li>
            <li>切换到其他页面（交通指南、住宿推荐等）</li>
            <li>再次点击"美食推荐"回到本页面</li>
            <li>页面应该显示顶部内容，而不是这个测试区域</li>
          </ol>
        </div>

        {/* 生成美食相关的测试内容 */}
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{
            padding: '15px',
            margin: '10px 0',
            backgroundColor: i % 2 === 0 ? '#ffffff' : '#fef7e0',
            borderRadius: '8px',
            border: '1px solid #ffcc02'
          }}>
            <h4>🍽️ 美食测试内容 {i + 1}</h4>
            <p>这是美食推荐页面的测试内容块 {i + 1}。</p>
            <p>包含了徐州特色美食的相关信息和推荐。</p>
            <p>如果页面切换后还能看到这个内容，说明滚动位置没有正确重置。</p>
          </div>
        ))}

        <div style={{
          padding: '20px',
          backgroundColor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <h4>🎉 美食推荐页面底部</h4>
          <p>恭喜！您已经浏览完了所有美食推荐内容。</p>
          <p>现在请测试页面切换的滚动重置功能吧！</p>
        </div>
      </div>
    </div>
  );
};

export default Food;
