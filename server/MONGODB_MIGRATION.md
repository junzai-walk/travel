# 徐州旅游指南 MongoDB 迁移指南

## 迁移概述

本项目已成功从 MySQL + Sequelize 迁移到 MongoDB + Mongoose，保持了所有原有的 API 接口和数据结构。

## 技术栈变更

### 之前 (MySQL)
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize
- **连接**: mysql2

### 现在 (MongoDB)
- **数据库**: MongoDB 4.4+
- **ODM**: Mongoose
- **连接**: mongoose

## 数据库配置

### 环境变量 (.env)
```bash
# MongoDB 数据库配置
MONGODB_URI=mongodb://localhost:27017/xuzhou
DB_NAME=xuzhou

# 服务器配置
PORT=3001
NODE_ENV=development

# 日志配置
LOG_LEVEL=info
```

### 连接配置
- **本地开发**: `mongodb://localhost:27017/xuzhou`
- **生产环境**: 根据实际 MongoDB 服务器配置

## 数据模型映射

### 1. 出行清单 (travel_checklist)
```javascript
// Sequelize (旧)
{
  id: INTEGER (主键, 自增)
  item_name: STRING(200)
  category: ENUM
  is_completed: BOOLEAN
  priority: ENUM
  notes: TEXT
  created_at: DATE
  updated_at: DATE
}

// Mongoose (新)
{
  _id: ObjectId (主键, 自动生成)
  item_name: String (1-200字符)
  category: String (枚举值)
  is_completed: Boolean
  priority: String (枚举值)
  notes: String (最大1000字符)
  createdAt: Date
  updatedAt: Date
}
```

### 2. 行程安排 (travel_itinerary)
```javascript
// Sequelize (旧)
{
  id: INTEGER
  date: DATEONLY
  time: TIME
  activity: STRING(300)
  description: TEXT
  tips: TEXT
  location: STRING(200)
  duration: INTEGER
  status: ENUM
}

// Mongoose (新)
{
  _id: ObjectId
  date: Date
  time: String (HH:MM格式)
  activity: String (1-300字符)
  description: String (最大2000字符)
  tips: String (最大2000字符)
  location: String (最大200字符)
  duration: Number (正整数)
  status: String (枚举值)
}
```

### 3. 活动规划 (travel_activities)
```javascript
// Mongoose Schema
{
  _id: ObjectId
  title: String (1-200字符)
  category: String (枚举值)
  description: String (最大2000字符)
  location: String (最大200字符)
  estimated_cost: Number (0-999999.99)
  estimated_duration: Number (正整数分钟)
  priority: String (枚举值)
  season_suitable: String (最大100字符)
  tips: String (最大2000字符)
  contact_info: String (最大200字符)
  opening_hours: String (最大100字符)
}
```

### 4. 预算参考 (budget_reference)
```javascript
// Mongoose Schema
{
  _id: ObjectId
  category: String (枚举值)
  item_name: String (1-200字符)
  min_amount: Number (0-999999.99)
  max_amount: Number (0-999999.99)
  recommended_amount: Number (0-999999.99)
  unit: String (枚举值)
  description: String (最大2000字符)
  tips: String (最大2000字符)
  season_factor: Number (0.1-5.0)
  is_essential: Boolean
}
```

### 5. 实际支出 (travel_expenses)
```javascript
// Mongoose Schema
{
  _id: ObjectId
  category: String (枚举值)
  amount: Number (0-999999.99)
  description: String (1-300字符)
  date: Date
  time: String (HH:MM格式)
  location: String (最大200字符)
  payment_method: String (枚举值)
  receipt_number: String (最大100字符)
  notes: String (最大1000字符)
  is_planned: Boolean
  budget_reference_id: ObjectId (引用 BudgetReference)
}
```

## API 接口兼容性

### 请求格式
- **保持不变**: 所有 API 端点路径和请求格式完全相同
- **ID 格式**: 从整数 ID 改为 MongoDB ObjectId (24位十六进制字符串)

### 响应格式
```javascript
// 统一响应格式 (保持不变)
{
  "status": "success|error|fail",
  "message": "响应消息",
  "data": "响应数据"
}

// 数据项格式适配
{
  "id": "ObjectId字符串",  // 从 _id 映射
  "created_at": "ISO日期", // 从 createdAt 映射
  "updated_at": "ISO日期", // 从 updatedAt 映射
  // ... 其他字段保持不变
}
```

## 启动和测试

### 1. 安装依赖
```bash
cd server
npm install
```

### 2. 启动 MongoDB 服务
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# 或
brew services start mongodb-community
```

### 3. 启动服务器

#### 测试模式 (推荐)
```bash
npm run test-mongo
```

#### 完整模式
```bash
npm start
```

### 4. 验证连接
- **健康检查**: http://localhost:3001/api/health
- **MongoDB 测试**: http://localhost:3001/api/test-mongo

## 部署配置

### CORS 设置
已配置支持以下域名：
- `http://localhost:5173` (开发环境)
- `http://localhost:5174` (开发环境)
- `http://localhost:5175` (开发环境)
- `http://localhost:3000` (开发环境)
- `http://175.178.87.16:9943` (生产环境)
- `https://175.178.87.16:9943` (生产环境 HTTPS)

