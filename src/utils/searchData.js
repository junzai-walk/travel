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
    keywords: ['湖泊', '风景', '休闲', '公园', '自然', '云龙湖', '水景'],
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
    keywords: ['博物馆', '历史', '文化', '汉代', '文物', '展览', '古迹'],
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
    keywords: ['公园', '彭祖', '文化', '休闲', '绿化', '健身', '晨练'],
    rating: 4.3,
    location: { lat: 34.2456, lng: 117.1889 },
    tips: '适合晨练和散步，有很多健身设施',
    icon: '🌳',
    address: '徐州市泉山区泰山路'
  },
  {
    id: 'han-culture-scenic-area',
    name: '汉文化景区',
    type: '景点',
    category: 'attraction',
    description: '集汉代文化展示、考古发现、文物保护为一体的大型景区',
    keywords: ['汉文化', '考古', '文物', '历史', '景区', '汉代', '文化遗产'],
    rating: 4.7,
    location: { lat: 34.2089, lng: 117.2456 },
    tips: '建议安排半天时间游览，有导游讲解服务',
    icon: '🏺',
    address: '徐州市鼓楼区襄王路6号'
  },
  {
    id: 'xuzhou-aquarium',
    name: '徐州海洋世界',
    type: '景点',
    category: 'attraction',
    description: '大型海洋主题公园，有丰富的海洋生物展示和表演',
    keywords: ['海洋世界', '水族馆', '海洋生物', '表演', '亲子', '娱乐'],
    rating: 4.4,
    location: { lat: 34.2234, lng: 117.2678 },
    tips: '适合亲子游，建议观看海豚表演',
    icon: '🐠',
    address: '徐州市云龙区三环南路'
  },
  {
    id: 'xuzhou-zoo',
    name: '徐州动物园',
    type: '景点',
    category: 'attraction',
    description: '拥有多种珍稀动物的综合性动物园',
    keywords: ['动物园', '动物', '亲子', '熊猫', '老虎', '娱乐', '教育'],
    rating: 4.2,
    location: { lat: 34.2345, lng: 117.2123 },
    tips: '周末人较多，建议平日前往',
    icon: '🦁',
    address: '徐州市泉山区湖滨路'
  },
  {
    id: 'xuzhou-botanical-garden',
    name: '徐州植物园',
    type: '景点',
    category: 'attraction',
    description: '集植物科研、观赏、科普教育为一体的综合性植物园',
    keywords: ['植物园', '花卉', '科普', '自然', '摄影', '春游', '赏花'],
    rating: 4.1,
    location: { lat: 34.2567, lng: 117.2890 },
    tips: '春季花开时节最美，适合摄影',
    icon: '🌸',
    address: '徐州市泉山区丰乐大道'
  },
  {
    id: 'xuzhou-ancient-city',
    name: '徐州古城',
    type: '景点',
    category: 'attraction',
    description: '保存完好的古城墙和历史街区，体验古代徐州风貌',
    keywords: ['古城', '城墙', '历史', '古建筑', '文化', '古街', '传统'],
    rating: 4.0,
    location: { lat: 34.2012, lng: 117.1987 },
    tips: '夜景很美，建议傍晚时分游览',
    icon: '🏯',
    address: '徐州市鼓楼区古城路'
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
    keywords: ['特色菜', '鸡肉', '锅贴', '徐州菜', '地方菜', '地锅', '农家菜'],
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
    keywords: ['羊肉', '泡馍', '传统', '小吃', '汤', '面食', '清真'],
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
    keywords: ['烧饼', '早餐', '传统', '酥脆', '面食', '小吃', '街头美食'],
    rating: 4.2,
    price: '3-5元',
    location: { lat: 34.2150, lng: 117.2100 },
    tips: '趁热吃最香，可配豆浆或粥',
    icon: '🥖',
    address: '徐州市各早餐店'
  },
  {
    id: 'xuzhou-miantiao',
    name: '徐州面条',
    type: '美食',
    category: 'food',
    description: '徐州特色手工面条，劲道爽滑，汤头鲜美',
    keywords: ['面条', '手工', '汤面', '特色', '面食', '传统', '小吃'],
    rating: 4.5,
    price: '15-25元',
    location: { lat: 34.2178, lng: 117.2034 },
    tips: '推荐牛肉面和鸡蛋面，汤头浓郁',
    icon: '🍝',
    address: '徐州市各面馆'
  },
  {
    id: 'xuzhou-baozi',
    name: '徐州包子',
    type: '美食',
    category: 'food',
    description: '皮薄馅大的传统包子，有多种口味选择',
    keywords: ['包子', '早餐', '传统', '面食', '小吃', '蒸食', '馅料'],
    rating: 4.3,
    price: '8-15元',
    location: { lat: 34.2145, lng: 117.2067 },
    tips: '推荐猪肉大葱和韭菜鸡蛋馅',
    icon: '🥟',
    address: '徐州市各早餐店'
  },
  {
    id: 'xuzhou-doupi',
    name: '徐州豆皮',
    type: '美食',
    category: 'food',
    description: '香嫩可口的豆制品小吃，营养丰富',
    keywords: ['豆皮', '豆制品', '小吃', '素食', '健康', '传统', '街头美食'],
    rating: 4.1,
    price: '5-10元',
    location: { lat: 34.2189, lng: 117.2012 },
    tips: '可以配辣椒酱或蒜泥，味道更佳',
    icon: '🥢',
    address: '徐州市各小吃摊'
  },
  {
    id: 'xuzhou-tangbao',
    name: '徐州汤包',
    type: '美食',
    category: 'food',
    description: '皮薄汁多的传统汤包，鲜美可口',
    keywords: ['汤包', '小笼包', '传统', '面食', '鲜汁', '早餐', '点心'],
    rating: 4.6,
    price: '12-20元',
    location: { lat: 34.2156, lng: 117.2089 },
    tips: '小心烫嘴，建议先咬个小口散热',
    icon: '🥟',
    address: '徐州市各包子店'
  },
  {
    id: 'xuzhou-jianbing',
    name: '徐州煎饼',
    type: '美食',
    category: 'food',
    description: '香脆可口的传统煎饼，配菜丰富',
    keywords: ['煎饼', '早餐', '街头美食', '传统', '小吃', '快餐', '便民'],
    rating: 4.0,
    price: '6-12元',
    location: { lat: 34.2134, lng: 117.2045 },
    tips: '可以加鸡蛋、火腿等配菜',
    icon: '🥞',
    address: '徐州市各早餐摊'
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
    keywords: ['五星级', '豪华', '万豪', '商务', '高端', '酒店', '住宿'],
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
    keywords: ['经济型', '连锁', '性价比', '便利', '如家', '酒店', '住宿'],
    rating: 4.2,
    price: '150-250元/晚',
    location: { lat: 34.2200, lng: 117.1900 },
    tips: '提前预订有优惠，近地铁站',
    icon: '🏩',
    address: '徐州市多个地点'
  },
  {
    id: 'jinjiang-inn',
    name: '锦江之星',
    type: '住宿',
    category: 'accommodation',
    description: '知名连锁酒店品牌，服务标准化，环境舒适',
    keywords: ['连锁', '锦江', '标准化', '舒适', '商务', '酒店', '住宿'],
    rating: 4.3,
    price: '180-280元/晚',
    location: { lat: 34.2189, lng: 117.2045 },
    tips: '会员有优惠，房间干净整洁',
    icon: '🏨',
    address: '徐州市云龙区建国西路'
  },
  {
    id: 'hanting-hotel',
    name: '汉庭酒店',
    type: '住宿',
    category: 'accommodation',
    description: '经济型连锁酒店，价格实惠，位置便利',
    keywords: ['经济型', '汉庭', '实惠', '便利', '连锁', '酒店', '住宿'],
    rating: 4.1,
    price: '120-200元/晚',
    location: { lat: 34.2234, lng: 117.1978 },
    tips: '性价比很高，适合预算有限的游客',
    icon: '🏩',
    address: '徐州市鼓楼区中山北路'
  },
  {
    id: 'xuzhou-hotel',
    name: '徐州饭店',
    type: '住宿',
    category: 'accommodation',
    description: '老牌四星级酒店，历史悠久，服务周到',
    keywords: ['四星级', '老牌', '历史', '服务', '传统', '酒店', '住宿'],
    rating: 4.4,
    price: '300-450元/晚',
    location: { lat: 34.2145, lng: 117.2123 },
    tips: '地理位置优越，近市中心',
    icon: '🏨',
    address: '徐州市云龙区解放路'
  },
  {
    id: 'youth-hostel',
    name: '徐州青年旅舍',
    type: '住宿',
    category: 'accommodation',
    description: '经济实惠的青年旅舍，适合背包客和学生',
    keywords: ['青年旅舍', '经济', '背包客', '学生', '便宜', '住宿', '社交'],
    rating: 3.9,
    price: '50-100元/晚',
    location: { lat: 34.2178, lng: 117.2067 },
    tips: '有公共厨房和休息区，氛围轻松',
    icon: '🏠',
    address: '徐州市泉山区大学路'
  },
  {
    id: 'boutique-hotel',
    name: '徐州精品酒店',
    type: '住宿',
    category: 'accommodation',
    description: '设计感强的精品酒店，环境优雅，服务贴心',
    keywords: ['精品', '设计', '优雅', '贴心', '特色', '酒店', '住宿'],
    rating: 4.6,
    price: '400-600元/晚',
    location: { lat: 34.2267, lng: 117.2156 },
    tips: '房间设计独特，适合情侣和商务人士',
    icon: '🏨',
    address: '徐州市云龙区民主北路'
  },
  {
    id: 'business-hotel',
    name: '徐州商务酒店',
    type: '住宿',
    category: 'accommodation',
    description: '专为商务人士设计的酒店，会议设施齐全',
    keywords: ['商务', '会议', '设施', '专业', '办公', '酒店', '住宿'],
    rating: 4.5,
    price: '350-500元/晚',
    location: { lat: 34.2198, lng: 117.2234 },
    tips: '有商务中心和会议室，WiFi速度快',
    icon: '🏢',
    address: '徐州市鼓楼区淮海西路'
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
    keywords: ['火车站', '高铁', '列车', '交通枢纽', '铁路', '出行'],
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
    keywords: ['机场', '航班', '国际', '观音机场', '飞机', '出行'],
    rating: 4.1,
    location: { lat: 34.0597, lng: 117.5553 },
    tips: '距市区约40公里，建议预留充足时间',
    icon: '✈️',
    address: '徐州市睢宁县双沟镇'
  },
  {
    id: 'xuzhou-east-station',
    name: '徐州东站',
    type: '交通',
    category: 'transportation',
    description: '高铁专用站，连接京沪高铁线路',
    keywords: ['高铁站', '京沪高铁', '东站', '快速', '交通', '出行'],
    rating: 4.5,
    location: { lat: 34.2456, lng: 117.3123 },
    tips: '高铁专用站，速度快，班次多',
    icon: '🚅',
    address: '徐州市云龙区东郊'
  },
  {
    id: 'xuzhou-bus-station',
    name: '徐州汽车总站',
    type: '交通',
    category: 'transportation',
    description: '长途汽车客运站，连接周边城市',
    keywords: ['汽车站', '长途', '客运', '巴士', '交通', '出行'],
    rating: 4.0,
    location: { lat: 34.2234, lng: 117.1945 },
    tips: '有到周边各县市的班车',
    icon: '🚌',
    address: '徐州市鼓楼区建国西路'
  },
  {
    id: 'xuzhou-metro',
    name: '徐州地铁',
    type: '交通',
    category: 'transportation',
    description: '徐州市内轨道交通，方便快捷',
    keywords: ['地铁', '轨道交通', '市内', '便民', '快捷', '出行'],
    rating: 4.4,
    location: { lat: 34.2167, lng: 117.2000 },
    tips: '覆盖主要景点和商圈，推荐使用',
    icon: '🚇',
    address: '徐州市各地铁站点'
  },
  {
    id: 'xuzhou-taxi',
    name: '徐州出租车',
    type: '交通',
    category: 'transportation',
    description: '市内出租车服务，24小时运营',
    keywords: ['出租车', '打车', '市内', '便民', '24小时', '出行'],
    rating: 3.8,
    location: { lat: 34.2167, lng: 117.2000 },
    tips: '起步价8元，可使用打车软件',
    icon: '🚕',
    address: '徐州市各区域'
  },
  {
    id: 'xuzhou-bike-sharing',
    name: '徐州共享单车',
    type: '交通',
    category: 'transportation',
    description: '环保便民的共享单车服务',
    keywords: ['共享单车', '环保', '便民', '骑行', '绿色出行', '健康'],
    rating: 4.2,
    location: { lat: 34.2167, lng: 117.2000 },
    tips: '适合短距离出行，环保健康',
    icon: '🚲',
    address: '徐州市各投放点'
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
      // 检查是否在浏览器环境
      if (typeof localStorage !== 'undefined') {
        const history = localStorage.getItem('xuzhou-search-history');
        return history ? JSON.parse(history) : [];
      }
      return [];
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

    // 检查是否在浏览器环境
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('xuzhou-search-history', JSON.stringify(newHistory));
    }
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
    // 检查是否在浏览器环境
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('xuzhou-search-history');
    }
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
