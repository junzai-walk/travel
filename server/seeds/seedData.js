import { connectDB, syncDB, disconnectDB } from '../src/config/database.js';
import { Checklist, Itinerary, Activities, BudgetReference, Expenses } from '../src/models/index.js';
import { logger } from '../src/utils/logger.js';

// 默认清单数据（基于实际行程需求优化）
const defaultChecklistData = [
  { item_name: '身份证', category: '证件类', priority: '高', is_completed: false, notes: '必须携带的身份证明，火车票实名制' },
  { item_name: '手机充电器', category: '电子设备', priority: '高', is_completed: false, notes: '保持通讯畅通，导航必备' },
  { item_name: '换洗衣物', category: '衣物类', priority: '中', is_completed: false, notes: '7月天气25-35°C，准备夏季衣物' },
  { item_name: '泳衣和水镜', category: '衣物类', priority: '高', is_completed: false, notes: '徐州乐园水世界必备，记得带泳衣、水镜' },
  { item_name: '洗漱用品', category: '洗护用品', priority: '中', is_completed: false, notes: '牙刷、牙膏、洗发水、沐浴用品等' },
  { item_name: '现金和银行卡', category: '证件类', priority: '高', is_completed: false, notes: '备用现金和支付工具，支持支付宝、微信支付' },
  { item_name: '舒适的运动鞋', category: '衣物类', priority: '高', is_completed: false, notes: '云龙山登山和长时间行走必备' },
  { item_name: '防晒霜', category: '洗护用品', priority: '高', is_completed: false, notes: '7月户外活动必备，水世界游玩防晒' },
  { item_name: '毛巾和抹布', category: '洗护用品', priority: '中', is_completed: false, notes: '水世界游玩后擦拭用，谨慎毛巾' },
  { item_name: '冰水', category: '其他', priority: '中', is_completed: false, notes: '水世界游玩时补充水分，防中暑' },
  { item_name: '雨伞', category: '其他', priority: '低', is_completed: false, notes: '7月可能有雨，防雨备用' },
  { item_name: '常用药品', category: '药品类', priority: '中', is_completed: false, notes: '感冒药、创可贴、防中暑药等' },
  { item_name: '相机或拍照设备', category: '电子设备', priority: '低', is_completed: false, notes: '云龙湖、云龙山观景台拍照留念' },
  { item_name: '零食和水', category: '其他', priority: '低', is_completed: false, notes: '火车上补充能量，K347硬卧4小时13分钟' },
  { item_name: '湿纸巾', category: '洗护用品', priority: '低', is_completed: false, notes: '清洁便利，特别是用餐后' },
  { item_name: '火车票', category: '证件类', priority: '高', is_completed: false, notes: 'G2700和K347车票，注意车站区别（徐州东站vs徐州站）' }
];