### 生产环境配置
```bash
# 生产环境变量
MONGODB_URI=mongodb://your-production-server:27017/xuzhou
NODE_ENV=production
PORT=3001
```

## 数据验证

### 字段验证规则
- **字符串长度**: 严格限制最大长度
- **数值范围**: 限制在合理范围内
- **枚举值**: 严格验证枚举选项
- **日期格式**: 自动处理日期格式转换
- **必填字段**: 保持原有的必填字段要求

### 自定义验证
- **预算金额**: 最高金额必须大于等于最低金额
- **推荐金额**: 必须在最低和最高金额之间
- **行程日期**: 不能早于今天
- **时间格式**: 严格验证 HH:MM 格式

## 索引优化

### 创建的索引
```javascript
// 出行清单
{ category: 1 }
{ is_completed: 1 }
{ priority: 1 }
{ createdAt: -1 }

// 行程安排
{ date: 1 }
{ status: 1 }
{ date: 1, time: 1 }
{ createdAt: -1 }

// 活动规划
{ category: 1 }
{ priority: 1 }
{ estimated_cost: 1 }
{ createdAt: -1 }
{ title: 'text', description: 'text', location: 'text' } // 文本搜索

// 预算参考
{ category: 1 }
{ is_essential: 1 }
{ recommended_amount: 1 }
{ createdAt: -1 }

// 实际支出
{ category: 1 }
{ date: -1 }
{ amount: 1 }
{ payment_method: 1 }
{ is_planned: 1 }
{ budget_reference_id: 1 }
{ createdAt: -1 }
```

## 故障排除

### 常见问题

1. **MongoDB 连接失败**
   - 确保 MongoDB 服务正在运行
   - 检查连接字符串格式
   - 验证数据库权限

2. **依赖包错误**
   ```bash
   npm install mongoose
   ```

3. **端口冲突**
   - 修改 .env 文件中的 PORT 配置
   - 或停止占用端口的其他服务

4. **数据验证错误**
   - 检查请求数据格式
   - 确认枚举值正确
   - 验证字段长度限制

### 日志查看
- 开发环境: 控制台输出
- 生产环境: `logs/` 目录下的日志文件

## 迁移完成状态

✅ **已完成**:
- [x] 依赖包更新 (mongoose 替换 sequelize)
- [x] 数据库连接配置
- [x] 所有数据模型转换 (Checklist, Itinerary, Activities, BudgetReference, Expenses)
- [x] 所有路由文件更新 (checklist, itinerary, activities, budget, expenses)
- [x] MongoDB 聚合查询实现 (统计分析功能)
- [x] CORS 跨域配置
- [x] 测试服务器创建
- [x] 数据验证和错误处理
- [x] 前端 API 服务适配
- [x] 完整服务器启动测试

🔄 **进行中**:
- [x] 完整 API 测试
- [ ] 性能优化和索引调优

📋 **待完成**:
- [ ] 生产环境部署测试
- [ ] 数据迁移脚本 (如需要)
- [ ] 监控和日志配置

## 迁移验证

### 成功启动验证
```bash
# 启动 MongoDB 服务器
npm start

# 预期输出:
🚀 徐州旅游指南后端服务启动成功！
📍 服务地址: http://localhost:3001
🏥 健康检查: http://localhost:3001/api/health
```

### API 接口验证
- ✅ 健康检查: http://localhost:3001/api/health
- ✅ 出行清单: http://localhost:3001/api/checklist
- ✅ 行程安排: http://localhost:3001/api/itinerary
- ✅ 活动规划: http://localhost:3001/api/activities
- ✅ 预算参考: http://localhost:3001/api/budget/reference
- ✅ 实际支出: http://localhost:3001/api/expenses
- ✅ 预算分析: http://localhost:3001/api/budget/analysis

### 前端集成验证
- ✅ 前端服务: http://localhost:5175
- ✅ API 测试页面: 导航栏 -> "🧪 API测试"
- ✅ MongoDB 连接测试
- ✅ 所有模块 API 连接测试

## 下一步操作

1. ✅ 完成所有路由文件的 MongoDB 适配
2. ✅ 运行完整的 API 测试套件
3. ✅ 更新前端 API 服务配置
4. 🔄 部署到生产环境并测试
5. 📋 创建数据迁移脚本 (如需要从现有数据迁移)
6. 📋 配置生产环境监控和日志

## 迁移成功确认

🎉 **MongoDB 迁移已成功完成！**

- ✅ 所有 API 接口正常工作
- ✅ 数据验证和错误处理完整
- ✅ 前后端集成测试通过
- ✅ MongoDB 连接稳定
- ✅ 聚合查询功能正常
- ✅ CORS 跨域配置正确
