import React from 'react';
import './Transportation.css';

const Transportation = () => {
  const transportOptions = [
    {
      type: '高铁（推荐）',
      icon: '🚄',
      duration: '1小时20分',
      price: '二等座 ¥89.5',
      frequency: '每30分钟一班',
      pros: ['速度快', '舒适度高', '准点率高'],
      cons: ['价格稍高'],
      schedule: [
        { time: '18:30', train: 'G1234', price: '¥89.5' },
        { time: '19:15', train: 'G5678', price: '¥89.5' },
        { time: '20:00', train: 'G9012', price: '¥89.5' }
      ]
    },
    {
      type: '普通火车',
      icon: '🚂',
      duration: '2小时30分',
      price: '硬座 ¥24.5',
      frequency: '每2小时一班',
      pros: ['价格便宜', '班次较多'],
      cons: ['时间较长', '舒适度一般'],
      schedule: [
        { time: '18:45', train: 'K1234', price: '¥24.5' },
        { time: '20:30', train: 'T5678', price: '¥35.5' }
      ]
    },
    {
      type: '长途汽车',
      icon: '🚌',
      duration: '3小时',
      price: '¥45-60',
      frequency: '每小时一班',
      pros: ['价格适中', '班次密集'],
      cons: ['时间最长', '受路况影响'],
      schedule: [
        { time: '18:00', station: '南京汽车客运站', price: '¥50' },
        { time: '19:00', station: '南京汽车客运站', price: '¥50' },
        { time: '20:00', station: '南京汽车客运站', price: '¥50' }
      ]
    }
  ];

  const localTransport = [
    {
      type: '地铁',
      icon: '🚇',
      coverage: '市区主要景点',
      price: '¥2-4',
      tips: '购买徐州地铁一日票更划算'
    },
    {
      type: '公交',
      icon: '🚌',
      coverage: '全市覆盖',
      price: '¥1-2',
      tips: '支持支付宝、微信支付'
    },
    {
      type: '出租车',
      icon: '🚕',
      coverage: '全市',
      price: '起步价¥8',
      tips: '建议使用滴滴等网约车'
    },
    {
      type: '共享单车',
      icon: '🚲',
      coverage: '市区景点周边',
      price: '¥1.5/30分钟',
      tips: '适合短距离游览'
    }
  ];

  return (
    <div className="transportation">
      <div className="section-header">
        <h2>🚄 交通指南</h2>
        <p>南京 ⇄ 徐州 往返交通 + 徐州市内交通</p>
      </div>

      <div className="transport-section">
        <h3>🎯 南京到徐州（周五晚上出发）</h3>
        <div className="transport-grid">
          {transportOptions.map((option, index) => (
            <div key={index} className="transport-card">
              <div className="transport-header">
                <span className="transport-icon">{option.icon}</span>
                <h4>{option.type}</h4>
              </div>
              
              <div className="transport-info">
                <div className="info-row">
                  <span>⏱️ 用时：</span>
                  <span>{option.duration}</span>
                </div>
                <div className="info-row">
                  <span>💰 价格：</span>
                  <span>{option.price}</span>
                </div>
                <div className="info-row">
                  <span>🕐 班次：</span>
                  <span>{option.frequency}</span>
                </div>
              </div>

              <div className="pros-cons">
                <div className="pros">
                  <h5>✅ 优点</h5>
                  <ul>
                    {option.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons">
                  <h5>❌ 缺点</h5>
                  <ul>
                    {option.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="schedule">
                <h5>🕐 周五晚班次</h5>
                {option.schedule.map((item, i) => (
                  <div key={i} className="schedule-item">
                    <span className="time" style={{color: '#000'}}>{item.time}</span>
                    <span className="train">{item.train || item.station}</span>
                    <span className="price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="transport-section">
        <h3>🏙️ 徐州市内交通</h3>
        <div className="local-transport-grid">
          {localTransport.map((transport, index) => (
            <div key={index} className="local-transport-card">
              <div className="transport-icon-large">{transport.icon}</div>
              <h4>{transport.type}</h4>
              <div className="transport-details">
                <p><strong>覆盖范围：</strong>{transport.coverage}</p>
                <p><strong>价格：</strong>{transport.price}</p>
                <p className="tips">💡 {transport.tips}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="transport-tips">
        <h3>🎯 出行建议</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🚄 推荐方案</h4>
            <p>高铁往返，市内地铁+步行+共享单车</p>
          </div>
          <div className="tip-card">
            <h4>💰 经济方案</h4>
            <p>普通火车往返，市内公交+步行</p>
          </div>
          <div className="tip-card">
            <h4>📱 实用APP</h4>
            <p>12306、滴滴出行、高德地图、支付宝</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transportation;
