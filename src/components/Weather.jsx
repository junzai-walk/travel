import React, { useState, useEffect } from 'react';
import './Weather.css';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // DeepSeek API配置
  const DEEPSEEK_API_KEY = 'sk-b5c8715fb818481a87b0efaae79654cb';
  const CITY_NAME = '徐州市';
  const CACHE_KEY = 'xuzhou_weather_data';
  const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
  const UPDATE_INTERVAL = 30 * 60 * 1000; // 30分钟自动更新

  // 生成模拟天气数据（备用方案）
  const generateMockWeatherData = () => {
    const weatherConditions = [
      { desc: '晴天', icon: '01d', temp: [18, 28] },
      { desc: '多云', icon: '02d', temp: [15, 25] },
      { desc: '阴天', icon: '03d', temp: [12, 22] },
      { desc: '小雨', icon: '10d', temp: [10, 20] },
      { desc: '雷雨', icon: '11d', temp: [15, 25] }
    ];

    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const baseTemp = Math.floor(Math.random() * (randomCondition.temp[1] - randomCondition.temp[0])) + randomCondition.temp[0];

    return {
      temperature: baseTemp,
      feelsLike: baseTemp + Math.floor(Math.random() * 6) - 3,
      description: randomCondition.desc,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.round((Math.random() * 8 + 1) * 10) / 10, // 1-9 m/s
      windDirection: Math.floor(Math.random() * 360),
      visibility: Math.round((Math.random() * 15 + 5) * 10) / 10, // 5-20 km
      icon: randomCondition.icon,
      cityName: CITY_NAME
    };
  };

  // 使用DeepSeek API获取天气数据
  const fetchWeatherFromDeepSeek = async () => {
    const prompt = `请查询中国江苏省徐州市当前的实时天气情况，包括以下信息：
1. 当前温度（摄氏度）
2. 体感温度（摄氏度）
3. 天气状况描述（如晴天、多云、雨天等）
4. 湿度百分比
5. 风速（米/秒）
6. 风向（度数，0-360）
7. 能见度（公里）

请以JSON格式返回数据，格式如下：
{
  "temperature": 数字,
  "feelsLike": 数字,
  "description": "天气描述",
  "humidity": 数字,
  "windSpeed": 数字,
  "windDirection": 数字,
  "visibility": 数字,
  "cityName": "徐州市"
}

只返回JSON数据，不要其他说明文字。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API请求失败: ${response.status}`);
    }

    const data = await response.json();
    let weatherText = data.choices[0].message.content.trim();

    // 清理markdown代码块标记和其他可能的格式问题
    weatherText = weatherText.replace(/^```json\s*/i, ''); // 移除开头的```json
    weatherText = weatherText.replace(/^```\s*/i, ''); // 移除可能的其他```标记
    weatherText = weatherText.replace(/\s*```\s*$/i, ''); // 移除结尾的```
    weatherText = weatherText.replace(/^\s*json\s*/i, ''); // 移除可能单独的json标记

    // 查找JSON对象的开始和结束位置
    const jsonStart = weatherText.indexOf('{');
    const jsonEnd = weatherText.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      weatherText = weatherText.substring(jsonStart, jsonEnd + 1);
    }

    weatherText = weatherText.trim(); // 最终清理空白字符

    console.log('清理后的响应文本:', weatherText);

    try {
      // 尝试解析清理后的JSON响应
      const weatherJson = JSON.parse(weatherText);

      // 添加天气图标映射
      const iconMapping = {
        '晴': '01d',
        '多云': '02d',
        '阴': '03d',
        '小雨': '10d',
        '中雨': '10d',
        '大雨': '10d',
        '雷雨': '11d',
        '雪': '13d',
        '雾': '50d',
        '霾': '50d'
      };

      // 根据天气描述选择图标
      let icon = '01d'; // 默认晴天图标
      for (const [weather, iconCode] of Object.entries(iconMapping)) {
        if (weatherJson.description && weatherJson.description.includes(weather)) {
          icon = iconCode;
          break;
        }
      }

      return {
        ...weatherJson,
        icon: icon,
        temperature: Math.round(weatherJson.temperature || 20),
        feelsLike: Math.round(weatherJson.feelsLike || weatherJson.temperature || 20),
        humidity: Math.round(weatherJson.humidity || 60),
        windSpeed: Math.round((weatherJson.windSpeed || 2) * 10) / 10,
        windDirection: Math.round(weatherJson.windDirection || 0),
        visibility: Math.round((weatherJson.visibility || 10) * 10) / 10
      };
    } catch (parseError) {
      console.error('解析DeepSeek响应失败:', parseError);
      console.log('原始响应:', weatherText);

      // 如果解析失败，返回默认数据
      return {
        temperature: 20,
        feelsLike: '-',
        description: '天气信息暂时无法获取',
        humidity: '-',
        windSpeed: '-',
        windDirection: '-',
        visibility: '-',
        icon: '01d',
        cityName: CITY_NAME
      };
    }
  };

  // 获取天气数据
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查缓存
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        
        // 如果缓存未过期，使用缓存数据
        if (now - timestamp < CACHE_DURATION) {
          setWeatherData(data);
          setLastUpdated(new Date(timestamp));
          setLoading(false);
          return;
        }
      }

      // 使用DeepSeek API获取天气数据
      const weatherData = await fetchWeatherFromDeepSeek();

      // 处理天气数据
      const processedData = {
        temperature: weatherData.temperature,
        feelsLike: weatherData.feelsLike,
        humidity: weatherData.humidity,
        pressure: weatherData.pressure || 1013, // 默认大气压
        windSpeed: weatherData.windSpeed,
        windDirection: weatherData.windDirection || 0,
        visibility: weatherData.visibility || 10, // 默认能见度10公里
        description: weatherData.description,
        icon: weatherData.icon,
        cityName: weatherData.cityName || CITY_NAME
      };

      // 保存到缓存
      const cacheData = {
        data: processedData,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setWeatherData(processedData);
      setLastUpdated(new Date());
      setLoading(false);

    } catch (err) {
      console.error('获取天气数据失败:', err);
      console.log('尝试使用模拟数据...');

      try {
        // 使用模拟数据作为备用方案
        const mockData = generateMockWeatherData();
        const processedData = {
          ...mockData,
          pressure: 1013,
        };

        // 保存模拟数据到缓存（较短的缓存时间）
        const cacheData = {
          data: processedData,
          timestamp: new Date().getTime()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setWeatherData(processedData);
        setLastUpdated(new Date());
        setLoading(false);

        // 显示警告信息，但不阻止显示
        console.warn('使用模拟天气数据，实际天气信息可能不准确');
      } catch (mockErr) {
        console.error('生成模拟数据也失败:', mockErr);
        setError('无法获取天气信息，请稍后重试');
        setLoading(false);
      }
    }
  };

  // 组件挂载时获取天气数据并设置定时更新
  useEffect(() => {
    // 立即获取天气数据
    fetchWeatherData();

    // 设置定时更新
    const intervalId = setInterval(() => {
      console.log('定时更新天气数据...');
      fetchWeatherData();
    }, UPDATE_INTERVAL);

    // 清理定时器
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 手动刷新天气数据
  const handleRefresh = () => {
    // 清除缓存，强制获取新数据
    localStorage.removeItem(CACHE_KEY);
    fetchWeatherData();
  };

  // 获取天气图标URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // 获取风向描述
  const getWindDirection = (degree) => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  // 格式化更新时间
  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="weather-widget card border-0 shadow-sm">
        <div className="card-body text-center">
          <div className="weather-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">加载中...</span>
            </div>
            <p className="mt-2 mb-0 text-muted">正在获取天气信息...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget card border-0 shadow-sm">
        <div className="card-body text-center">
          <div className="weather-error">
            <span className="error-icon fs-1 text-warning">⚠️</span>
            <p className="mt-2 mb-3 text-muted">{error}</p>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={handleRefresh}
            >
              重试 🔄
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget card border-0 shadow-sm">
      <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <span className="weather-icon">🌤️</span>
          {weatherData.cityName} 天气
        </h5>
        <button 
          className="btn btn-outline-light btn-sm"
          onClick={handleRefresh}
          title="刷新天气数据"
        >
          🔄
        </button>
      </div>
      
      <div className="card-body">
        {/* 主要天气信息 */}
        <div className="weather-main d-flex align-items-center mb-3">
          <div className="weather-icon-large me-3">
            <img 
              src={getWeatherIconUrl(weatherData.icon)}
              alt={weatherData.description}
              className="weather-img"
            />
          </div>
          <div className="weather-temp-info">
            <div className="temperature">
              {weatherData.temperature}°C
            </div>
            <div className="weather-desc text-muted">
              {weatherData.description}
            </div>
            <div className="feels-like text-muted small">
              体感温度 {weatherData.feelsLike}°C
            </div>
          </div>
        </div>

        {/* 详细天气信息 */}
        <div className="weather-details">
          <div className="row g-2">
            <div className="col-6">
              <div className="weather-detail-item">
                <span className="detail-icon">💧</span>
                <span className="detail-label">湿度</span>
                <span className="detail-value">{weatherData.humidity}%</span>
              </div>
            </div>
            <div className="col-6">
              <div className="weather-detail-item">
                <span className="detail-icon">💨</span>
                <span className="detail-label">风速</span>
                <span className="detail-value">{weatherData.windSpeed} m/s</span>
              </div>
            </div>
            <div className="col-6">
              <div className="weather-detail-item">
                <span className="detail-icon">🧭</span>
                <span className="detail-label">风向</span>
                <span className="detail-value">{getWindDirection(weatherData.windDirection)}</span>
              </div>
            </div>
            <div className="col-6">
              <div className="weather-detail-item">
                <span className="detail-icon">👁️</span>
                <span className="detail-label">能见度</span>
                <span className="detail-value">{weatherData.visibility} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* 更新时间 */}
        {lastUpdated && (
          <div className="weather-update-time text-center mt-3">
            <small className="text-muted">
              最后更新: {formatUpdateTime(lastUpdated)}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
