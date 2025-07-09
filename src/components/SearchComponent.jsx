import React, { useState, useEffect, useRef, useCallback } from 'react';
import { globalSearchEngine, searchUtils } from '../utils/searchData';
import './SearchComponent.css';

const SearchComponent = ({ 
  onResultSelect, 
  onCategoryChange,
  placeholder = "搜索徐州的地点、景点、餐厅...",
  showCategories = true,
  showHistory = true,
  autoFocus = false,
  className = ""
}) => {
  // 搜索状态
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // UI状态
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Refs
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);
  
  // 分类选项
  const categories = [
    { id: null, label: '全部', icon: '🔍' },
    { id: 'attraction', label: '景点', icon: '🌊' },
    { id: 'food', label: '美食', icon: '🍜' },
    { id: 'accommodation', label: '住宿', icon: '🏨' },
    { id: 'transportation', label: '交通', icon: '🚄' }
  ];

  // 加载搜索历史
  useEffect(() => {
    setSearchHistory(globalSearchEngine.getSearchHistory());
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // 防抖搜索
  const debouncedSearch = useCallback((searchQuery, category) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery, category);
    }, 300);
  }, []);

  // 执行搜索
  const performSearch = async (searchQuery, category = selectedCategory) => {
    if (!searchUtils.isValidQuery(searchQuery)) {
      setResults([]);
      setShowResults(false);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // 本地搜索
      const searchResult = globalSearchEngine.search(searchQuery, {
        category: category,
        limit: 10
      });

      setResults(searchResult.results);
      setSuggestions(searchResult.suggestions);
      setShowResults(true);
      setShowSuggestions(searchResult.suggestions.length > 0);
      
      // 如果没有本地结果，可以尝试在线搜索（如果地图可用）
      if (searchResult.results.length === 0 && window.BMap) {
        await performOnlineSearch(searchQuery);
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setError('搜索时发生错误，请稍后重试');
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // 在线搜索（百度地图）
  const performOnlineSearch = async (searchQuery) => {
    return new Promise((resolve) => {
      if (!window.BMap) {
        resolve([]);
        return;
      }

      try {
        const localSearch = new window.BMap.LocalSearch('徐州', {
          onSearchComplete: (searchResults) => {
            if (localSearch.getStatus() === window.BMAP_STATUS_SUCCESS) {
              const onlineResults = [];
              for (let i = 0; i < Math.min(5, searchResults.getCurrentNumPois()); i++) {
                const poi = searchResults.getPoi(i);
                onlineResults.push({
                  id: `online-${i}`,
                  name: poi.title,
                  type: '在线搜索',
                  category: 'online',
                  description: poi.address,
                  address: poi.address,
                  location: { lat: poi.point.lat, lng: poi.point.lng },
                  icon: '📍',
                  isOnlineResult: true
                });
              }
              
              // 合并在线结果
              setResults(prev => [...prev, ...onlineResults]);
            }
            resolve();
          }
        });
        
        localSearch.search(searchQuery);
        
        // 设置超时
        setTimeout(() => {
          resolve();
        }, 5000);
        
      } catch (error) {
        console.error('Online search error:', error);
        resolve();
      }
    });
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setResults([]);
      setShowResults(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理搜索提交
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      setShowSuggestions(false);
    }
  };

  // 处理结果选择
  const handleResultSelect = (result) => {
    setQuery('');
    setShowResults(false);
    setShowSuggestions(false);
    
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  // 处理建议选择
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestions(false);
  };

  // 处理历史记录选择
  const handleHistorySelect = (historyItem) => {
    setQuery(historyItem);
    performSearch(historyItem);
  };

  // 处理分类变化
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    if (query.trim()) {
      performSearch(query, category);
    }
  };

  // 键盘导航
  const handleKeyDown = (e) => {
    if (!showResults && !showSuggestions) return;

    const items = showSuggestions ? suggestions : results;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (showSuggestions) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          } else {
            handleResultSelect(results[selectedIndex]);
          }
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-component ${className}`} ref={resultsRef}>
      {/* 分类筛选 */}
      {showCategories && (
        <div className="search-categories">
          {categories.map(category => (
            <button
              key={category.id || 'all'}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="search-button"
          >
            {isSearching ? (
              <span className="loading-spinner">🔄</span>
            ) : (
              '🔍'
            )}
          </button>
        </div>
      </form>

      {/* 错误提示 */}
      {error && (
        <div className="search-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-retry"
            onClick={() => {
              setError(null);
              if (query.trim()) performSearch(query);
            }}
          >
            重试
          </button>
        </div>
      )}

      {/* 搜索建议 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          <div className="suggestions-header">搜索建议</div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <span className="suggestion-icon">💡</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* 搜索结果 */}
      {showResults && (
        <div className="search-results">
          {isSearching && (
            <div className="search-loading">
              <span className="loading-spinner">🔄</span>
              <span className="loading-text">正在搜索...</span>
            </div>
          )}
          
          {results.length > 0 ? (
            <>
              <div className="results-header">
                找到 {results.length} 个结果
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`search-result-item ${selectedIndex === index ? 'selected' : ''} ${result.isOnlineResult ? 'online-result' : ''}`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="result-icon">{result.icon}</div>
                  <div className="result-content">
                    <div className="result-title">
                      {result.name}
                      {result.isOnlineResult && (
                        <span className="online-badge">在线</span>
                      )}
                    </div>
                    <div className="result-description">{result.description}</div>
                    <div className="result-meta">
                      <span className="result-type">{result.type}</span>
                      {result.rating && (
                        <span className="result-rating">⭐ {result.rating}</span>
                      )}
                      {result.price && (
                        <span className="result-price">{result.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : !isSearching && query.trim() && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-title">未找到相关结果</div>
              <div className="no-results-text">
                尝试使用不同的关键词或查看下方的热门搜索
              </div>
              <div className="popular-searches">
                <div className="popular-title">热门搜索：</div>
                {globalSearchEngine.getPopularSearches().map((popular, index) => (
                  <button
                    key={index}
                    className="popular-item"
                    onClick={() => handleSuggestionSelect(popular)}
                  >
                    {popular}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 搜索历史 */}
      {showHistory && searchHistory.length > 0 && !showResults && !query.trim() && (
        <div className="search-history">
          <div className="history-header">
            <span>搜索历史</span>
            <button 
              className="clear-history"
              onClick={() => {
                globalSearchEngine.clearSearchHistory();
                setSearchHistory([]);
              }}
            >
              清除
            </button>
          </div>
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => handleHistorySelect(item)}
            >
              <span className="history-icon">🕐</span>
              <span className="history-text">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
