// 全局搜索数据管理
// 整合所有可搜索的内容：景点、美食、住宿、交通等

// 景点数据
export const attractions = [
  {
    id: 'yunlong-lake',
    name: '云龙湖',
    type: '景点',
    category: 'attraction',
    description: '徐州最大的城市湖泊，风景秀丽，是休闲娱乐的好去处',
    keywords: ['湖泊', '风景', '休闲', '公园', '自然'],
    rating: 4.6,
    location: { lat: 34.2611, lng: 117.2847 },
    tips: '建议傍晚时分前往，夕阳西下时景色最美',
    icon: '🌊',
    address: '徐州市泉山区云龙湖风景区'
  },
  {
    id: 'xuzhou-museum',
    name: '徐州博物馆',
    type: '景点',
    category: 'attraction',
    description: '展示徐州历史文化的重要场所，汉代文物丰富',
    keywords: ['博物馆', '历史', '文化', '汉代', '文物'],
    rating: 4.5,
    location: { lat: 34.2167, lng: 117.2833 },
    tips: '免费参观，建议预约，周一闭馆',
    icon: '🏛️',
    address: '徐州市云龙区和平路118号'
  },
  {
    id: 'pengzu-garden',
    name: '彭祖园',
    type: '景点',
    category: 'attraction',
    description: '以彭祖文化为主题的综合性公园，环境优美',
    keywords: ['公园', '彭祖', '文化', '休闲', '绿化'],
    rating: 4.3,
    location: { lat: 34.2456, lng: 117.1889 },
    tips: '适合晨练和散步，有很多健身设施',
    icon: '🌳',
    address: '徐州市泉山区泰山路'
  }
];

// 美食数据
export const foods = [
  {
    id: 'diguo-chicken',
    name: '地锅鸡',
    type: '美食',
    category: 'food',
    description: '徐州特色菜，鸡肉鲜嫩，锅贴香脆',
    keywords: ['特色菜', '鸡肉', '锅贴', '徐州菜', '地方菜'],
    rating: 4.7,
    price: '68-88元',
    location: { lat: 34.2167, lng: 117.2000 },
    tips: '推荐老字号店铺，味道更正宗',
    icon: '🍗',
    address: '徐州市区多家分店'
  },
  {
    id: 'yangrou-paomo',
    name: '羊肉泡馍',
    type: '美食',
    category: 'food',
    description: '徐州传统小吃，汤鲜肉嫩，营养丰富',
    keywords: ['羊肉', '泡馍', '传统', '小吃', '汤'],
    rating: 4.4,
    price: '25-35元',
    location: { lat: 34.2200, lng: 117.1950 },
    tips: '冬天吃最暖胃，建议配咸菜',
    icon: '🍜',
    address: '徐州市各大小吃街'
  },
  {
    id: 'xuzhou-steamed-bun',
    name: '徐州烧饼',
    type: '美食',
    category: 'food',
    description: '外酥内软的传统烧饼，是徐州人的早餐首选',
    keywords: ['烧饼', '早餐', '传统', '酥脆', '面食'],
    rating: 4.2,
    price: '3-5元',
    location: { lat: 34.2150, lng: 117.2100 },
    tips: '趁热吃最香，可配豆浆或粥',
    icon: '🥖',
    address: '徐州市各早餐店'
  }
];

// 住宿数据
export const accommodations = [
  {
    id: 'xuzhou-marriott',
    name: '徐州万豪酒店',
    type: '住宿',
    category: 'accommodation',
    description: '五星级豪华酒店，设施完善，服务优质',
    keywords: ['五星级', '豪华', '万豪', '商务', '高端'],
    rating: 4.8,
    price: '500-800元/晚',
    location: { lat: 34.2167, lng: 117.2833 },
    tips: '位置优越，近云龙湖，适合商务出行',
    icon: '🏨',
    address: '徐州市云龙区解放南路128号'
  },
  {
    id: 'home-inn',
    name: '如家酒店',
    type: '住宿',
    category: 'accommodation',
    description: '经济型连锁酒店，性价比高，位置便利',
    keywords: ['经济型', '连锁', '性价比', '便利', '如家'],
    rating: 4.2,
    price: '150-250元/晚',
    location: { lat: 34.2200, lng: 117.1900 },
    tips: '提前预订有优惠，近地铁站',
    icon: '🏩',
    address: '徐州市多个地点'
  }
];

