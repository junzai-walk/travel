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
    <div className="food bg-light min-vh-100">
      <div className="container py-5">
        <div className="section-header text-center mb-5">
          <h2 className="display-5 mb-3">🍜 美食推荐</h2>
          <p className="lead text-muted">品味徐州，从舌尖开始的旅行</p>
        </div>

        {/* 必尝特色美食 */}
        <div className="food-section mb-5">
          <h3 className="text-center mb-4">🏆 必尝特色美食</h3>
          <div className="row g-4">
            {specialties.map((food, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className={`specialty-card card h-100 border-0 shadow-sm position-relative ${food.mustTry ? 'must-try' : ''}`}>
                  {food.mustTry && (
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-danger">必尝</span>
                    </div>
                  )}
                  <div className="card-body text-center">
                    <div className="food-icon fs-1 mb-3">{food.icon}</div>
                    <h4 className="h5 mb-3">{food.name}</h4>
                    <p className="text-muted mb-3">{food.description}</p>
                    <div className="food-info d-flex justify-content-between align-items-center mb-3">
                      <div className="price text-success fw-bold">{food.price}</div>
                      <div className="rating text-warning">
                        ⭐ {food.rating}
                      </div>
                    </div>
                    <div className="tips alert alert-info mb-0">
                      <small>💡 {food.tips}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 推荐餐厅 */}
        <div className="food-section mb-5">
          <h3 className="text-center mb-4">🏪 推荐餐厅</h3>
          <div className="row g-4">
            {restaurants.map((restaurant, index) => (
              <div key={index} className="col-lg-6">
                <div className="restaurant-card card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="restaurant-header d-flex justify-content-between align-items-start mb-3">
                      <h4 className="h5 mb-0">{restaurant.name}</h4>
                      <span className="badge bg-primary">{restaurant.type}</span>
                    </div>

                    <div className="restaurant-info">
                      <div className="row g-2 mb-2">
                        <div className="col-12">
                          <small className="text-muted">
                            <span className="me-2">📍</span>
                            {restaurant.address}
                          </small>
                        </div>
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <small className="text-muted">
                            <span className="me-2">⭐</span>
                            {restaurant.rating} 分
                          </small>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">
                            <span className="me-2">💰</span>
                            {restaurant.price}
                          </small>
                        </div>
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-12">
                          <small className="text-muted">
                            <span className="me-2">🍽️</span>
                            {restaurant.specialty}
                          </small>
                        </div>
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <small className="text-muted">
                            <span className="me-2">🕐</span>
                            {restaurant.hours}
                          </small>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">
                            <span className="me-2">🚇</span>
                            {restaurant.distance}
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="restaurant-tips alert alert-info mb-0 mt-3">
                      <small>💡 {restaurant.tips}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 美食聚集地 */}
        <div className="food-section mb-5">
          <h3 className="text-center mb-4">🗺️ 美食聚集地</h3>
          <div className="row g-4">
            {foodAreas.map((area, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="food-area-card card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="area-icon fs-1 mb-3">{area.icon}</div>
                    <h4 className="h5 mb-3">{area.name}</h4>
                    <p className="text-muted mb-3">{area.description}</p>

                    <div className="highlights mb-3">
                      <h5 className="h6 mb-2">🌟 特色美食</h5>
                      <div className="highlight-tags d-flex flex-wrap justify-content-center gap-1">
                        {area.highlights.map((item, i) => (
                          <span key={i} className="badge bg-secondary">{item}</span>
                        ))}
                      </div>
                    </div>

                    <div className="area-info text-start">
                      <div className="info-item mb-2">
                        <small className="text-muted">
                          <strong>最佳时间：</strong>{area.bestTime}
                        </small>
                      </div>
                      <div className="info-item">
                        <small className="text-muted">
                          <strong>交通：</strong>{area.transport}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 用餐建议 */}
        <div className="food-tips">
          <h3 className="text-center mb-4">🎯 用餐建议</h3>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black">🕐 用餐时间</h4>
                  <p className="small text-muted">早餐：羊肉汤配烧饼<br/>
                     午餐：淮扬菜正餐<br/>
                     晚餐：小吃街觅食</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black">💰 预算建议</h4>
                  <p className="small text-muted">两人三餐约¥150-200<br/>
                     包含特色小吃和正餐<br/>
                     可适当增加预算品尝更多</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="tip-card card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <h4 className="h6 mb-3 black">📱 实用APP</h4>
                  <p className="small text-muted">大众点评、美团<br/>
                     查看评价和优惠<br/>
                     提前预订热门餐厅</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Food;
