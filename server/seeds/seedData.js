import { connectDB, syncDB, disconnectDB } from '../src/config/database.js';
import { Checklist, Itinerary, Activities, BudgetReference, Expenses } from '../src/models/index.js';
import { logger } from '../src/utils/logger.js';

// 默认清单数据（来自前端 Checklist.jsx）
const defaultChecklistData = [
  { item_name: '身份证', category: '证件类', priority: '高', is_completed: false, notes: '必须携带的身份证明' },
  { item_name: '手机充电器', category: '电子设备', priority: '高', is_completed: false, notes: '保持通讯畅通' },
  { item_name: '换洗衣物', category: '衣物类', priority: '中', is_completed: false, notes: '根据天气准备' },
  { item_name: '洗漱用品', category: '洗护用品', priority: '中', is_completed: false, notes: '牙刷、牙膏、洗发水等' },
  { item_name: '现金和银行卡', category: '证件类', priority: '高', is_completed: false, notes: '备用现金和支付工具' },
  { item_name: '舒适的鞋子', category: '衣物类', priority: '中', is_completed: false, notes: '适合长时间行走' },
  { item_name: '雨伞', category: '其他', priority: '低', is_completed: false, notes: '防雨备用' },
  { item_name: '常用药品', category: '药品类', priority: '中', is_completed: false, notes: '感冒药、创可贴等' },
  { item_name: '相机或拍照设备', category: '电子设备', priority: '低', is_completed: false, notes: '记录美好时光' },
  { item_name: '零食和水', category: '其他', priority: '低', is_completed: false, notes: '旅途补充能量' },
  { item_name: '防晒霜', category: '洗护用品', priority: '低', is_completed: false, notes: '户外活动必备' },
  { item_name: '湿纸巾', category: '洗护用品', priority: '低', is_completed: false, notes: '清洁便利' }
];

// 默认行程数据（来自前端 TravelPlan.jsx）
const defaultItineraryData = [
  // 周五 - 出发日
  { date: '2024-07-18', time: '19:30', activity: '南京南站集合', description: '提前1小时到达，取票安检', tips: 'G2700次高铁，建议提前网上购票', location: '南京南站', duration: 30, status: '计划中' },
  { date: '2024-07-18', time: '20:31', activity: '乘坐高铁G2700', description: '南京南 → 徐州东，约1小时34分钟', tips: '可以在车上休息，准备第二天的行程', location: '高铁上', duration: 94, status: '计划中' },
  { date: '2024-07-18', time: '22:05', activity: '到达徐州东站', description: '出站后乘坐地铁或打车前往酒店', tips: '地铁1号线可直达市区，约30分钟', location: '徐州东站', duration: 35, status: '计划中' },
  { date: '2024-07-18', time: '22:40', activity: '季末轻居酒店入住', description: '办理入住手续，稍作休息', tips: '酒店位于人民广场地铁站附近，交通便利', location: '季末轻居酒店', duration: 20, status: '计划中' },
  { date: '2024-07-18', time: '23:00', activity: '附近觅食', description: '寻找附近的夜宵或小吃', tips: '可以尝试徐州烙馍或羊肉汤', location: '酒店附近', duration: 60, status: '计划中' },
  
  // 周六 - 全天游览
  { date: '2024-07-19', time: '08:00', activity: '酒店早餐', description: '享用丰盛的早餐，为一天的行程做准备', tips: '如果酒店没有早餐，可以去附近吃羊肉汤', location: '酒店', duration: 60, status: '计划中' },
  { date: '2024-07-19', time: '09:00', activity: '云龙湖风景区', description: '徐州最美的景点，湖光山色，适合散步拍照', tips: '建议租借共享单车环湖，约2-3小时', location: '云龙湖风景区', duration: 180, status: '计划中' },
  { date: '2024-07-19', time: '12:00', activity: '湖边午餐', description: '在云龙湖附近的餐厅享用午餐', tips: '推荐淮海食府，环境好适合情侣', location: '云龙湖附近', duration: 120, status: '计划中' },
  { date: '2024-07-19', time: '14:00', activity: '彭祖园', description: '了解徐州历史文化，园林景观优美', tips: '适合慢慢游览，拍照留念', location: '彭祖园', duration: 120, status: '计划中' },
  { date: '2024-07-19', time: '16:00', activity: '马市街小吃街', description: '品尝各种徐州特色小吃', tips: '不要吃太饱，留肚子尝试更多美食', location: '马市街', duration: 120, status: '计划中' },
  { date: '2024-07-19', time: '18:00', activity: '徐州博物馆', description: '了解徐州深厚的历史文化', tips: '周六延长开放时间，可以慢慢参观', location: '徐州博物馆', duration: 120, status: '计划中' },
  { date: '2024-07-19', time: '20:00', activity: '晚餐时光', description: '选择一家有特色的餐厅享用晚餐', tips: '可以选择有情调的餐厅，增进感情', location: '市区餐厅', duration: 120, status: '计划中' },
  
  // 周日 - 返程日
  { date: '2024-07-20', time: '09:00', activity: '酒店退房', description: '整理行李，办理退房手续', tips: '可以把行李寄存在酒店，轻松游览', location: '酒店', duration: 30, status: '计划中' },
  { date: '2024-07-20', time: '09:30', activity: '户部山古建筑群', description: '徐州历史文化街区，古色古香', tips: '适合拍照，了解徐州传统建筑', location: '户部山', duration: 90, status: '计划中' },
  { date: '2024-07-20', time: '11:00', activity: '购买特产', description: '购买徐州特产作为伴手礼', tips: '蜜三刀、牛蒡茶都是不错的选择', location: '特产店', duration: 60, status: '计划中' },
  { date: '2024-07-20', time: '12:00', activity: '最后一餐', description: '享用徐州的最后一顿美食', tips: '可以再次品尝最喜欢的徐州菜', location: '餐厅', duration: 90, status: '计划中' },
  { date: '2024-07-20', time: '14:30', activity: '前往徐州站', description: '取行李，前往徐州站（注意是徐州站不是徐州东站）', tips: '预留充足时间，K347次火车从徐州站发车', location: '徐州站', duration: 30, status: '计划中' },
  { date: '2024-07-20', time: '15:38', activity: '返程火车K347', description: '徐州站 → 南京站，约4小时13分钟', tips: '可以在车上整理照片，回味旅程', location: '火车上', duration: 253, status: '计划中' },
  { date: '2024-07-20', time: '19:51', activity: '到达南京站', description: '愉快的徐州之旅结束', tips: '记得分享旅行的美好回忆', location: '南京站', duration: 30, status: '计划中' }
];

