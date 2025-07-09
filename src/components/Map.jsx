import React, { useEffect, useRef, useState } from 'react';
import SearchComponent from './SearchComponent';
import { globalSearchEngine } from '../utils/searchData';
import './Map.css';

const Map = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);

  // 搜索相关状态 - 使用新的搜索系统
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);

  // 自定义标记相关状态
  const [customMarkers, setCustomMarkers] = useState([]);
  const [showAddMarkerModal, setShowAddMarkerModal] = useState(false);
  const [newMarkerData, setNewMarkerData] = useState({
    lat: null,
    lng: null,
    note: '',
    type: 'favorite',
    color: 'red'
  });

  // 地图标记引用
  const [mapMarkers, setMapMarkers] = useState([]);
  const [highlightedMarker, setHighlightedMarker] = useState(null);
  const [editingMarker, setEditingMarker] = useState(null);

  // 标记类型配置
  const markerTypes = [
    { id: 'favorite', name: '喜欢', icon: '❤️', color: 'red' },
    { id: 'plan', name: '计划去', icon: '⭐', color: 'blue' },
    { id: 'visited', name: '已去过', icon: '✅', color: 'green' },
    { id: 'recommend', name: '推荐', icon: '👍', color: 'orange' },
    { id: 'note', name: '备注', icon: '📝', color: 'purple' }
  ];

  const pois = [
    {
      id: 1,
      name: '云龙湖风景区',
      type: '景点',
      lat: 34.2611,
      lng: 117.2847,
      description: '徐州最美的湖泊，适合散步和拍照',
      rating: 4.8,
      tips: '建议租借共享单车环湖游览',
      icon: '🌊'
    },
    {
      id: 2,
      name: '彭祖园',
      type: '景点',
      lat: 34.2156,
      lng: 117.1836,
      description: '了解徐州历史文化的好地方',
      rating: 4.5,
      tips: '园林景观优美，适合慢慢游览',
      icon: '🏛️'
    },
    {
      id: 3,
      name: '徐州博物馆',
      type: '景点',
      lat: 34.2043,
      lng: 117.2847,
      description: '了解徐州深厚的历史文化',
      rating: 4.6,
      tips: '免费参观，需要提前预约',
      icon: '🏛️'
    },
    {
      id: 4,
      name: '户部山古建筑群',
      type: '景点',
      lat: 34.2667,
      lng: 117.1847,
      description: '徐州历史文化街区',
      rating: 4.4,
      tips: '古色古香，适合拍照',
      icon: '🏘️'
    },
    {
      id: 5,
      name: '马市街小吃街',
      type: '美食',
      lat: 34.2567,
      lng: 117.1947,
      description: '徐州最著名的小吃街',
      rating: 4.7,
      tips: '晚上最热闹，品种最全',
      icon: '🍜'
    },
    {
      id: 6,
      name: '老徐州羊肉汤馆',
      type: '美食',
      lat: 34.2511,
      lng: 117.2747,
      description: '正宗的徐州羊肉汤',
      rating: 4.8,
      tips: '早去不排队，羊肉汤是招牌',
      icon: '🍲'
    },
    {
      id: 7,
      name: '徐州苏宁凯悦酒店',
      type: '住宿',
      lat: 34.2611,
      lng: 117.2747,
      description: '五星级酒店，湖景房',
      rating: 4.8,
      tips: '位置绝佳，设施完善',
      icon: '🏨'
    },
    {
      id: 8,
      name: '徐州东站',
      type: '交通',
      lat: 34.2156,
      lng: 117.3847,
      description: '高铁站，往返南京的主要交通枢纽',
      rating: 4.5,
      tips: '地铁1号线可直达市区',
      icon: '🚄'
    }
  ];

  // 加载本地数据
  useEffect(() => {
    // 加载自定义标记
    const savedCustomMarkers = localStorage.getItem('xuzhou-map-custom-markers');
    if (savedCustomMarkers) {
      try {
        setCustomMarkers(JSON.parse(savedCustomMarkers));
      } catch (error) {
        console.error('Error loading custom markers:', error);
      }
    }
  }, []);

  // 保存自定义标记到localStorage
  const saveCustomMarkers = (markers) => {
    localStorage.setItem('xuzhou-map-custom-markers', JSON.stringify(markers));
    setCustomMarkers(markers);
  };

  useEffect(() => {
    // 动态加载百度地图API
    const loadBaiduMap = () => {
      if (window.BMap) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.map.baidu.com/api?v=3.0&ak=zuocDmYKz4t8GElbKotYajl06BVZTlWM&callback=initMap';
      script.async = true;
      document.head.appendChild(script);

      window.initMap = initMap;
    };

    const initMap = () => {
      if (!mapRef.current || !window.BMap) return;

      const mapInstance = new window.BMap.Map(mapRef.current);
      const point = new window.BMap.Point(117.2847, 34.2611); // 徐州中心点
      
      mapInstance.centerAndZoom(point, 12);
      mapInstance.enableScrollWheelZoom(true);
      
      // 添加控件
      mapInstance.addControl(new window.BMap.NavigationControl());
      mapInstance.addControl(new window.BMap.ScaleControl());
      mapInstance.addControl(new window.BMap.OverviewMapControl());

      // 添加POI标记
      const markers = [];
      pois.forEach(poi => {
        const poiPoint = new window.BMap.Point(poi.lng, poi.lat);
        const marker = new window.BMap.Marker(poiPoint);

        // 存储POI信息到marker对象
        marker.poiData = poi;
        markers.push(marker);

        mapInstance.addOverlay(marker);

        // 创建信息窗口
        const infoWindow = new window.BMap.InfoWindow(`
          <div style="padding: 10px; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">${poi.icon} ${poi.name}</h4>
            <p style="margin: 5px 0; color: #666;">${poi.description}</p>
            <p style="margin: 5px 0; color: #f39c12;">⭐ ${poi.rating} 分</p>
            <p style="margin: 5px 0; color: #2980b9; font-style: italic;">💡 ${poi.tips}</p>
          </div>
        `);

        marker.addEventListener('click', () => {
          mapInstance.openInfoWindow(infoWindow, poiPoint);
          setSelectedPoi(poi);
        });
      });

      // 保存标记引用
      setMapMarkers(markers);

      // 添加右键点击事件
      mapInstance.addEventListener('rightclick', (e) => {
        const point = e.point;
        setNewMarkerData({
          lat: point.lat,
          lng: point.lng,
          note: '',
          type: 'favorite',
          color: 'red'
        });
        setShowAddMarkerModal(true);
      });

      setMap(mapInstance);
    };

    loadBaiduMap();

    return () => {
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, []);

  // 渲染自定义标记
  useEffect(() => {
    if (!map || !window.BMap) return;

    // 清除之前的自定义标记
    const overlays = map.getOverlays();
    overlays.forEach(overlay => {
      if (overlay.customMarker) {
        map.removeOverlay(overlay);
      }
    });

    // 添加自定义标记
    customMarkers.forEach(marker => {
      const point = new window.BMap.Point(marker.lng, marker.lat);
      const markerType = markerTypes.find(type => type.id === marker.type);

      // 创建自定义图标
      const icon = new window.BMap.Icon(
        `data:image/svg+xml;base64,${btoa(`
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="${markerType.color}" stroke="white" stroke-width="2"/>
            <text x="15" y="20" text-anchor="middle" font-size="12" fill="white">${markerType.icon}</text>
          </svg>
        `)}`,
        new window.BMap.Size(30, 30),
        { anchor: new window.BMap.Size(15, 15) }
      );

      const baiduMarker = new window.BMap.Marker(point, { icon });
      baiduMarker.customMarker = true;
      baiduMarker.markerId = marker.id;

      // 创建信息窗口
      const infoWindow = new window.BMap.InfoWindow(`
        <div style="padding: 10px; min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">${markerType.icon} ${markerType.name}</h4>
          <p style="margin: 5px 0; color: #666;">${marker.note || '无备注'}</p>
          <p style="margin: 5px 0; color: #999; font-size: 12px;">创建时间: ${new Date(marker.createdAt).toLocaleString()}</p>
          <div style="margin-top: 10px;">
            <button onclick="window.editCustomMarker('${marker.id}')" style="margin-right: 5px; padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer;">编辑</button>
            <button onclick="window.deleteCustomMarker('${marker.id}')" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">删除</button>
          </div>
        </div>
      `);

      baiduMarker.addEventListener('click', () => {
        map.openInfoWindow(infoWindow, point);
      });

      map.addOverlay(baiduMarker);
    });
  }, [map, customMarkers]);

  // 高亮地图标记
  const highlightMapMarker = (poiId) => {
    // 清除之前的高亮
    if (highlightedMarker) {
      // 恢复原始图标
      const originalIcon = new window.BMap.Icon(
        'https://api.map.baidu.com/img/markers.png',
        new window.BMap.Size(23, 25),
        { offset: new window.BMap.Size(10, 25) }
      );
      highlightedMarker.setIcon(originalIcon);
    }

    // 找到对应的标记并高亮
    const targetMarker = mapMarkers.find(marker => marker.poiData && marker.poiData.id === poiId);
    if (targetMarker) {
      // 创建高亮图标
      const highlightIcon = new window.BMap.Icon(
        'https://api.map.baidu.com/img/markers.png',
        new window.BMap.Size(23, 25),
        {
          offset: new window.BMap.Size(10, 25),
          imageOffset: new window.BMap.Size(0, -25) // 使用红色标记
        }
      );
      targetMarker.setIcon(highlightIcon);
      setHighlightedMarker(targetMarker);

      // 添加动画效果
      const point = targetMarker.getPosition();
      map.centerAndZoom(point, 16);

      // 创建跳动动画
      setTimeout(() => {
        if (targetMarker) {
          const animation = new window.BMap.Animation(window.BMAP_ANIMATION_BOUNCE);
          targetMarker.setAnimation(animation);
          setTimeout(() => {
            targetMarker.setAnimation(null);
          }, 2000);
        }
      }, 500);
    }
  };

  // 处理搜索结果选择
  const handleSearchResultSelect = (result) => {
    setSelectedSearchResult(result);

    if (map && result.location) {
      const point = new window.BMap.Point(result.location.lng, result.location.lat);
      map.centerAndZoom(point, 16);

      // 如果是本地POI数据，高亮对应标记
      const matchingPoi = pois.find(poi => poi.id === result.id);
      if (matchingPoi) {
        setSelectedPoi(matchingPoi);
        highlightMapMarker(result.id);
      } else {
        // 如果是在线搜索结果，创建临时标记
        const marker = new window.BMap.Marker(point);
        const highlightIcon = new window.BMap.Icon(
          'https://api.map.baidu.com/img/markers.png',
          new window.BMap.Size(23, 25),
          {
            offset: new window.BMap.Size(10, 25),
            imageOffset: new window.BMap.Size(0, -50) // 使用蓝色标记
          }
        );
        marker.setIcon(highlightIcon);
        map.addOverlay(marker);

        // 清除之前的高亮标记
        if (highlightedMarker && highlightedMarker !== marker) {
          map.removeOverlay(highlightedMarker);
        }
        setHighlightedMarker(marker);
      }

      // 创建并显示信息窗口
      const infoWindow = new window.BMap.InfoWindow(`
        <div style="padding: 10px; min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">${result.icon} ${result.name}</h4>
          <p style="margin: 5px 0; color: #666;">${result.description}</p>
          <p style="margin: 5px 0; color: #999;">类型: ${result.type}</p>
          ${result.rating ? `<p style="margin: 5px 0; color: #f39c12;">⭐ ${result.rating} 分</p>` : ''}
          ${result.tips ? `<p style="margin: 5px 0; color: #2980b9; font-style: italic;">💡 ${result.tips}</p>` : ''}
        </div>
      `);

      map.openInfoWindow(infoWindow, point);
    }
  };

  // 处理搜索分类变化
  const handleSearchCategoryChange = (category) => {
    // 根据搜索分类筛选POI显示
    const categoryMap = {
      'attraction': '景点',
      'food': '美食',
      'accommodation': '住宿',
      'transportation': '交通'
    };

    if (category && categoryMap[category]) {
      setSelectedType(categoryMap[category]);
    } else {
      setSelectedType('全部');
    }
  };

  // 自定义标记管理
  const addCustomMarker = () => {
    if (!newMarkerData.note.trim()) {
      alert('请输入备注信息');
      return;
    }

    const marker = {
      id: Date.now().toString(),
      ...newMarkerData,
      createdAt: new Date().toISOString()
    };

    const newMarkers = [...customMarkers, marker];
    saveCustomMarkers(newMarkers);
    setShowAddMarkerModal(false);
    setNewMarkerData({
      lat: null,
      lng: null,
      note: '',
      type: 'favorite',
      color: 'red'
    });
  };

  const editCustomMarker = (markerId) => {
    const marker = customMarkers.find(m => m.id === markerId);
    if (marker) {
      setEditingMarker(marker);
      setNewMarkerData(marker);
      setShowAddMarkerModal(true);
    }
  };

  const updateCustomMarker = () => {
    if (!newMarkerData.note.trim()) {
      alert('请输入备注信息');
      return;
    }

    const newMarkers = customMarkers.map(marker =>
      marker.id === editingMarker.id
        ? { ...marker, ...newMarkerData, updatedAt: new Date().toISOString() }
        : marker
    );

    saveCustomMarkers(newMarkers);
    setShowAddMarkerModal(false);
    setEditingMarker(null);
    setNewMarkerData({
      lat: null,
      lng: null,
      note: '',
      type: 'favorite',
      color: 'red'
    });
  };

  const deleteCustomMarker = (markerId) => {
    if (window.confirm('确定要删除这个标记吗？')) {
      const newMarkers = customMarkers.filter(marker => marker.id !== markerId);
      saveCustomMarkers(newMarkers);
    }
  };

  const clearAllCustomMarkers = () => {
    if (window.confirm('确定要清除所有自定义标记吗？此操作不可恢复。')) {
      saveCustomMarkers([]);
    }
  };

  // 导出/导入功能
  const exportCustomMarkers = () => {
    const dataStr = JSON.stringify(customMarkers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xuzhou-custom-markers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCustomMarkers = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMarkers = JSON.parse(e.target.result);
        if (Array.isArray(importedMarkers)) {
          if (window.confirm('导入标记将覆盖现有的自定义标记，确定继续吗？')) {
            saveCustomMarkers(importedMarkers);
            alert('导入成功！');
          }
        } else {
          alert('文件格式不正确');
        }
      } catch (error) {
        alert('文件解析失败');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 清空input
  };

  // 全局函数供信息窗口调用
  useEffect(() => {
    window.editCustomMarker = editCustomMarker;
    window.deleteCustomMarker = deleteCustomMarker;

    return () => {
      delete window.editCustomMarker;
      delete window.deleteCustomMarker;
    };
  }, [customMarkers]);

  const handlePoiClick = (poi) => {
    if (map) {
      const point = new window.BMap.Point(poi.lng, poi.lat);
      map.centerAndZoom(point, 15);
      setSelectedPoi(poi);
    }
  };

  const poiTypes = ['全部', '景点', '美食', '住宿', '交通'];
  const [selectedType, setSelectedType] = useState('全部');

  const filteredPois = selectedType === '全部' 
    ? pois 
    : pois.filter(poi => poi.type === selectedType);

  return (
    <div className="map-container">
      <div className="section-header">
        <h2>🗺️ 地图导览</h2>
        <p>徐州旅游景点、美食、住宿一览</p>
      </div>

      {/* 增强的搜索组件 */}
      <div className="map-search-container">
        <SearchComponent
          onResultSelect={handleSearchResultSelect}
          onCategoryChange={handleSearchCategoryChange}
          placeholder="搜索徐州的地点、景点、餐厅..."
          showCategories={true}
          showHistory={false}
          className="map-search"
        />
      </div>

      <div className="map-content">
        <div className="map-sidebar">
          <div className="poi-filters">
            <h3>📍 地点分类</h3>
            <div className="filter-buttons">
              {poiTypes.map(type => (
                <button
                  key={type}
                  className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="poi-list">
            <h3>📋 地点列表</h3>
            {filteredPois.map(poi => (
              <div
                key={poi.id}
                className={`poi-item ${selectedPoi?.id === poi.id ? 'selected' : ''}`}
                onClick={() => handlePoiClick(poi)}
              >
                <div className="poi-header">
                  <span className="poi-icon">{poi.icon}</span>
                  <div className="poi-info">
                    <h4>{poi.name}</h4>
                    <span className="poi-type">{poi.type}</span>
                  </div>
                  <div className="poi-rating">⭐ {poi.rating}</div>
                </div>
                <p className="poi-description">{poi.description}</p>
                <div className="poi-tips">💡 {poi.tips}</div>
              </div>
            ))}
          </div>

          {/* 自定义标记管理 */}
          <div className="custom-markers-section">
            <div className="custom-markers-header">
              <h3>📌 我的标记</h3>
              <div className="custom-markers-controls">
                <button
                  className="export-btn"
                  onClick={exportCustomMarkers}
                  disabled={customMarkers.length === 0}
                  title="导出标记"
                >
                  📤
                </button>
                <label className="import-btn" title="导入标记">
                  📥
                  <input
                    type="file"
                    accept=".json"
                    onChange={importCustomMarkers}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  className="clear-btn"
                  onClick={clearAllCustomMarkers}
                  disabled={customMarkers.length === 0}
                  title="清除所有标记"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="custom-markers-list">
              {customMarkers.length > 0 ? (
                customMarkers.map(marker => {
                  const markerType = markerTypes.find(type => type.id === marker.type);
                  return (
                    <div key={marker.id} className="custom-marker-item">
                      <div className="marker-header">
                        <span className="marker-icon" style={{ color: markerType.color }}>
                          {markerType.icon}
                        </span>
                        <div className="marker-info">
                          <div className="marker-note">{marker.note}</div>
                          <div className="marker-type">{markerType.name}</div>
                        </div>
                      </div>
                      <div className="marker-actions">
                        <button
                          className="edit-marker-btn"
                          onClick={() => editCustomMarker(marker.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-marker-btn"
                          onClick={() => deleteCustomMarker(marker.id)}
                        >
                          🗑️
                        </button>
                        <button
                          className="locate-marker-btn"
                          onClick={() => {
                            if (map) {
                              const point = new window.BMap.Point(marker.lng, marker.lat);
                              map.centerAndZoom(point, 16);
                            }
                          }}
                        >
                          📍
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-custom-markers">
                  <p>还没有自定义标记</p>
                  <p>在地图上右键点击添加标记</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="map-wrapper">
          <div ref={mapRef} className="baidu-map"></div>
          
          {selectedPoi && (
            <div className="selected-poi-info">
              <div className="poi-detail">
                <h4>{selectedPoi.icon} {selectedPoi.name}</h4>
                <p>{selectedPoi.description}</p>
                <div className="poi-meta">
                  <span className="rating">⭐ {selectedPoi.rating} 分</span>
                  <span className="type">{selectedPoi.type}</span>
                </div>
                <div className="poi-tip">💡 {selectedPoi.tips}</div>
              </div>
              <button 
                className="close-btn"
                onClick={() => setSelectedPoi(null)}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="map-tips">
        <h3>🎯 地图使用说明</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <h4>🖱️ 地图操作</h4>
            <p>鼠标拖拽移动地图<br/>
               滚轮缩放地图<br/>
               点击标记查看详情</p>
          </div>
          <div className="tip-item">
            <h4>📍 标记说明</h4>
            <p>🌊 景点：主要旅游景点<br/>
               🍜 美食：推荐餐厅小吃<br/>
               🏨 住宿：酒店民宿</p>
          </div>
          <div className="tip-item">
            <h4>🚇 交通提示</h4>
            <p>地铁1号线连接主要景点<br/>
               公交线路覆盖全市<br/>
               打车约15-30分钟</p>
          </div>
        </div>
      </div>

      {/* 自定义标记添加/编辑模态框 */}
      {showAddMarkerModal && (
        <div className="modal-overlay" onClick={() => setShowAddMarkerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMarker ? '编辑标记' : '添加自定义标记'}</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowAddMarkerModal(false);
                  setEditingMarker(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>标记类型</label>
                <div className="marker-type-selector">
                  {markerTypes.map(type => (
                    <button
                      key={type.id}
                      className={`type-btn ${newMarkerData.type === type.id ? 'active' : ''}`}
                      onClick={() => setNewMarkerData({...newMarkerData, type: type.id, color: type.color})}
                    >
                      <span className="type-icon" style={{ color: type.color }}>{type.icon}</span>
                      <span className="type-name">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>备注信息</label>
                <textarea
                  value={newMarkerData.note}
                  onChange={(e) => setNewMarkerData({...newMarkerData, note: e.target.value})}
                  placeholder="输入备注信息，如：计划去的餐厅、朋友推荐的景点等"
                  rows={3}
                  className="note-textarea"
                />
              </div>

              <div className="form-group">
                <label>位置信息</label>
                <div className="location-info">
                  <span>经度: {newMarkerData.lng?.toFixed(6)}</span>
                  <span>纬度: {newMarkerData.lat?.toFixed(6)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddMarkerModal(false);
                  setEditingMarker(null);
                }}
              >
                取消
              </button>
              <button
                className="save-btn"
                onClick={editingMarker ? updateCustomMarker : addCustomMarker}
              >
                {editingMarker ? '更新' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
