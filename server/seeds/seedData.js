import { connectDB, syncDB, disconnectDB } from '../src/config/database.js';
import { Checklist, Itinerary, Activities, BudgetReference, Expenses } from '../src/models/index.js';
import { logger } from '../src/utils/logger.js';

// 默认清单数据（基于实际行程需求优化）
const defaultChecklistData = [
  { item_name: '身份证', category: '证件类', priority: '高', is_completed: false, notes: '' },
  { item_name: '手机充电器', category: '电子设备', priority: '高', is_completed: false, notes: '' },
  { item_name: '防晒衣、袖、帽', category: '衣物类', priority: '中', is_completed: false, notes: '' },
  { item_name: '游泳套装（圈、防水袋）', category: '衣物类', priority: '高', is_completed: false, notes: '' },
  { item_name: '2套衣服（包括内衣、袜子）', category: '衣物类', priority: '高', is_completed: false, notes: '' },
  { item_name: '拖鞋', category: '衣物类', priority: '高', is_completed: false, notes: '' },
  { item_name: '穿一双运动鞋', category: '衣物类', priority: '高', is_completed: false, notes: '' },
  { item_name: '现金和银行卡', category: '证件类', priority: '高', is_completed: false, notes: '' },
  { item_name: '冰水', category: '其他', priority: '中', is_completed: false, notes: '' },
  { item_name: '雨伞', category: '其他', priority: '低', is_completed: false, notes: '' },
  { item_name: '零食和水', category: '其他', priority: '低', is_completed: false, notes: '' },
  { item_name: '牙具', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '水乳、补水喷雾', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '洗面奶、卸妆膏', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '防晒霜/喷雾', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '气垫、遮瑕', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '散粉、定妆喷雾', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '眉笔、眼线笔、睫毛膏', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '眼影、修容、高光', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '腮红、口红', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '双眼皮贴、假睫毛', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '化妆沐浴露、洗发水、护发素刷', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '浴巾', category: '洗护用品', priority: '低', is_completed: false, notes: '' },
  { item_name: '充电器', category: '电子设备', priority: '高', is_completed: false, notes: '' },
  { item_name: '充电宝', category: '电子设备', priority: '高', is_completed: false, notes: '' },
  { item_name: '拍照支架', category: '电子设备', priority: '中', is_completed: false, notes: '' },
  { item_name: '纸巾、湿巾', category: '日常用品', priority: '中', is_completed: false, notes: '' },
  { item_name: '晴雨伞', category: '日常用品', priority: '中', is_completed: false, notes: '' },
  { item_name: '梳子、镜子', category: '日常用品', priority: '中', is_completed: false, notes: '' },
  { item_name: '配饰', category: '日常用品', priority: '中', is_completed: false, notes: '' },
  { item_name: '一次性马桶垫', category: '日常用品', priority: '中', is_completed: false, notes: '' },
];

