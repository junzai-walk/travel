import React, { useState, useRef, useEffect } from 'react';
import { globalSearchEngine } from '../utils/searchData';
import './GlobalSearch.css';

const GlobalSearch = ({ onResultSelect, setActiveSection }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);

  // 执行搜索
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    try {
      const searchResult = globalSearchEngine.search(searchQuery, {
        limit: 8
      });

      setResults(searchResult.results);
      setShowResults(true);
    } catch (error) {
      console.error('Global search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 防抖搜索
  const debouncedSearch = (searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
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
    }
  };

  // 处理搜索提交
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  // 处理结果选择
  const handleResultSelect = (result) => {
    setQuery('');
    setShowResults(false);
    
    // 根据结果类型跳转到相应页面
    const categoryPageMap = {
      'attraction': 'map',
      'food': 'food',
      'accommodation': 'accommodation',
      'transportation': 'transport'
    };
    
    const targetPage = categoryPageMap[result.category] || 'map';
    
    if (setActiveSection) {
      setActiveSection(targetPage);
    }
    
    if (onResultSelect) {
      onResultSelect(result, targetPage);
    }
  };

  // 键盘导航
  const handleKeyDown = (e) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultSelect(results[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="global-search" ref={resultsRef}>
      <form onSubmit={handleSearch} className="global-search-form">
        <div className="global-search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="搜索景点、美食、住宿..."
            className="global-search-input"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="global-search-button"
          >
            {isSearching ? '🔄' : '🔍'}
          </button>
        </div>
      </form>

      {/* 搜索结果 */}
      {showResults && (
        <div className="global-search-results">
          {results.length > 0 ? (
            <>
              <div className="global-results-header">
                找到 {results.length} 个结果
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`global-search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="global-result-icon">{result.icon}</div>
                  <div className="global-result-content">
                    <div className="global-result-title">{result.name}</div>
                    <div className="global-result-description">{result.description}</div>
                    <div className="global-result-meta">
                      <span className="global-result-type">{result.type}</span>
                      {result.rating && (
                        <span className="global-result-rating">⭐ {result.rating}</span>
                      )}
                    </div>
                  </div>
                  <div className="global-result-arrow">→</div>
                </div>
              ))}
            </>
          ) : !isSearching && query.trim() && (
            <div className="global-no-results">
              <div className="global-no-results-icon">🔍</div>
              <div className="global-no-results-text">未找到相关结果</div>
            </div>
          )}
          
          {isSearching && (
            <div className="global-search-loading">
              <span className="global-loading-spinner">🔄</span>
              <span className="global-loading-text">正在搜索...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