// 默认行程数据（基于实际Excel表格数据，修正日期对应关系）
const defaultItineraryData = [
  // 2024年7月18日（周五）- 出发日
  { date: '2025-07-18', time: '20:00', activity: '南京南站集合', description: 'G2700次高铁，检票口A9，提前1小时到达', tips: '建议提前网上购票，注意检票时间', location: '南京南站', duration: 31, status: '计划中' },
  { date: '2025-07-18', time: '20:31', activity: '乘坐高铁G2700', description: '南京南 → 徐州东，车次G2700，07车06B、06C，约1小时34分钟', tips: '可以在车上休息，准备第二天的行程', location: '高铁上', duration: 94, status: '计划中' },
  { date: '2025-07-18', time: '22:05', activity: '到达徐州东站', description: '出站后乘坐地铁或打车前往酒店，Plan A: 打车14.3公里，约30min，¥20起；Plan B: 地铁出行', tips: '注意：地铁徐州东站末班车时间22:30', location: '徐州东站', duration: 35, status: '计划中' },
  { date: '2025-07-18', time: '22:40', activity: '季末轻居酒店入住', description: '办理入住手续，稍作休息，酒店位于人民广场地铁站附近，交通便利', tips: '酒店位置优越，人民广场地铁站附近', location: '季末轻居酒店', duration: 20, status: '计划中' },
  { date: '2025-07-18', time: '23:00', activity: '附近觅食·小烧烤', description: 'Plan A: 续地三兄弟（李记烧烤店/矿山路店）；Plan B: 老广烧烤', tips: '可以尝试徐州特色烧烤', location: '酒店附近', duration: 60, status: '计划中' },
  { date: '2025-07-19', time: '00:00', activity: '回酒店', description: '保证充足睡眠', tips: '早点休息，为第二天行程做准备', location: '酒店', duration: 480, status: '计划中' },

  // 2024年7月19日（周六）- 全天游览
  { date: '2025-07-19', time: '08:00', activity: '起床', description: '开始美好的一天', tips: '保持良好的精神状态', location: '酒店', duration: 60, status: '计划中' },
  { date: '2025-07-19', time: '09:00', activity: '里堂·水线', description: 'Plan A: 一品蟹黄灌汤包', tips: '品尝徐州特色早餐', location: '里堂水线', duration: 60, status: '计划中' },
  { date: '2025-07-19', time: '10:00', activity: '云龙山', description: '北门上山（正门停车难），20min新鲜爬上观景台，下山回到门口约1小时', tips: '路线：🔴滑湖公园门口🔴石佛寺入口🔴海拔公园🔴云龙山主道🔴会山公园（水杉大道出来）🔴红楼（汉文化）🔴彭祖园🔴龙华寺（看中药博物馆）🔴三环路口石佛寺入口🔴湖滨公园🔴观景中药博物馆🔴会山公园🔴青年路（观景台，拍照最美）🔴星马上坡小路🔴观景台🔴滑湖公园门口', location: '云龙山', duration: 60, status: '计划中' },
  { date: '2025-07-19', time: '11:00', activity: '云龙湖（寺院上行）', description: '从云龙山景区上行', tips: '可以俯瞰云龙湖全景', location: '云龙湖', duration: 90, status: '计划中' },
  { date: '2025-07-19', time: '12:30', activity: '午餐', description: 'Plan A: 什一餐厅（矿山路景店）；Plan B: 老家烧饼店', tips: '品尝当地特色菜', location: '餐厅', duration: 90, status: '计划中' },
  { date: '2025-07-19', time: '15:00', activity: '徐州乐园动物园水世界', description: '晚场15:00开始，记得带泳衣水镜，冰水，抹布，沐浴，谨慎毛巾', tips: '注意防晒和安全', location: '徐州乐园', duration: 270, status: '计划中' },
  { date: '2025-07-19', time: '19:30', activity: '晚餐', description: 'Plan A: 黄焖鸡米饭；Plan B: 夜宵烧烤', tips: '根据体力情况选择', location: '餐厅', duration: 90, status: '计划中' },
  { date: '2025-07-19', time: '20:30', activity: '云龙湖', description: '路线：🔴滑湖公园门口🔴石佛寺入口🔴海拔公园🔴云龙山主道🔴会山公园（水杉大道出来）🔴红楼（汉文化）🔴彭祖园🔴龙华寺（看中药博物馆）🔴三环路口石佛寺入口🔴湖滨公园🔴观景中药博物馆🔴会山公园🔴青年路（观景台，拍照最美）🔴星马上坡小路🔴观景台🔴滑湖公园门口🔴观景台🔴滑湖公园门口', tips: '夜景很美，适合拍照', location: '云龙湖', duration: 90, status: '计划中' },
  { date: '2025-07-19', time: '22:00', activity: '回酒店休息', description: '结束充实的一天', tips: '早点休息，恢复体力', location: '酒店', duration: 600, status: '计划中' },

  // 2024年7月20日（周日）- 返程日
  { date: '2025-07-20', time: '08:00', activity: '起床', description: '最后一天的行程', tips: '整理行李，准备退房', location: '酒店', duration: 60, status: '计划中' },
  { date: '2025-07-20', time: '09:00', activity: '早餐', description: '老六中米线店', tips: '品尝最后一顿徐州美食', location: '米线店', duration: 30, status: '计划中' },
  { date: '2025-07-20', time: '09:30', activity: '新租房', description: '参观或处理相关事务', tips: '根据实际需要安排', location: '新租房', duration: 90, status: '计划中' },
  { date: '2025-07-20', time: '11:00', activity: '午餐+购物', description: '购买特产和纪念品', tips: '蜜三刀、牛蒡茶都是不错的选择', location: '商场/特产店', duration: 90, status: '计划中' },
  { date: '2025-07-20', time: '12:30', activity: '徐州博物馆', description: '了解徐州历史文化', tips: '最后的文化体验', location: '徐州博物馆', duration: 128, status: '计划中' },
  { date: '2025-07-20', time: '14:50', activity: '前往徐州站', description: '取行李，前往徐州站（注意是徐州站不是徐州东站）', tips: '预留充足时间，注意车站区别', location: '徐州站', duration: 48, status: '计划中' },
  { date: '2025-07-20', time: '15:38', activity: '返程火车K347', description: '徐州站 → 南京站，硬卧，04车14号下铺，15:38-19:51，约4小时13分钟', tips: '可以在车上整理照片，回味旅程', location: '火车上', duration: 253, status: '计划中' },
  { date: '2025-07-20', time: '19:51', activity: '到达南京站', description: '愉快的徐州之旅结束', tips: '记得分享旅行的美好回忆', location: '南京站', duration: 30, status: '计划中' }
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
  { category: '交通费', item_name: 'G2700高铁票', min_amount: 280, max_amount: 320, recommended_amount: 290, unit: '元', description: 'G2700高铁南京南→徐州东，07车06B、06C', tips: '建议提前网上购票，注意检票时间', season_factor: 1.00, is_essential: true },
  { category: '交通费', item_name: 'K347火车票', min_amount: 200, max_amount: 220, recommended_amount: 205, unit: '元', description: 'K347硬卧徐州站→南京站，04车14号下铺', tips: '硬卧相对舒适，适合长途', season_factor: 1.00, is_essential: true },
  { category: '交通费', item_name: '市内交通费', min_amount: 8, max_amount: 15, recommended_amount: 10, unit: '元', description: '地铁、公交、打车等市内交通', tips: '建议使用公共交通，经济实惠', season_factor: 1.00, is_essential: true },
  { category: '住宿费', item_name: '季末轻居酒店', min_amount: 480, max_amount: 520, recommended_amount: 498, unit: '元', description: '季末轻居酒店两晚，人民广场地铁站附近', tips: '位置便利，交通方便，性价比高', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '里堂·水线早餐', min_amount: 50, max_amount: 80, recommended_amount: 60, unit: '元', description: '一品蟹黄灌汤包等特色早餐', tips: '徐州特色早餐，值得品尝', season_factor: 1.00, is_essential: true },
  { category: '餐饮费', item_name: '正餐费用', min_amount: 150, max_amount: 250, recommended_amount: 200, unit: '元', description: '午餐、晚餐等正餐费用', tips: '可以尝试当地特色菜', season_factor: 1.00, is_essential: true },
  { category: '门票费', item_name: '徐州乐园动物园水世界', min_amount: 180, max_amount: 200, recommended_amount: 186, unit: '元', description: '晚场15:00开始，包含水世界门票', tips: '记得带泳衣、水镜等用品', season_factor: 1.00, is_essential: false },
  { category: '娱乐费', item_name: '附近觅食·小烧烤', min_amount: 200, max_amount: 280, recommended_amount: 238, unit: '元', description: '续地三兄弟烧烤或老广烧烤', tips: '徐州特色烧烤，夜宵好选择', season_factor: 1.00, is_essential: false },
  { category: '购物费', item_name: '特产+纪念品', min_amount: 50, max_amount: 200, recommended_amount: 100, unit: '元', description: '蜜三刀、牛蒡茶等徐州特产', tips: '适量购买，注意保存和携带', season_factor: 1.00, is_essential: false }
];

