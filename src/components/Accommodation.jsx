import React from 'react';
import './Accommodation.css';

const Accommodation = () => {
  const hotels = [
    {
      name: '季末轻居酒店(泉山区人民广场地铁站店)',
      type: '精品商务酒店',
      rating: 4.6,
      price: '¥249/晚',
      location: '泉山区',
      distance: '人民广场地铁站步行2分钟',
      features: ['地铁直达', '现代装修', '24小时前台', '免费WiFi'],
      pros: ['地理位置优越', '交通极其便利', '性价比高', '服务贴心'],
      cons: ['房间相对紧凑'],
      suitable: '注重交通便利的旅客',
      booking: '美团、携程、飞猪',
      image: '🏨',
      recommended: true
    },
    {
      name: '徐州苏宁凯悦酒店',
      type: '五星级酒店',
      rating: 4.8,
      price: '¥480-680/晚',
      location: '云龙区',
      distance: '距离云龙湖500米',
      features: ['豪华装修', '湖景房', '健身房', '游泳池'],
      pros: ['位置绝佳', '设施完善', '服务优质'],
      cons: ['价格较高'],
      suitable: '预算充足的情侣',
      booking: '携程、飞猪、官网',
      image: '🏨'
    },
    {
      name: '汉庭酒店(徐州火车站店)',
      type: '经济型酒店',
      rating: 4.5,
      price: '¥180-250/晚',
      location: '鼓楼区',
      distance: '距离火车站200米',
      features: ['交通便利', '干净整洁', '24小时前台'],
      pros: ['性价比高', '交通方便', '连锁品牌'],
      cons: ['房间较小', '设施一般'],
      suitable: '注重性价比的旅客',
      booking: '汉庭官网、美团、携程',
      image: '🏢'
    },
    {
      name: '徐州云龙湖民宿',
      type: '精品民宿',
      rating: 4.6,
      price: '¥280-380/晚',
      location: '云龙区',
      distance: '云龙湖畔',
      features: ['湖景阳台', '温馨装修', '免费早餐', '管家服务'],
      pros: ['环境优美', '体验独特', '性价比好'],
      cons: ['房源有限', '需提前预订'],
      suitable: '喜欢特色体验的情侣',
      booking: '爱彼迎、小猪短租',
      image: '🏡'
    },
    {
      name: '7天连锁酒店(彭祖园店)',
      type: '经济型酒店',
      rating: 4.3,
      price: '¥150-200/晚',
      location: '泉山区',
      distance: '距离彭祖园300米',
      features: ['经济实惠', '位置便利', '标准化服务'],
      pros: ['价格便宜', '位置不错', '预订方便'],
      cons: ['设施简单', '隔音一般'],
      suitable: '预算有限的旅客',
      booking: '7天官网、各大平台',
      image: '🏨'
    }
  ];

  const areas = [
    {
      name: '云龙湖区域',
      icon: '🌊',
      description: '徐州最美的区域，湖光山色，环境优美',
      advantages: ['风景优美', '空气清新', '适合散步'],
      disadvantages: ['距离市中心稍远', '晚上较安静'],
      transport: '公交便利，打车约15分钟到市中心',
      recommended: '情侣度假首选'
    },
    {
      name: '火车站区域',
      icon: '🚄',
      description: '交通枢纽，往返南京最方便',
      advantages: ['交通便利', '商业繁华', '餐饮丰富'],
      disadvantages: ['人流量大', '相对嘈杂'],
      transport: '高铁、火车、地铁都很方便',
      recommended: '注重交通便利的旅客'
    },
    {
      name: '市中心区域',
      icon: '🏙️',
      description: '商业中心，购物娱乐一应俱全',
      advantages: ['购物方便', '美食众多', '夜生活丰富'],
      disadvantages: ['价格稍高', '停车困难'],
      transport: '地铁、公交四通八达',
      recommended: '喜欢热闹的年轻人'
    }
  ];

  const bookingTips = [
    {
      platform: '携程旅行',
      icon: '✈️',
      features: ['酒店选择多', '价格透明', '评价真实'],
      tips: '会员有额外折扣，可以看实拍图片'
    },
    {
      platform: '美团酒店',
      icon: '🛍️',
      features: ['本地优势', '优惠活动多', '配送服务'],
      tips: '经常有限时特价，适合临时预订'
    },
    {
      platform: '飞猪旅行',
      icon: '🐷',
      features: ['阿里生态', '信用住', '积分优惠'],
      tips: '支付宝用户优惠多，信用好可免押金'
    },
    {
      platform: '爱彼迎',
      icon: '🏠',
      features: ['民宿特色', '体验独特', '性价比高'],
      tips: '适合寻找特色住宿，注意查看评价'
    }
  ];

  return (
    <div className="accommodation">
      <div className="section-header">
        <h2>🏨 住宿推荐</h2>
        <p>舒适住宿，让旅行更加完美</p>
      </div>

      <div className="accommodation-section">
        <h3>🏆 精选酒店推荐</h3>
        <div className="hotels-grid">
          {hotels.map((hotel, index) => (
            <div key={index} className={`hotel-card ${hotel.recommended ? 'recommended' : ''}`}>
              {hotel.recommended && (
                <div className="recommended-badge">
                  ⭐ 本次推荐
                </div>
              )}
              <div className="hotel-header">
                <div className="hotel-icon">{hotel.image}</div>
                <div className="hotel-basic">
                  <h4>{hotel.name}</h4>
                  <span className="hotel-type">{hotel.type}</span>
                  <div className="rating">
                    ⭐ {hotel.rating} 分
                  </div>
                </div>
                <div className="price-tag">{hotel.price}</div>
              </div>

              <div className="hotel-info">
                <div className="location-info">
                  <span>📍 {hotel.location}</span>
                  <span>🚇 {hotel.distance}</span>
                </div>

                <div className="features">
                  <h5>🌟 特色设施</h5>
                  <div className="feature-tags">
                    {hotel.features.map((feature, i) => (
                      <span key={i} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                </div>

                <div className="pros-cons">
                  <div className="pros">
                    <h5>✅ 优点</h5>
                    <ul>
                      {hotel.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons">
                    <h5>❌ 缺点</h5>
                    <ul>
                      {hotel.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="hotel-recommendation">
                  <strong>适合：</strong>{hotel.suitable}
                </div>

                <div className="booking-info">
                  <strong>预订平台：</strong>{hotel.booking}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="accommodation-section">
        <h3>🗺️ 住宿区域选择</h3>
        <div className="areas-grid">
          {areas.map((area, index) => (
            <div key={index} className="area-card">
              <div className="area-icon">{area.icon}</div>
              <h4>{area.name}</h4>
              <p>{area.description}</p>

              <div className="area-details">
                <div className="advantages">
                  <h5>✅ 优势</h5>
                  <ul>
                    {area.advantages.map((advantage, i) => (
                      <li key={i}>{advantage}</li>
                    ))}
                  </ul>
                </div>

                <div className="disadvantages">
                  <h5>❌ 劣势</h5>
                  <ul>
                    {area.disadvantages.map((disadvantage, i) => (
                      <li key={i}>{disadvantage}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="area-info">
                <div className="transport-info">
                  <strong>🚇 交通：</strong>{area.transport}
                </div>
                <div className="recommendation">
                  <strong>💡 推荐：</strong>{area.recommended}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="accommodation-section">
        <h3>📱 预订平台推荐</h3>
        <div className="booking-platforms">
          {bookingTips.map((platform, index) => (
            <div key={index} className="platform-card">
              <div className="platform-header">
                <span className="platform-icon">{platform.icon}</span>
                <h4>{platform.platform}</h4>
              </div>
              
              <div className="platform-features">
                {platform.features.map((feature, i) => (
                  <span key={i} className="feature-badge">{feature}</span>
                ))}
              </div>
              
              <div className="platform-tips">
                💡 {platform.tips}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="accommodation-tips">
        <h3>🎯 预订建议</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>📅 预订时间</h4>
            <p>提前1-2周预订<br/>
               周末价格会上涨<br/>
               节假日需更早预订</p>
          </div>
          <div className="tip-card">
            <h4>💰 预算分配</h4>
            <p>经济型：¥150-250/晚<br/>
               舒适型：¥250-400/晚<br/>
               豪华型：¥400+/晚</p>
          </div>
          <div className="tip-card">
            <h4>🔍 选择要点</h4>
            <p>查看真实评价<br/>
               确认退改政策<br/>
               关注位置交通</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accommodation;
