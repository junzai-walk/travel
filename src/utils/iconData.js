// 旅游活动相关图标数据配置
import {
  // 交通类图标
  FaCar, FaBus, FaTrain, FaPlane, FaShip, FaBicycle, FaWalking, FaMotorcycle, FaTaxi,
  // 餐饮类图标
  FaUtensils, FaCoffee, FaPizzaSlice, FaHamburger, FaWineGlass, FaBeer, FaIceCream, FaCookie, FaAppleAlt, FaFish,
  // 景点类图标
  FaCamera, FaMountain, FaTree, FaUmbrellaBeach, FaMonument, FaChurch, FaCameraRetro, FaEye, FaMapMarkerAlt, FaCompass,
  // 住宿类图标
  FaBed, FaHotel, FaHome, FaBuilding, FaKey, FaDoorOpen, FaWifi, FaBath, FaSwimmingPool,
  // 购物类图标
  FaShoppingBag, FaShoppingCart, FaStore, FaGift, FaTshirt, FaGem, FaTag, FaCreditCard, FaMoneyBill, FaReceipt,
  // 娱乐类图标
  FaMusic, FaGamepad, FaFilm, FaTheaterMasks, FaDice, FaGuitar, FaMicrophone, FaDrum, FaHeadphones, FaTicketAlt,
  // 运动类图标
  FaRunning, FaSwimmer, FaSkiing, FaTableTennis, FaBasketballBall, FaFootballBall, FaVolleyballBall, FaBiking, FaHiking, FaFistRaised,
  // 文化类图标
  FaBook, FaUniversity, FaGraduationCap, FaPalette, FaScroll, FaLandmark, FaGlobe, FaLanguage, FaHistory,
  // 服务类图标
  FaHospital, FaPills, FaParking, FaInfoCircle, FaPhoneAlt, FaEnvelope, FaMapSigns, FaFirstAid,
  // 时间类图标
  FaClock, FaCalendarAlt, FaSun, FaMoon, FaSnowflake, FaUmbrella, FaHourglass, FaStopwatch,
  // 其他常用图标
  FaHeart, FaStar, FaFlag, FaCheckCircle, FaExclamationTriangle, FaQuestionCircle, FaLightbulb, FaRocket, FaMagic, FaTrophy
} from 'react-icons/fa';

import {
  // Bootstrap Icons 补充
  BsGeoAlt, BsMap, BsCompass, BsCameraFill, BsStarFill, BsHeartFill, BsBookmark, BsShare,
  BsCalendar3, BsClock, BsSun, BsMoon, BsUmbrella, BsThermometer,
  BsCupHot, BsEmojiSmile, BsEmojiLaughing, BsEmojiWink, BsHandThumbsUp, BsChat
} from 'react-icons/bs';

import {
  // Material Design Icons 补充
  MdRestaurant, MdLocalCafe, MdLocalBar, MdLocalGroceryStore, MdLocalHospital, MdLocalParking,
  MdDirectionsCar, MdDirectionsBus, MdDirectionsSubway, MdDirectionsWalk, MdDirectionsBike,
  MdPlace, MdLocationOn, MdExplore, MdNature, MdBeachAccess, MdPool, MdSpa, MdFitnessCenter,
  MdShoppingCart, MdStore, MdLocalMall, MdCardGiftcard, MdPayment, MdAccountBalance,
  MdMuseum, MdTheaters, MdLibraryBooks, MdSchool, MdChurch, MdCastle
} from 'react-icons/md';