// 默认行程数据（基于实际Excel表格数据，修正日期对应关系）
const defaultItineraryData = [
  // 2024年7月18日（周五）- 出发日
  { date: '2025-07-18', time: '20:00', activity: '南京南站集合', description: 'G2700次高铁，检票口A9，推荐北广场进', tips: '建议提前网上购票，注意检票时间', location: '南京南站', duration: 31, status: '计划中', icon: 'FaTrain' },
  { date: '2025-07-18', time: '20:31', activity: '南京南 → 徐州东', description: '乘坐高铁G2700，07车06B、06C，约1小时34分钟', tips: '可以在车上休息，准备第二天的行程', location: '高铁上', duration: 94, status: '计划中', icon: 'FaTrain' },
  { date: '2025-07-18', time: '22:05', activity: '徐州东站-季末▪轻居酒店', description: 'PlanA：地铁1号线路窝方向，13站约30min，人民广场2号口出；PlanB：打车14.9公里，约30min，￥20起。\n综合出行时长、费用，建议乘坐地铁。\n注：地铁徐州东站末班车时间22:30。', tips: '注意：地铁徐州东站末班车时间22:30', location: '徐州东站', duration: 35, status: '计划中', icon: 'MdDirectionsSubway' },
  { date: '2025-07-18', time: '22:40', activity: '季末▪轻居酒店入住', description: '无早餐；\n租号的电动车。', tips: '酒店位置优越，人民广场地铁站附近', location: '季末轻居酒店', duration: 20, status: '计划中', icon: 'FaHotel' },
  { date: '2025-07-18', time: '23:00', activity: '晚餐·小烧烤', description: 'PlanA：绿地三只羊（李呀理店），骑行5min\n PlanB：老广烧烤，骑行6min\n PlanC：老拾烧烤（徐宝生活广场总店），骑行5min', tips: '可以尝试徐州特色烧烤', location: '酒店附近', duration: 60, status: '计划中', icon: 'FaUtensils' },
  { date: '2025-07-18', time: '23:50', activity: '回酒店', description: '赶紧洗洗刷刷早点休息，第二天一早要看日出哦', tips: '早点休息，为第二天行程做准备', location: '酒店', duration: 480, status: '计划中', icon: 'FaBed' },

  // 2024年7月19日（周六）- 全天游览
  { date: '2025-07-19', time: '04:15', activity: '云龙山', description: '看日出路线：北门上山（正对博物馆大门），20min就能爬上观景台', tips: '保持良好的精神状态', location: '酒店', duration: 60, status: '计划中', icon: 'FaMountain' },
  { date: '2025-07-19', time: '06:30', activity: '早餐·米线', description: 'PlanA：一品飘香健康米线（9:00开门）PlanB：九中牛记米线（8:00开门）PlanC：建国刘记米线（兴隆街店）6:00开门，电动车16minPlanD：马市街饣它汤（据说周末人巨多，得巨早排队）', location: '里堂水线', duration: 60, status: '计划中', icon: 'FaUtensils' },
  { date: '2025-07-19', time: '07:30', activity: '回酒店补觉', description: '太早起来，得睡个回笼觉~', tips: '', location: '云龙山', duration: 60, status: '计划中', icon: 'FaBed' },
  { date: '2025-07-19', time: '11:00', activity: '起床化妆', description: '懒人可以再多睡一会儿', tips: '', location: '云龙湖', duration: 90, status: '计划中', icon: 'MdNature' },
  { date: '2025-07-19', time: '12:00', activity: '午餐', description: 'PlanA：什一餐厅（矿山东路总店）PlanB：老家地锅鸡 PlanC：田记餐馆 其他：云龙让茶（茉莉山楂、清平乐、落玫观山）、夏抱冰、蜜城之恋（西红柿鸡蛋汤、水果茶）', tips: '品尝当地特色菜', location: '餐厅', duration: 90, status: '计划中', icon: 'MdRestaurant' },
  { date: '2025-07-19', time: '15:00', activity: '徐州乐园加勒比水世界', description: '晚场15:00点进。记得带手机防水袋、泳衣、拖鞋、泳圈、速干毛巾哦', tips: '注意防晒和安全', location: '徐州乐园', duration: 270, status: '计划中', icon: 'FaSwimmingPool' },
  { date: '2025-07-19', time: '19:30', activity: '晚餐', description: 'PlanA：贾青羊肉串（户部山店）PlanB：老广烧烤（户部山店）PlanC：三只羊（户部山店） PlanD：高姐烧烤 哪个不用排队吃那个', location: '餐厅', duration: 90, status: '计划中', icon: 'FaUtensils' },
  { date: '2025-07-19', time: '20:30', activity: '云龙湖', description: '路线：📍滨湖公园东门➡️右转进入湖东路➡️汉画像石馆➡️云龙山索道西站➡️金山公园（水杉步道拍照出片）➡️红绿灯右转进入湖南路➡️彭城风华（每晚演出时间7点） ➡️龙华桥（夏天赏荷花）➡️沉水廊道（观湖中锦鲤）➡️三岔路口右转进入珠山东路➡️天师广场（免费观瀑布）➡️路口右转入湖中路➡️水族馆（景点在改造升级，可与周边的猫咪嬉戏）➡️音乐桥（观日落、拍照都超美）➡️直行上坡小路➡️如意路➡️滨湖新天地步行街（高端美食）➡️水晶宫码头（观湖光山色）➡️滨湖公园东门', tips: '夜景很美，适合拍照', location: '云龙湖', duration: 90, status: '计划中', icon: 'FaCamera' },
  { date: '2025-07-19', time: '22:00', activity: '回酒店休息', description: '累了一天，好好休息', tips: '早点休息，恢复体力', location: '酒店', duration: 600, status: '计划中', icon: 'FaBed' },

  // 2024年7月20日（周日）- 返程日
  { date: '2025-07-20', time: '08:00', activity: '起床', description: '化个美美的妆，开启元气满满的一天', tips: '整理行李，准备退房', location: '酒店', duration: 60, status: '计划中', icon: 'FaSun' },
  { date: '2025-07-20', time: '09:00', activity: '早餐', description: '老六中米线总店', tips: '品尝最后一顿徐州美食', location: '米线店', duration: 30, status: '计划中', icon: 'FaUtensils' },
  { date: '2025-07-20', time: '10:00', activity: '老六中-彭祖园', description: '1公里，步行16min', tips: '根据实际需要安排', location: '新租房', duration: 90, status: '计划中', icon: 'FaWalking' },
  { date: '2025-07-20', time: '11:00', activity: '午餐+彭祖园→ 午餐', description: 'PlanA：王家味炒鸡店（永嘉金色雅筑店），打车16min，推荐：炒鸡、一品茄子、松鼠鱼、铁板豆腐PlanB：大张洛馍村（就近）PlanC：逛吃，小吃 PlanB：大张洛馍村（就近）', tips: '蜜三刀、牛蒡茶都是不错的选择', location: '商场/特产店', duration: 90, status: '计划中', icon: 'FaShoppingBag' },
  { date: '2025-07-20', time: '12:30', activity: '午餐店→ 徐州博物馆', description: '游览时长预计2小时', location: '徐州博物馆', duration: 128, status: '计划中', icon: 'MdMuseum' },
  { date: '2025-07-20', time: '14:50', activity: '徐州博物馆→ 徐州站', description: '地铁或打车', tips: '预留充足时间，注意车站区别', location: '徐州站', duration: 48, status: '计划中', icon: 'FaCar' },
  { date: '2025-07-20', time: '15:38', activity: '徐州站 → 南京站', description: '返程火车K347，硬卧，04车14号下铺、18号中铺。15:38-19:51，约4小时13分钟', tips: '可以在车上整理照片，回味旅程', location: '火车上', duration: 253, status: '计划中', icon: 'FaTrain' },
  { date: '2025-07-20', time: '19:51', activity: '南京站', description: '愉快的徐州之旅结束', tips: '记得分享旅行的美好回忆', location: '南京站', duration: 30, status: '计划中', icon: 'FaHome' }
];