// 交通数据
export const transportation = [
  {
    id: 'xuzhou-station',
    name: '徐州站',
    type: '交通',
    category: 'transportation',
    description: '徐州主要火车站，高铁、普通列车均停靠',
    keywords: ['火车站', '高铁', '列车', '交通枢纽'],
    rating: 4.3,
    location: { lat: 34.2167, lng: 117.1833 },
    tips: '建议提前1小时到达，节假日人多',
    icon: '🚄',
    address: '徐州市云龙区复兴南路'
  },
  {
    id: 'xuzhou-airport',
    name: '徐州观音国际机场',
    type: '交通',
    category: 'transportation',
    description: '徐州主要机场，连接国内主要城市',
    keywords: ['机场', '航班', '国际', '观音机场'],
    rating: 4.1,
    location: { lat: 34.0597, lng: 117.5553 },
    tips: '距市区约40公里，建议预留充足时间',
    icon: '✈️',
    address: '徐州市睢宁县双沟镇'
  }
];

// 合并所有数据
export const allSearchData = [
  ...attractions,
  ...foods,
  ...accommodations,
  ...transportation
];

// 搜索功能
export class SearchEngine {
  constructor(data = allSearchData) {
    this.data = data;
    this.searchHistory = this.loadSearchHistory();
    this.searchCache = new Map(); // 搜索结果缓存
    this.maxCacheSize = 100; // 最大缓存条目数
  }

