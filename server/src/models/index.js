import Checklist from './Checklist.js';
import Itinerary from './Itinerary.js';
import Activities from './Activities.js';
import BudgetReference from './BudgetReference.js';
import Expenses from './Expenses.js';
import { sequelize, connectDB, disconnectDB, syncDB, testConnection, getConnectionStatus } from '../config/database.js';

// 定义模型之间的关联关系
BudgetReference.hasMany(Expenses, {
  foreignKey: 'budget_reference_id',
  as: 'expenses'
});

Expenses.belongsTo(BudgetReference, {
  foreignKey: 'budget_reference_id',
  as: 'budgetReference'
});

// 导出所有模型和数据库连接函数
export {
  sequelize,
  connectDB,
  disconnectDB,
  syncDB,
  testConnection,
  getConnectionStatus,
  Checklist,
  Itinerary,
  Activities,
  BudgetReference,
  Expenses
};