// 图标分类配置
export const iconCategories = {
  '交通出行': {
    color: '#007bff',
    icons: [
      { icon: FaCar, name: '汽车', key: 'FaCar' },
      { icon: FaBus, name: '公交', key: 'FaBus' },
      { icon: FaTrain, name: '火车', key: 'FaTrain' },
      { icon: FaPlane, name: '飞机', key: 'FaPlane' },
      { icon: FaShip, name: '轮船', key: 'FaShip' },
      { icon: FaBicycle, name: '自行车', key: 'FaBicycle' },
      { icon: FaWalking, name: '步行', key: 'FaWalking' },
      { icon: FaMotorcycle, name: '摩托车', key: 'FaMotorcycle' },
      { icon: FaTaxi, name: '出租车', key: 'FaTaxi' },
      { icon: MdDirectionsCar, name: '驾车', key: 'MdDirectionsCar' },
      { icon: MdDirectionsBus, name: '公交车', key: 'MdDirectionsBus' },
      { icon: MdDirectionsSubway, name: '地铁站', key: 'MdDirectionsSubway' },
      { icon: MdDirectionsWalk, name: '步行路线', key: 'MdDirectionsWalk' },
      { icon: MdDirectionsBike, name: '骑行', key: 'MdDirectionsBike' }
    ]
  },
  '餐饮美食': {
    color: '#28a745',
    icons: [
      { icon: FaUtensils, name: '餐厅', key: 'FaUtensils' },
      { icon: FaCoffee, name: '咖啡', key: 'FaCoffee' },
      { icon: FaPizzaSlice, name: '披萨', key: 'FaPizzaSlice' },
      { icon: FaHamburger, name: '汉堡', key: 'FaHamburger' },
      { icon: FaWineGlass, name: '红酒', key: 'FaWineGlass' },
      { icon: FaBeer, name: '啤酒', key: 'FaBeer' },
      { icon: FaIceCream, name: '冰淇淋', key: 'FaIceCream' },
      { icon: FaCookie, name: '甜点', key: 'FaCookie' },
      { icon: FaAppleAlt, name: '水果', key: 'FaAppleAlt' },
      { icon: FaFish, name: '海鲜', key: 'FaFish' },
      { icon: MdRestaurant, name: '用餐', key: 'MdRestaurant' },
      { icon: MdLocalCafe, name: '咖啡厅', key: 'MdLocalCafe' },
      { icon: MdLocalBar, name: '酒吧', key: 'MdLocalBar' },
      { icon: BsCupHot, name: '热饮', key: 'BsCupHot' }
    ]
  },
  '景点游览': {
    color: '#ffc107',
    icons: [
      { icon: FaCamera, name: '拍照', key: 'FaCamera' },
      { icon: FaMountain, name: '山景', key: 'FaMountain' },
      { icon: FaTree, name: '公园', key: 'FaTree' },
      { icon: FaUmbrellaBeach, name: '海滩', key: 'FaUmbrellaBeach' },
      { icon: FaMonument, name: '纪念碑', key: 'FaMonument' },
      { icon: FaChurch, name: '教堂', key: 'FaChurch' },
      { icon: FaCameraRetro, name: '摄影', key: 'FaCameraRetro' },
      { icon: FaEye, name: '观光', key: 'FaEye' },
      { icon: FaMapMarkerAlt, name: '地标', key: 'FaMapMarkerAlt' },
      { icon: FaCompass, name: '探索', key: 'FaCompass' },
      { icon: BsGeoAlt, name: '位置', key: 'BsGeoAlt' },
      { icon: BsMap, name: '地图', key: 'BsMap' },
      { icon: BsCompass, name: '指南针', key: 'BsCompass' },
      { icon: BsCameraFill, name: '相机', key: 'BsCameraFill' },
      { icon: MdPlace, name: '地点', key: 'MdPlace' },
      { icon: MdLocationOn, name: '定位', key: 'MdLocationOn' },
      { icon: MdExplore, name: '探险', key: 'MdExplore' },
      { icon: MdNature, name: '自然', key: 'MdNature' },
      { icon: MdBeachAccess, name: '海滩度假', key: 'MdBeachAccess' }
    ]
  },
  '住宿休息': {
    color: '#6f42c1',
    icons: [
      { icon: FaBed, name: '住宿', key: 'FaBed' },
      { icon: FaHotel, name: '酒店', key: 'FaHotel' },
      { icon: FaHome, name: '民宿', key: 'FaHome' },
      { icon: FaBuilding, name: '宾馆', key: 'FaBuilding' },
      { icon: FaKey, name: '入住', key: 'FaKey' },
      { icon: FaDoorOpen, name: '房间', key: 'FaDoorOpen' },
      { icon: FaWifi, name: 'WiFi', key: 'FaWifi' },
      { icon: FaBath, name: '浴室', key: 'FaBath' },
      { icon: FaSwimmingPool, name: '游泳池', key: 'FaSwimmingPool' },
      { icon: FaHotel, name: '服务', key: 'FaHotel' },
      { icon: MdPool, name: '泳池', key: 'MdPool' },
      { icon: MdSpa, name: 'SPA', key: 'MdSpa' }
    ]
  },
  '购物消费': {
    color: '#e83e8c',
    icons: [
      { icon: FaShoppingBag, name: '购物袋', key: 'FaShoppingBag' },
      { icon: FaShoppingCart, name: '购物车', key: 'FaShoppingCart' },
      { icon: FaStore, name: '商店', key: 'FaStore' },
      { icon: FaGift, name: '礼品', key: 'FaGift' },
      { icon: FaTshirt, name: '服装', key: 'FaTshirt' },
      { icon: FaGem, name: '珠宝', key: 'FaGem' },
      { icon: FaTag, name: '标签', key: 'FaTag' },
      { icon: FaCreditCard, name: '信用卡', key: 'FaCreditCard' },
      { icon: FaMoneyBill, name: '现金', key: 'FaMoneyBill' },
      { icon: FaReceipt, name: '收据', key: 'FaReceipt' },
      { icon: MdShoppingCart, name: '购物', key: 'MdShoppingCart' },
      { icon: MdStore, name: '店铺', key: 'MdStore' },
      { icon: MdLocalMall, name: '商场', key: 'MdLocalMall' },
      { icon: MdCardGiftcard, name: '礼品卡', key: 'MdCardGiftcard' },
      { icon: MdPayment, name: '支付', key: 'MdPayment' }
    ]
  },
  '娱乐休闲': {
    color: '#fd7e14',
    icons: [
      { icon: FaMusic, name: '音乐', key: 'FaMusic' },
      { icon: FaGamepad, name: '游戏', key: 'FaGamepad' },
      { icon: FaFilm, name: '电影', key: 'FaFilm' },
      { icon: FaTheaterMasks, name: '戏剧', key: 'FaTheaterMasks' },
      { icon: FaDice, name: '娱乐', key: 'FaDice' },
      { icon: FaGuitar, name: '吉他', key: 'FaGuitar' },
      { icon: FaMicrophone, name: '麦克风', key: 'FaMicrophone' },
      { icon: FaDrum, name: '鼓', key: 'FaDrum' },
      { icon: FaHeadphones, name: '耳机', key: 'FaHeadphones' },
      { icon: FaTicketAlt, name: '门票', key: 'FaTicketAlt' },
      { icon: MdTheaters, name: '剧院', key: 'MdTheaters' },
      { icon: BsEmojiSmile, name: '开心', key: 'BsEmojiSmile' },
      { icon: BsEmojiLaughing, name: '大笑', key: 'BsEmojiLaughing' },
      { icon: BsEmojiWink, name: '眨眼', key: 'BsEmojiWink' }
    ]
  },
  '运动健身': {
    color: '#20c997',
    icons: [
      { icon: FaRunning, name: '跑步', key: 'FaRunning' },
      { icon: FaSwimmer, name: '游泳', key: 'FaSwimmer' },
      { icon: FaSkiing, name: '滑雪', key: 'FaSkiing' },
      { icon: FaTableTennis, name: '乒乓球', key: 'FaTableTennis' },
      { icon: FaBasketballBall, name: '篮球', key: 'FaBasketballBall' },
      { icon: FaFootballBall, name: '足球', key: 'FaFootballBall' },
      { icon: FaVolleyballBall, name: '排球', key: 'FaVolleyballBall' },
      { icon: FaBiking, name: '骑行', key: 'FaBiking' },
      { icon: FaHiking, name: '徒步', key: 'FaHiking' },
      { icon: FaFistRaised, name: '健身', key: 'FaFistRaised' },
      { icon: MdFitnessCenter, name: '健身房', key: 'MdFitnessCenter' }
    ]
  },
  '文化教育': {
    color: '#6610f2',
    icons: [
      { icon: FaBook, name: '书籍', key: 'FaBook' },
      { icon: FaUniversity, name: '大学', key: 'FaUniversity' },
      { icon: FaGraduationCap, name: '毕业', key: 'FaGraduationCap' },
      { icon: FaPalette, name: '艺术', key: 'FaPalette' },
      { icon: FaBook, name: '文学', key: 'FaBook' },
      { icon: FaScroll, name: '卷轴', key: 'FaScroll' },
      { icon: FaLandmark, name: '地标', key: 'FaLandmark' },
      { icon: FaGlobe, name: '全球', key: 'FaGlobe' },
      { icon: FaLanguage, name: '语言', key: 'FaLanguage' },
      { icon: FaHistory, name: '历史', key: 'FaHistory' },
      { icon: MdMuseum, name: '博物馆', key: 'MdMuseum' },
      { icon: MdLibraryBooks, name: '图书馆', key: 'MdLibraryBooks' },
      { icon: MdSchool, name: '学校', key: 'MdSchool' },
      { icon: MdCastle, name: '城堡', key: 'MdCastle' }
    ]
  },
  '服务设施': {
    color: '#dc3545',
    icons: [
      { icon: FaHospital, name: '医院', key: 'FaHospital' },
      { icon: FaPills, name: '药店', key: 'FaPills' },
      { icon: FaCar, name: '加油站', key: 'FaCar' },
      { icon: FaParking, name: '停车场', key: 'FaParking' },
      { icon: FaBuilding, name: '洗手间', key: 'FaBuilding' },
      { icon: FaInfoCircle, name: '信息', key: 'FaInfoCircle' },
      { icon: FaPhoneAlt, name: '电话', key: 'FaPhoneAlt' },
      { icon: FaEnvelope, name: '邮件', key: 'FaEnvelope' },
      { icon: FaMapSigns, name: '路标', key: 'FaMapSigns' },
      { icon: FaFirstAid, name: '急救', key: 'FaFirstAid' },
      { icon: MdLocalHospital, name: '医疗', key: 'MdLocalHospital' },
      { icon: MdLocalParking, name: '停车', key: 'MdLocalParking' },
      { icon: MdAccountBalance, name: '银行', key: 'MdAccountBalance' }
    ]
  },
  '时间天气': {
    color: '#17a2b8',
    icons: [
      { icon: FaClock, name: '时钟', key: 'FaClock' },
      { icon: FaCalendarAlt, name: '日历', key: 'FaCalendarAlt' },
      { icon: FaSun, name: '晴天', key: 'FaSun' },
      { icon: FaMoon, name: '夜晚', key: 'FaMoon' },
      { icon: FaSun, name: '多云', key: 'FaSun' },
      { icon: FaSnowflake, name: '雪花', key: 'FaSnowflake' },
      { icon: FaUmbrella, name: '雨伞', key: 'FaUmbrella' },
      { icon: FaSun, name: '温度', key: 'FaSun' },
      { icon: FaHourglass, name: '沙漏', key: 'FaHourglass' },
      { icon: FaStopwatch, name: '秒表', key: 'FaStopwatch' },
      { icon: BsCalendar3, name: '日程', key: 'BsCalendar3' },
      { icon: BsClock, name: '时间', key: 'BsClock' },
      { icon: BsSun, name: '阳光', key: 'BsSun' },
      { icon: BsMoon, name: '月亮', key: 'BsMoon' },
      { icon: BsSun, name: '晴转多云', key: 'BsSun' },
      { icon: BsUmbrella, name: '下雨', key: 'BsUmbrella' },
      { icon: BsThermometer, name: '气温', key: 'BsThermometer' }
    ]
  },
  '特殊标记': {
    color: '#6c757d',
    icons: [
      { icon: FaHeart, name: '喜爱', key: 'FaHeart' },
      { icon: FaStar, name: '星标', key: 'FaStar' },
      { icon: FaFlag, name: '旗帜', key: 'FaFlag' },
      { icon: FaCheckCircle, name: '完成', key: 'FaCheckCircle' },
      { icon: FaExclamationTriangle, name: '警告', key: 'FaExclamationTriangle' },
      { icon: FaQuestionCircle, name: '疑问', key: 'FaQuestionCircle' },
      { icon: FaLightbulb, name: '想法', key: 'FaLightbulb' },
      { icon: FaRocket, name: '火箭', key: 'FaRocket' },
      { icon: FaMagic, name: '魔法', key: 'FaMagic' },
      { icon: FaTrophy, name: '奖杯', key: 'FaTrophy' },
      { icon: BsStarFill, name: '实心星', key: 'BsStarFill' },
      { icon: BsHeartFill, name: '实心心', key: 'BsHeartFill' },
      { icon: BsBookmark, name: '书签', key: 'BsBookmark' },
      { icon: BsShare, name: '分享', key: 'BsShare' },
      { icon: BsHandThumbsUp, name: '点赞', key: 'BsHandThumbsUp' },
      { icon: BsChat, name: '聊天', key: 'BsChat' }
    ]
  }
};