// 默认活动规划数据（基于实际Excel表格活动）
const defaultActivitiesData = [
  { title: '云龙山登山观景', category: '景点游览', description: '北门上山（正门停车难），20min新鲜爬上观景台，下山回到门口约1小时', location: '云龙山', estimated_cost: 0, estimated_duration: 60, priority: '必去', season_suitable: '四季皆宜', tips: '建议从北门上山，避开停车难问题', contact_info: '', opening_hours: '全天开放' },
  { title: '云龙湖风景区游览', category: '景点游览', description: '徐州最美的景点，湖光山色，适合散步拍照，夜景尤其美丽', location: '云龙湖风景区', estimated_cost: 0, estimated_duration: 180, priority: '必去', season_suitable: '四季皆宜', tips: '推荐路线：滑湖公园门口→石佛寺入口→海拔公园→云龙山主道→会山公园→红楼→彭祖园→龙华寺→观景台', contact_info: '', opening_hours: '全天开放' },
  { title: '徐州乐园动物园水世界', category: '休闲娱乐', description: '晚场15:00开始，包含动物园和水世界项目', location: '徐州乐园', estimated_cost: 186, estimated_duration: 270, priority: '推荐', season_suitable: '夏季', tips: '记得带泳衣、水镜、冰水、抹布、沐浴用品，注意防晒', contact_info: '', opening_hours: '15:00-21:00（晚场）' },
  { title: '徐州博物馆参观', category: '文化活动', description: '了解徐州深厚的历史文化，最后的文化体验', location: '徐州博物馆', estimated_cost: 0, estimated_duration: 128, priority: '推荐', season_suitable: '四季皆宜', tips: '建议安排在行程最后，作为文化总结', contact_info: '', opening_hours: '9:00-17:00' },
  { title: '里堂·水线特色早餐', category: '美食体验', description: '品尝一品蟹黄灌汤包等徐州特色早餐', location: '里堂水线', estimated_cost: 60, estimated_duration: 60, priority: '推荐', season_suitable: '四季皆宜', tips: '徐州特色早餐，值得品尝', contact_info: '', opening_hours: '7:00-11:00' },
  { title: '附近觅食·小烧烤', category: '美食体验', description: '续地三兄弟（李记烧烤店/矿山路店）或老广烧烤', location: '酒店附近', estimated_cost: 238, estimated_duration: 60, priority: '推荐', season_suitable: '四季皆宜', tips: '徐州特色烧烤，夜宵好选择', contact_info: '', opening_hours: '18:00-02:00' },
  { title: '季末轻居酒店住宿', category: '住宿', description: '位于人民广场地铁站附近，交通便利', location: '人民广场附近', estimated_cost: 249, estimated_duration: 720, priority: '必去', season_suitable: '四季皆宜', tips: '提前预订，性价比高，位置优越', contact_info: '', opening_hours: '24小时' },
  { title: '老六中米线店', category: '美食体验', description: '最后一天的特色早餐', location: '米线店', estimated_cost: 60, estimated_duration: 30, priority: '推荐', season_suitable: '四季皆宜', tips: '品尝最后一顿徐州美食', contact_info: '', opening_hours: '7:00-11:00' }
];