// 默认活动规划数据
const defaultActivitiesData = [
  { title: '云龙湖风景区游览', category: '景点游览', description: '徐州最美的景点，湖光山色，适合散步拍照', location: '云龙湖风景区', estimated_cost: 0, estimated_duration: 180, priority: '必去', season_suitable: '四季皆宜', tips: '建议租借共享单车环湖', contact_info: '', opening_hours: '全天开放' },
  { title: '徐州博物馆参观', category: '文化活动', description: '了解徐州深厚的历史文化', location: '徐州博物馆', estimated_cost: 0, estimated_duration: 120, priority: '推荐', season_suitable: '四季皆宜', tips: '周六延长开放时间', contact_info: '', opening_hours: '9:00-17:00' },
  { title: '彭祖园游览', category: '景点游览', description: '了解徐州历史文化，园林景观优美', location: '彭祖园', estimated_cost: 20, estimated_duration: 120, priority: '推荐', season_suitable: '春夏秋', tips: '适合慢慢游览，拍照留念', contact_info: '', opening_hours: '8:00-18:00' },
  { title: '马市街小吃体验', category: '美食体验', description: '品尝各种徐州特色小吃', location: '马市街', estimated_cost: 100, estimated_duration: 120, priority: '必去', season_suitable: '四季皆宜', tips: '不要吃太饱，留肚子尝试更多美食', contact_info: '', opening_hours: '全天' },
  { title: '户部山古建筑群', category: '文化活动', description: '徐州历史文化街区，古色古香', location: '户部山', estimated_cost: 0, estimated_duration: 90, priority: '推荐', season_suitable: '四季皆宜', tips: '适合拍照，了解徐州传统建筑', contact_info: '', opening_hours: '8:00-17:30' },
  { title: '季末轻居酒店住宿', category: '住宿', description: '位于人民广场地铁站附近，交通便利', location: '人民广场附近', estimated_cost: 249, estimated_duration: 720, priority: '必去', season_suitable: '四季皆宜', tips: '提前预订，性价比高', contact_info: '', opening_hours: '24小时' }
];

// 默认预算参考数据（来自前端 TravelPlan.jsx）
const defaultBudgetData = [
  { category: '交通费', item_name: 'G2700高铁+K347火车', min_amount: 450, max_amount: 550, recommended_amount: 495, unit: '元', description: 'G2700高铁¥290+K347火车¥205', tips: '建议提前网上购票', season_factor: 1.00, is_essential: true },
  { category: '住宿费', item_name: '季末轻居酒店两晚', min_amount: 400, max_amount: 600, recommended_amount: 498, unit: '元', description: '季末轻居酒店两晚 ¥249×2', tips: '位于人民广场地铁站附近，交通便利', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '三餐+小吃（两人）', min_amount: 200, max_amount: 400, recommended_amount: 300, unit: '元', description: '包含正餐和特色小吃', tips: '可以尝试徐州烙馍、羊肉汤等特色美食', season_factor: 1.00, is_essential: true },
  { category: '门票费', item_name: '景点门票（两人）', min_amount: 50, max_amount: 150, recommended_amount: 186, unit: '元', description: '主要景点门票费用', tips: '部分景点免费，如云龙湖', season_factor: 1.00, is_essential: true },
  { category: '交通费', item_name: '市内交通', min_amount: 30, max_amount: 80, recommended_amount: 50, unit: '元', description: '地铁+公交+打车', tips: '建议办理公交卡，方便出行', season_factor: 1.00, is_essential: true },
  { category: '购物费', item_name: '特产+纪念品', min_amount: 50, max_amount: 200, recommended_amount: 100, unit: '元', description: '蜜三刀、牛蒡茶等特产', tips: '适量购买，注意保存', season_factor: 1.00, is_essential: false }
];

// 种子数据插入函数
async function seedDatabase() {
  try {
    console.log('🌱 开始插入种子数据...\n');
    
    // 连接数据库
    await connectDB();
    await syncDB();
    
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
    
    console.log('\n🎉 种子数据插入完成！');
    console.log('📊 数据统计:');
    console.log(`  - 清单项目: ${defaultChecklistData.length} 条`);
    console.log(`  - 行程安排: ${defaultItineraryData.length} 条`);
    console.log(`  - 活动规划: ${defaultActivitiesData.length} 条`);
    console.log(`  - 预算参考: ${defaultBudgetData.length} 条`);
    
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

export { seedDatabase, defaultChecklistData, defaultItineraryData, defaultActivitiesData, defaultBudgetData };