  // 加载搜索历史
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('xuzhou-search-history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  // 保存搜索历史
  saveSearchHistory(query) {
    if (!query.trim()) return;
    
    const newHistory = [
      query,
      ...this.searchHistory.filter(item => item !== query)
    ].slice(0, 10); // 最多保存10条
    
    this.searchHistory = newHistory;
    localStorage.setItem('xuzhou-search-history', JSON.stringify(newHistory));
  }

  // 主搜索方法（带缓存）
  search(query, options = {}) {
    if (!query || !query.trim()) {
      return {
        results: [],
        total: 0,
        query: query,
        suggestions: this.getPopularSearches()
      };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const {
      category = null, // 'attraction', 'food', 'accommodation', 'transportation'
      limit = 20,
      includeKeywords = true
    } = options;

    // 生成缓存键
    const cacheKey = `${normalizedQuery}|${category}|${limit}|${includeKeywords}`;

    // 检查缓存
    if (this.searchCache.has(cacheKey)) {
      const cachedResult = this.searchCache.get(cacheKey);
      // 更新缓存访问时间
      this.searchCache.delete(cacheKey);
      this.searchCache.set(cacheKey, cachedResult);
      return cachedResult;
    }

    // 执行搜索
    const searchResult = this.performSearch(normalizedQuery, options);

    // 缓存结果
    this.cacheSearchResult(cacheKey, searchResult);

    // 保存搜索历史
    this.saveSearchHistory(query);

    return searchResult;
  }

  // 执行实际搜索
  performSearch(normalizedQuery, options = {}) {
    const {
      category = null,
      limit = 20,
      includeKeywords = true
    } = options;

    // 过滤数据
    let filteredData = this.data;
    if (category) {
      filteredData = this.data.filter(item => item.category === category);
    }

    // 搜索匹配
    const results = filteredData.filter(item => {
      // 名称匹配
      if (item.name.toLowerCase().includes(normalizedQuery)) return true;

      // 描述匹配
      if (item.description.toLowerCase().includes(normalizedQuery)) return true;

      // 地址匹配
      if (item.address && item.address.toLowerCase().includes(normalizedQuery)) return true;

      // 关键词匹配
      if (includeKeywords && item.keywords) {
        return item.keywords.some(keyword =>
          keyword.toLowerCase().includes(normalizedQuery)
        );
      }

      return false;
    });

    // 按相关性排序
    const sortedResults = this.sortByRelevance(results, normalizedQuery);

    return {
      results: sortedResults.slice(0, limit),
      total: sortedResults.length,
      query: normalizedQuery,
      suggestions: this.getSuggestions(normalizedQuery),
      autoComplete: this.getAutoComplete(normalizedQuery),
      relatedSearches: this.getRelatedSearches(normalizedQuery)
    };
  }

  // 缓存搜索结果
  cacheSearchResult(key, result) {
    // 如果缓存已满，删除最旧的条目
    if (this.searchCache.size >= this.maxCacheSize) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }

    this.searchCache.set(key, result);
  }

  // 清除搜索缓存
  clearSearchCache() {
    this.searchCache.clear();
  }

  // 按相关性排序
  sortByRelevance(results, query) {
    return results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query);
      const bScore = this.calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  // 计算相关性分数
  calculateRelevanceScore(item, query) {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const lowerName = item.name.toLowerCase();
    
    // 名称完全匹配
    if (lowerName === lowerQuery) score += 100;
    
    // 名称开头匹配
    else if (lowerName.startsWith(lowerQuery)) score += 80;
    
    // 名称包含匹配
    else if (lowerName.includes(lowerQuery)) score += 60;
    
    // 描述匹配
    if (item.description.toLowerCase().includes(lowerQuery)) score += 30;
    
    // 关键词匹配
    if (item.keywords) {
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowerQuery)) score += 20;
      });
    }
    
    // 评分加权
    score += (item.rating || 0) * 5;
    
    return score;
  }

  // 获取搜索建议
  getSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set();
    const lowerQuery = query.toLowerCase();
    
    this.data.forEach(item => {
      // 名称建议
      if (item.name.toLowerCase().includes(lowerQuery) && 
          item.name.toLowerCase() !== lowerQuery) {
        suggestions.add(item.name);
      }
      
      // 关键词建议
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(lowerQuery) && 
              keyword.toLowerCase() !== lowerQuery) {
            suggestions.add(keyword);
          }
        });
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }

  // 获取热门搜索
  getPopularSearches() {
    return ['云龙湖', '地锅鸡', '徐州博物馆', '羊肉泡馍', '万豪酒店'];
  }

  // 搜索纠错功能
  getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];

    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // 常见错误映射
    const errorMap = {
      '云龙湖': ['云龙', '湖', '云龙公园', '云龙风景区'],
      '地锅鸡': ['地锅', '鸡', '地锅菜', '徐州鸡'],
      '徐州博物馆': ['博物馆', '徐州博物院', '历史博物馆'],
      '羊肉泡馍': ['羊肉', '泡馍', '羊汤', '徐州羊肉'],
      '彭祖园': ['彭祖', '公园', '彭园'],
      '万豪酒店': ['万豪', '酒店', '五星酒店']
    };

    // 检查是否有匹配的纠错建议
    for (const [correct, variants] of Object.entries(errorMap)) {
      if (variants.some(variant => variant.includes(lowerQuery))) {
        suggestions.push(correct);
      }
    }

    return [...new Set(suggestions)];
  }

  // 智能搜索补全
  getAutoComplete(query) {
    if (!query || query.length < 1) return [];

    const completions = new Set();
    const lowerQuery = query.toLowerCase();

    // 从所有数据中提取可能的补全
    this.data.forEach(item => {
      // 名称补全
      if (item.name.toLowerCase().startsWith(lowerQuery)) {
        completions.add(item.name);
      }

      // 关键词补全
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          if (keyword.toLowerCase().startsWith(lowerQuery)) {
            completions.add(keyword);
          }
        });
      }

      // 类型补全
      if (item.type.toLowerCase().startsWith(lowerQuery)) {
        completions.add(item.type);
      }
    });

    return Array.from(completions).slice(0, 8);
  }

  // 相关搜索推荐
  getRelatedSearches(query) {
    if (!query) return [];

    const related = new Set();
    const lowerQuery = query.toLowerCase();

    // 基于当前搜索查询推荐相关内容
    this.data.forEach(item => {
      if (item.name.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery)) {

        // 添加同类型的其他项目
        const sameCategory = this.data.filter(other =>
          other.category === item.category &&
          other.id !== item.id
        );

        sameCategory.slice(0, 3).forEach(related_item => {
          related.add(related_item.name);
        });

        // 添加关键词
        if (item.keywords) {
          item.keywords.slice(0, 2).forEach(keyword => {
            if (!keyword.toLowerCase().includes(lowerQuery)) {
              related.add(keyword);
            }
          });
        }
      }
    });

    return Array.from(related).slice(0, 5);
  }

  // 获取搜索历史
  getSearchHistory() {
    return this.searchHistory;
  }

  // 清除搜索历史
  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('xuzhou-search-history');
  }

  // 按分类获取数据
  getByCategory(category) {
    return this.data.filter(item => item.category === category);
  }

  // 获取推荐内容
  getRecommendations(limit = 5) {
    return this.data
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }
}

// 创建全局搜索引擎实例
export const globalSearchEngine = new SearchEngine();

// 导出搜索相关的工具函数
export const searchUtils = {
  // 高亮搜索关键词
  highlightText: (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },
  
  // 格式化搜索结果
  formatSearchResult: (result) => ({
    ...result,
    displayName: result.name,
    displayDescription: result.description,
    displayType: result.type,
    displayRating: result.rating ? `⭐ ${result.rating}` : '',
    displayPrice: result.price || '',
    displayTips: result.tips || ''
  }),
  
  // 检查是否为有效搜索查询
  isValidQuery: (query) => {
    return query && query.trim().length >= 1;
  }
};