// 默认预算参考数据（基于实际Excel表格费用数据）
const defaultBudgetData = [
  { category: '餐饮费', item_name: '7.18 晚餐·小烧烤', min_amount: 50, max_amount: 80, recommended_amount: 238, unit: '元', description: 'PlanA：绿地三只羊（李呀理店），骑行5min PlanB：老广烧烤，骑行6min PlanC：老拾烧烤（徐宝生活广场总店），骑行5min', tips: '徐州特色早餐，值得品尝', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '7.19 早餐·米线', min_amount: 150, max_amount: 250, recommended_amount: 60, unit: '元', description: 'PlanA：一品飘香健康米线（9:00开门）PlanB：九中牛记米线（8:00开门）PlanC：建国刘记米线（兴隆街店）6:00开门，电动车16min PlanD：马市街饣它汤（据说周末人巨多，得巨早排队）', tips: '可以尝试当地特色菜', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '7.19 午餐', min_amount: 150, max_amount: 250, recommended_amount: 200, unit: '元', description: 'PlanA：什一餐厅（矿山东路总店）PlanB：老家地锅鸡 PlanC：田记餐馆 其他：云龙让茶（茉莉山楂、清平乐、落玫观山）、夏抱冰、蜜城之恋（西红柿鸡蛋汤、水果茶） PlanC：老拾烧烤（徐宝生活广场总店），骑行5min', tips: '可以尝试当地特色菜', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '7.19 晚餐', min_amount: 150, max_amount: 250, recommended_amount: 180, unit: '元', description: 'PlanA：贾青羊肉串（户部山店）PlanB：老广烧烤（户部山店）PlanC：三只羊（户部山店）PlanD：高姐烧烤 哪个不用排队吃那个', tips: '可以尝试当地特色菜', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '7.20 早餐', min_amount: 150, max_amount: 250, recommended_amount: 60, unit: '元', description: '老六中米线总店', tips: '可以尝试当地特色菜', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '7.20 午餐+购物', min_amount: 150, max_amount: 250, recommended_amount: 250, unit: '元', description: 'PlanA：王家味炒鸡店（永嘉金色雅筑店），打车16min，推荐：炒鸡、一品茄子、松鼠鱼、铁板豆腐 PlanB：大张洛馍村（就近）', tips: '可以尝试当地特色菜', season_factor: 1.00, is_essential: true },
  { category: '交通费', item_name: 'G2700高铁票', min_amount: 280, max_amount: 320, recommended_amount: 290, unit: '元', description: 'G2700高铁南京南→徐州东，07车06B、06C', tips: '建议提前网上购票，注意检票时间', season_factor: 1.00, is_essential: true },
  { category: '交通费', item_name: 'K347火车票', min_amount: 200, max_amount: 220, recommended_amount: 205, unit: '元', description: 'K347硬卧徐州站→南京站，04车14号下铺', tips: '硬卧相对舒适，适合长途', season_factor: 1.00, is_essential: true },
  { category: '交通费', item_name: '市内交通费', min_amount: 8, max_amount: 15, recommended_amount: 10, unit: '元', description: '地铁、公交、打车等市内交通', tips: '建议使用公共交通，经济实惠', season_factor: 1.00, is_essential: true },
  { category: '住宿费', item_name: '季末轻居酒店', min_amount: 480, max_amount: 520, recommended_amount: 498, unit: '元', description: '季末轻居酒店两晚，人民广场地铁站附近', tips: '位置便利，交通方便，性价比高', season_factor: 1.00, is_essential: true },
  { category: '门票费', item_name: '徐州乐园加勒比水世界', min_amount: 180, max_amount: 200, recommended_amount: 186, unit: '元', description: '晚场15:00开始，包含水世界门票', tips: '记得带泳衣、水镜等用品', season_factor: 1.00, is_essential: false },
  { category: '物品费', item_name: '备件物品', min_amount: 50, max_amount: 200, recommended_amount: 170, unit: '元', description: '泳衣60、泳圈60、风扇40、手机袋10', tips: '', season_factor: 1.00, is_essential: false }
];

