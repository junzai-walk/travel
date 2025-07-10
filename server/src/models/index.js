import Checklist from './Checklist.js';
import Itinerary from './Itinerary.js';
import Activities from './Activities.js';
import BudgetReference from './BudgetReference.js';
import Expenses from './Expenses.js';
import { connectDB, disconnectDB, testConnection, getConnectionStatus, mongoose } from '../config/database.js';

// MongoDB 中的关联关系通过 populate 实现，不需要显式定义关联
// Expenses 模型中已经通过 ref 字段定义了与 BudgetReference 的关联

// 导出所有模型和数据库连接函数
export {
  mongoose,
  connectDB,
  disconnectDB,
  testConnection,
  getConnectionStatus,
  Checklist,
  Itinerary,
  Activities,
  BudgetReference,
  Expenses
};
