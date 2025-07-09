import React from 'react';
import './Home.css';

const Home = ({ setActiveSection }) => {
  const highlights = [
    {
      icon: '🚄',
      title: '便捷交通',
      description: '高铁1小时20分钟直达，周末游的完美选择',
      action: () => setActiveSection('transport')
    },
    {
      icon: '🍜',
      title: '特色美食',
      description: '徐州烙馍、羊肉汤等地道美食等你品尝',
      action: () => setActiveSection('food')
    },
    {
      icon: '🌊',
      title: '美丽风景',
      description: '云龙湖畔漫步，感受徐州的山水之美',
      action: () => setActiveSection('plan')
    },
    {
      icon: '🏨',
      title: '舒适住宿',
      description: '精选性价比酒店，让旅行更加舒适',
      action: () => setActiveSection('accommodation')
    }
  ];

  const quickStats = [
    { label: '旅行时长', value: '2天2夜', icon: '📅' },
    { label: '预算参考', value: '¥1543', icon: '💰' },
    { label: '交通方式', value: '高铁', icon: '🚄' },
    { label: '适合人群', value: '情侣', icon: '💕' }
  ];

  const featuredSpots = [
    {
      name: '云龙湖风景区',
      image: '🌊',
      rating: 4.8,
      description: '徐州最美的湖泊，湖光山色，适合散步拍照'
    },
    {
      name: '马市街小吃街',
      image: '🍜',
      rating: 4.7,
      description: '徐州最著名的小吃街，汇集各种地方特色'
    },
    {
      name: '彭祖园',
      image: '🏛️',
      rating: 4.5,
      description: '了解徐州历史文化，园林景观优美'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container-fluid">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6 col-md-12">
              <div className="hero-content">
                <h1 className="hero-title">
                  <span className="title-main d-block">南京 → 徐州</span>
                  <span className="title-sub d-block">周末浪漫之旅</span>
                </h1>
                <p className="hero-description">
                  轻松愉快的双人旅行攻略，用心规划的两天一夜精华体验
                </p>
                <div className="hero-actions d-flex flex-wrap gap-3">
                  <button
                    className="btn btn-light btn-lg cta-button primary"
                    onClick={() => setActiveSection('plan')}
                  >
                    查看行程安排 📅
                  </button>
                  <button
                    className="btn btn-outline-light btn-lg cta-button secondary"
                    onClick={() => setActiveSection('map')}
                  >
                    地图导览 🗺️
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 d-flex justify-content-center">
              <div className="hero-visual">
                <div className="travel-route">
                  <div className="city start">
                    <span className="city-icon">🏙️</span>
                    <span className="city-name">南京</span>
                  </div>
                  <div className="route-line">
                    <span className="transport-icon">🚄</span>
                    <div className="line"></div>
                  </div>
                  <div className="city end">
                    <span className="city-icon">🌊</span>
                    <span className="city-name">徐州</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="quick-stats py-5">
        <div className="container">
          <div className="row g-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6 col-sm-6">
                <div className="stat-card card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <span className="stat-icon fs-1 mb-3 d-block">{stat.icon}</span>
                    <div className="stat-info">
                      <div className="stat-value h4 mb-1">{stat.value}</div>
                      <div className="stat-label text-muted">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights py-5 bg-light">
        <div className="container">
          <h2 className="section-title text-center mb-5">✨ 旅行亮点</h2>
          <div className="row g-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div
                  className="highlight-card card h-100 border-0 shadow-sm cursor-pointer"
                  onClick={highlight.action}
                  style={{cursor: 'pointer'}}
                >
                  <div className="card-body text-center p-4">
                    <div className="highlight-icon fs-1 mb-3">{highlight.icon}</div>
                    <h3 className="h5 mb-3">{highlight.title}</h3>
                    <p className="text-muted mb-3">{highlight.description}</p>
                    <div className="card-arrow text-primary">→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spots */}
      <section className="featured-spots py-5">
        <div className="container">
          <h2 className="section-title text-center mb-5">🌟 精选景点</h2>
          <div className="row g-4">
            {featuredSpots.map((spot, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="spot-card card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="spot-image text-center fs-1 mb-3">{spot.image}</div>
                    <div className="spot-content">
                      <h3 className="h5 mb-2">{spot.name}</h3>
                      <div className="spot-rating text-warning mb-2">
                        ⭐ {spot.rating} 分
                      </div>
                      <p className="text-muted mb-0">{spot.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="travel-tips py-5 bg-light">
        <div className="container">
          <h2 className="section-title text-center mb-5">💡 贴心提醒</h2>
          <div className="row g-4">
            <div className="col-lg-6 col-md-6">
              <div className="tip-item d-flex align-items-start p-3">
                <span className="tip-icon fs-2 me-3">📱</span>
                <div className="tip-content">
                  <h4 className="h6 mb-2">提前准备</h4>
                  <p className="text-muted mb-0">建议提前1-2周预订高铁票和酒店，周末价格会有所上涨</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="tip-item d-flex align-items-start p-3">
                <span className="tip-icon fs-2 me-3">🌤️</span>
                <div className="tip-content">
                  <h4 className="h6 mb-2">天气关注</h4>
                  <p className="text-muted mb-0">出发前查看天气预报，准备合适的衣物和雨具</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="tip-item d-flex align-items-start p-3">
                <span className="tip-icon fs-2 me-3">💳</span>
                <div className="tip-content">
                  <h4 className="h6 mb-2">支付方式</h4>
                  <p className="text-muted mb-0">大部分地方支持移动支付，建议准备少量现金备用</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="tip-item d-flex align-items-start p-3">
                <span className="tip-icon fs-2 me-3">📸</span>
                <div className="tip-content">
                  <h4 className="h6 mb-2">记录美好</h4>
                  <p className="text-muted mb-0">别忘了充电宝和相机，记录下美好的旅行时光</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="final-cta py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="cta-content">
                <h2 className="mb-3">准备好开始你们的徐州之旅了吗？</h2>
                <p className="lead mb-4">点击下方按钮，开始详细的行程规划</p>
                <button
                  className="btn btn-primary btn-lg px-5 py-3"
                  onClick={() => setActiveSection('plan')}
                >
                  开始规划行程 🎒
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
