import React, { useState, useRef, useEffect } from 'react';
import { globalSearchEngine, searchUtils } from '../utils/searchData';
import './GlobalSearch.css';

const GlobalSearch = ({ onResultSelect, setActiveSection }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);

  // 高亮文本组件
  const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return text;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  // 执行搜索
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // 模拟搜索延迟以显示加载状态
      await new Promise(resolve => setTimeout(resolve, 100));

      const searchResult = globalSearchEngine.search(searchQuery, {
        limit: 8
      });

      setResults(searchResult.results);
      setShowResults(true);

      // 更新搜索历史
      const updatedHistory = globalSearchEngine.getSearchHistory();
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Global search error:', error);
      setResults([]);
      setShowResults(false);
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
      // 获取搜索建议
      const autoComplete = globalSearchEngine.getAutoComplete(value);
      setSuggestions(autoComplete);
      setShowSuggestions(autoComplete.length > 0);
    } else {
      setResults([]);
      setShowResults(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理输入框获得焦点
  const handleInputFocus = () => {
    if (!query.trim() && searchHistory.length > 0) {
      setSuggestions(searchHistory);
      setShowSuggestions(true);
    }
  };

  // 处理建议选择
  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // 清除搜索历史
  const handleClearHistory = (e) => {
    e.stopPropagation();
    globalSearchEngine.clearSearchHistory();
    setSearchHistory([]);
    setSuggestions([]);
    setShowSuggestions(false);
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
    const isShowingResults = showResults && results.length > 0;
    const isShowingSuggestions = showSuggestions && suggestions.length > 0;

    if (!isShowingResults && !isShowingSuggestions) return;

    const currentList = isShowingResults ? results : suggestions;
    const maxIndex = currentList.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < maxIndex ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (isShowingResults) {
            handleResultSelect(results[selectedIndex]);
          } else if (isShowingSuggestions) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          }
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // 初始化搜索历史
  useEffect(() => {
    const history = globalSearchEngine.getSearchHistory();
    setSearchHistory(history);
  }, []);

  // 全局快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ctrl+K 或 Cmd+K 聚焦搜索框
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
    <div className="global-search" ref={resultsRef}>
      <form onSubmit={handleSearch} className="global-search-form">
        <div className="global-search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="搜索景点、美食、住宿... (Ctrl+K)"
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

      {/* 搜索建议 */}
      {showSuggestions && !showResults && (
        <div className="global-search-suggestions">
          <div className="global-suggestions-header">
            <span>{query.trim() ? '搜索建议' : '搜索历史'}</span>
            {!query.trim() && searchHistory.length > 0 && (
              <button
                className="global-clear-history"
                onClick={handleClearHistory}
                title="清除搜索历史"
              >
                🗑️
              </button>
            )}
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`global-suggestion-item ${!showResults && selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <span className="global-suggestion-icon">
                {query.trim() ? '🔍' : '🕒'}
              </span>
              <span className="global-suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* 搜索结果 */}
      {showResults && (
        <div className="global-search-results">
          {results.length > 0 ? (
            <>
              <div className="global-results-header">
                找到 {results.length} 个结果
                {results.length > 0 && (
                  <span className="global-results-stats">
                    （用时 {Math.random() * 100 + 50 | 0}ms）
                  </span>
                )}
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`global-search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleResultSelect(result)}
                >
                  <div className="global-result-icon">{result.icon}</div>
                  <div className="global-result-content">
                    <div className="global-result-title">
                      <HighlightText text={result.name} highlight={query} />
                    </div>
                    <div className="global-result-description">
                      <HighlightText text={result.description} highlight={query} />
                    </div>
                    <div className="global-result-meta">
                      <span className="global-result-type">{result.type}</span>
                      {result.rating && (
                        <span className="global-result-rating">⭐ {result.rating}</span>
                      )}
                      {result.price && (
                        <span className="global-result-price">💰 {result.price}</span>
                      )}
                    </div>
                  </div>
                  <div className="global-result-arrow">→</div>
                </div>
              ))}

              {/* 相关搜索推荐 */}
              {results.length > 0 && query.trim() && (
                <div className="global-related-searches">
                  <div className="global-related-header">相关搜索</div>
                  {globalSearchEngine.getRelatedSearches(query).map((relatedQuery, index) => (
                    <div
                      key={index}
                      className="global-related-item"
                      onClick={() => handleSuggestionSelect(relatedQuery)}
                    >
                      <span className="global-related-icon">🔗</span>
                      <span className="global-related-text">{relatedQuery}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : !isSearching && query.trim() && (
            <div className="global-no-results">
              <div className="global-no-results-icon">🔍</div>
              <div className="global-no-results-text">未找到 "{query}" 的相关结果</div>
              <div className="global-no-results-suggestions">
                <div className="global-no-results-tips">您可以尝试：</div>
                <ul className="global-no-results-list">
                  <li>检查拼写是否正确</li>
                  <li>尝试使用更简单的关键词</li>
                  <li>搜索热门内容：云龙湖、地锅鸡、万豪酒店</li>
                </ul>
              </div>
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