// 默认支出记录数据（基于实际Excel表格费用）
const defaultExpensesData = [
  // 7月18日支出
  { category: '交通费', amount: 290.00, description: 'G2700高铁票 南京南→徐州东', date: '2025-07-18', time: '20:31', location: '南京南站', payment_method: '支付宝', is_planned: true, notes: '07车06B、06C，约1小时34分钟' },
  { category: '交通费', amount: 10.00, description: '徐州东站→季末轻居酒店 打车费', date: '2025-07-18', time: '22:05', location: '徐州东站', payment_method: '微信支付', is_planned: true, notes: 'Plan A: 打车14.3公里，约30min，¥20起' },
  { category: '住宿费', amount: 498.00, description: '季末轻居酒店两晚住宿', date: '2025-07-18', time: '22:40', location: '季末轻居酒店', payment_method: '支付宝', is_planned: true, notes: '人民广场地铁站附近，交通便利' },
  { category: '餐饮费', amount: 238.00, description: '附近觅食·小烧烤', date: '2025-07-18', time: '23:00', location: '酒店附近', payment_method: '现金', is_planned: true, notes: 'Plan A: 续地三兄弟（李记烧烤店/矿山路店）' },

  // 7月19日支出
  { category: '餐饮费', amount: 60.00, description: '里堂·水线早餐', date: '2025-07-19', time: '09:00', location: '里堂水线', payment_method: '微信支付', is_planned: true, notes: 'Plan A: 一品蟹黄灌汤包' },
  { category: '餐饮费', amount: 200.00, description: '午餐', date: '2025-07-19', time: '12:30', location: '餐厅', payment_method: '支付宝', is_planned: true, notes: 'Plan A: 什一餐厅（矿山路景店）' },
  { category: '门票费', amount: 186.00, description: '徐州乐园动物园水世界门票', date: '2025-07-19', time: '15:00', location: '徐州乐园', payment_method: '支付宝', is_planned: true, notes: '晚场15:00开始，记得带泳衣水镜' },
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