// 默认图标映射（用于向后兼容emoji图标）
export const defaultIconMapping = {
  '🚄': { icon: FaTrain, key: 'FaTrain' },
  '🏨': { icon: FaHotel, key: 'FaHotel' },
  '🏠': { icon: FaHome, key: 'FaHome' },
  '🍽️': { icon: FaUtensils, key: 'FaUtensils' },
  '📍': { icon: FaMapMarkerAlt, key: 'FaMapMarkerAlt' },
  '🚗': { icon: FaCar, key: 'FaCar' },
  '🚌': { icon: FaBus, key: 'FaBus' },
  '✈️': { icon: FaPlane, key: 'FaPlane' },
  '🚶': { icon: FaWalking, key: 'FaWalking' },
  '📷': { icon: FaCamera, key: 'FaCamera' },
  '🏔️': { icon: FaMountain, key: 'FaMountain' },
  '🌳': { icon: FaTree, key: 'FaTree' },
  '🏖️': { icon: FaUmbrellaBeach, key: 'FaUmbrellaBeach' },
  '⛪': { icon: FaChurch, key: 'FaChurch' },
  '🛍️': { icon: FaShoppingBag, key: 'FaShoppingBag' },
  '🎵': { icon: FaMusic, key: 'FaMusic' },
  '🎮': { icon: FaGamepad, key: 'FaGamepad' },
  '🏃': { icon: FaRunning, key: 'FaRunning' },
  '📚': { icon: FaBook, key: 'FaBook' },
  '🏥': { icon: FaHospital, key: 'FaHospital' },
  '⏰': { icon: FaClock, key: 'FaClock' },
  '☀️': { icon: FaSun, key: 'FaSun' },
  '🌙': { icon: FaMoon, key: 'FaMoon' },
  '❤️': { icon: FaHeart, key: 'FaHeart' },
  '⭐': { icon: FaStar, key: 'FaStar' },
  '🚩': { icon: FaFlag, key: 'FaFlag' }
};

// 获取所有图标的扁平化列表
export const getAllIcons = () => {
  const allIcons = [];
  Object.entries(iconCategories).forEach(([categoryName, categoryData]) => {
    categoryData.icons.forEach(iconData => {
      allIcons.push({
        ...iconData,
        category: categoryName,
        categoryColor: categoryData.color
      });
    });
  });
  return allIcons;
};

// 根据关键词搜索图标
export const searchIcons = (query) => {
  if (!query.trim()) return getAllIcons();
  
  const normalizedQuery = query.toLowerCase().trim();
  const allIcons = getAllIcons();
  
  return allIcons.filter(iconData => 
    iconData.name.toLowerCase().includes(normalizedQuery) ||
    iconData.key.toLowerCase().includes(normalizedQuery) ||
    iconData.category.toLowerCase().includes(normalizedQuery)
  );
};

// 根据key获取图标组件
export const getIconByKey = (key) => {
  const allIcons = getAllIcons();
  const iconData = allIcons.find(icon => icon.key === key);
  return iconData ? iconData.icon : null;
};

// 将emoji转换为React图标
export const convertEmojiToIcon = (emoji) => {
  return defaultIconMapping[emoji] || { icon: FaMapMarkerAlt, key: 'FaMapMarkerAlt' };
};