// 默认支出记录数据（基于实际Excel表格费用）
const defaultExpensesData = [
  // 7月18日支出
  { category: '交通费', amount: 290.00, description: 'G2700高铁票 南京南→徐州东', date: '2025-07-18', time: '20:31', location: '南京南站', payment_method: '支付宝', is_planned: true, notes: '07车06B、06C，约1小时34分钟' },
  { category: '交通费', amount: 10.00, description: '徐州东站→季末轻居酒店 打车费', date: '2025-07-18', time: '22:05', location: '徐州东站', payment_method: '微信支付', is_planned: true, notes: 'Plan A: 打车14.3公里，约30min，¥20起' },
  { category: '住宿费', amount: 498.00, description: '季末轻居酒店两晚住宿', date: '2025-07-18', time: '22:40', location: '季末轻居酒店', payment_method: '支付宝', is_planned: true, notes: '人民广场地铁站附近，交通便利' },
  { category: '餐饮费', amount: 238.00, description: '附近觅食·小烧烤', date: '2025-07-18', time: '23:00', location: '酒店附近', payment_method: '支付宝', is_planned: true, notes: 'Plan A: 续地三兄弟（李记烧烤店/矿山路店）' },
  { category: '物品费', amount: 170.00, description: '泳衣、泳圈、风扇、手机袋', date: '2025-07-18', time: '23:00', location: '互联网', payment_method: '支付宝', is_planned: true, notes: '物品消费支出' },

  // 7月19日支出
  { category: '餐饮费', amount: 60.00, description: '里堂·水线早餐', date: '2025-07-19', time: '09:00', location: '里堂水线', payment_method: '微信支付', is_planned: true, notes: 'Plan A: 一品蟹黄灌汤包' },
  { category: '餐饮费', amount: 200.00, description: '午餐', date: '2025-07-19', time: '12:30', location: '餐厅', payment_method: '支付宝', is_planned: true, notes: 'Plan A: 什一餐厅（矿山路景店）' },
  { category: '门票费', amount: 186.00, description: '徐州乐园加勒比水世界', date: '2025-07-19', time: '15:00', location: '徐州乐园', payment_method: '支付宝', is_planned: true, notes: '晚场15:00开始，记得带泳衣水镜' },
  { category: '餐饮费', amount: 180.00, description: '晚餐', date: '2025-07-19', time: '19:30', location: '餐厅', payment_method: '微信支付', is_planned: true, notes: 'Plan A: 黄焖鸡米饭' },

  // 7月20日支出
  { category: '餐饮费', amount: 60.00, description: '早餐', date: '2025-07-20', time: '09:00', location: '米线店', payment_method: '现金', is_planned: true, notes: '老六中米线店' },
  { category: '购物费', amount: 250.00, description: '午餐+购物', date: '2025-07-20', time: '11:00', location: '商场/特产店', payment_method: '支付宝', is_planned: true, notes: '购买特产和纪念品' },
  { category: '交通费', amount: 205.00, description: 'K347火车票 徐州站→南京站', date: '2025-07-20', time: '15:38', location: '徐州站', payment_method: '支付宝', is_planned: true, notes: '硬卧，04车14号下铺，约4小时13分钟' }
];

// 种子数据插入函数
async function seedDatabase() {
  try {
    console.log('🌱 开始插入种子数据...\n');

    // 连接数据库
    await connectDB();

    // 强制同步数据库结构（这会重新创建表）
    console.log('🔄 强制同步数据库结构...');
    await syncDB({ force: true });

    // 清空现有数据（可选）
    console.log('🗑️ 清理现有数据...');
    await Expenses.destroy({ where: {} });
    await BudgetReference.destroy({ where: {} });
    await Activities.destroy({ where: {} });
    await Itinerary.destroy({ where: {} });
    await Checklist.destroy({ where: {} });

    // 插入清单数据
    console.log('📝 插入默认清单数据...');
    await Checklist.bulkCreate(defaultChecklistData);
    console.log(`✅ 已插入 ${defaultChecklistData.length} 条清单数据`);

    // 插入行程数据
    console.log('📅 插入默认行程数据...');
    await Itinerary.bulkCreate(defaultItineraryData);
    console.log(`✅ 已插入 ${defaultItineraryData.length} 条行程数据`);

    // 插入活动数据
    console.log('🎯 插入默认活动数据...');
    await Activities.bulkCreate(defaultActivitiesData);
    console.log(`✅ 已插入 ${defaultActivitiesData.length} 条活动数据`);

    // 插入预算参考数据
    console.log('💰 插入默认预算参考数据...');
    const budgetReferences = await BudgetReference.bulkCreate(defaultBudgetData);
    console.log(`✅ 已插入 ${defaultBudgetData.length} 条预算参考数据`);

    // 插入支出记录数据
    console.log('💳 插入默认支出记录数据...');
    await Expenses.bulkCreate(defaultExpensesData);
    console.log(`✅ 已插入 ${defaultExpensesData.length} 条支出记录数据`);

    console.log('\n🎉 种子数据插入完成！');
    console.log('📊 数据统计:');
    console.log(`  - 清单项目: ${defaultChecklistData.length} 条`);
    console.log(`  - 行程安排: ${defaultItineraryData.length} 条`);
    console.log(`  - 活动规划: ${defaultActivitiesData.length} 条`);
    console.log(`  - 预算参考: ${defaultBudgetData.length} 条`);
    console.log(`  - 支出记录: ${defaultExpensesData.length} 条`);

  } catch (error) {
    console.error('❌ 种子数据插入失败:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

// 如果直接运行此文件，则执行种子数据插入
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  seedDatabase().catch(console.error);
}

export { seedDatabase, defaultChecklistData, defaultItineraryData, defaultActivitiesData, defaultBudgetData, defaultExpensesData };
