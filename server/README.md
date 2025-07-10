# 徐州旅游指南后端服务

## 项目概述

这是徐州旅游指南网站的后端服务，使用 Node.js + Express.js + MySQL 构建，提供完整的 RESTful API 接口。

## 技术栈

- **后端框架**: Node.js + Express.js
- **数据库**: MongoDB 4.4+
- **ODM**: Mongoose
- **数据验证**: express-validator
- **日志记录**: Winston
- **跨域处理**: CORS

## 数据库配置

```bash
# MongoDB 连接配置
MONGODB_URI=mongodb://localhost:27017/xuzhou
数据库名：xuzhou
```

> **注意**: 项目已从 MySQL 迁移到 MongoDB，请确保 MongoDB 服务正在运行。

## 安装和运行

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 环境配置

复制 `.env` 文件并根据需要修改配置：

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

### 2.1 启动 MongoDB 服务

确保 MongoDB 服务正在运行：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# 或
brew services start mongodb-community
```

### 3. 启动服务

```bash
# 生产模式 (MongoDB)
npm start

# 开发模式（自动重启）
npm run dev

# MongoDB 测试模式
npm run test-mongo

# 简单测试模式（不连接数据库）
npm run test-simple
```

## API 接口文档

### 基础信息

- **基础 URL**: `http://localhost:3001/api`
- **响应格式**: JSON
- **字符编码**: UTF-8

### 统一响应格式

```json
{
  "status": "success|error|fail",
  "message": "响应消息",
  "data": "响应数据"
}
```

### 1. 健康检查

```
GET /api/health
```

### 2. 出行清单模块

```
GET    /api/checklist           # 获取所有清单项目
GET    /api/checklist/:id       # 获取指定清单项目
POST   /api/checklist           # 创建新的清单项目
PUT    /api/checklist/:id       # 更新指定清单项目
DELETE /api/checklist/:id       # 删除指定清单项目
PATCH  /api/checklist/:id/toggle # 切换完成状态
```

**请求参数示例**:
```json
{
  "item_name": "身份证",
  "category": "证件类",
  "priority": "高",
  "is_completed": false,
  "notes": "记得检查有效期"
}
```

### 3. 行程安排模块

```
GET    /api/itinerary           # 获取所有行程安排
GET    /api/itinerary/:id       # 获取指定行程安排
POST   /api/itinerary           # 创建新的行程安排
PUT    /api/itinerary/:id       # 更新指定行程安排
DELETE /api/itinerary/:id       # 删除指定行程安排
PATCH  /api/itinerary/:id/status # 更新行程状态
```

**请求参数示例**:
```json
{
  "date": "2024-01-15",
  "time": "09:00",
  "activity": "参观云龙湖",
  "description": "游览云龙湖风景区",
  "tips": "建议穿舒适的鞋子",
  "location": "云龙湖风景区",
  "duration": 180,
  "status": "计划中"
}
```

### 4. 活动规划模块

```
GET    /api/activities          # 获取所有活动规划
GET    /api/activities/:id      # 获取指定活动规划
POST   /api/activities          # 创建新的活动规划
PUT    /api/activities/:id      # 更新指定活动规划
DELETE /api/activities/:id      # 删除指定活动规划
GET    /api/activities/stats/categories # 获取活动分类统计
```

### 5. 预算参考模块

```
GET    /api/budget/reference    # 获取预算参考数据
GET    /api/budget/reference/:id # 获取指定预算参考
POST   /api/budget/reference    # 创建预算参考项目
PUT    /api/budget/reference/:id # 更新预算参考项目
DELETE /api/budget/reference/:id # 删除预算参考项目
GET    /api/budget/analysis     # 获取预算对比分析数据
GET    /api/budget/stats/categories # 获取预算分类统计
```

### 6. 实际消费支出模块

```
GET    /api/expenses            # 获取所有实际支出记录
GET    /api/expenses/:id        # 获取指定支出记录
POST   /api/expenses            # 创建新的支出记录
PUT    /api/expenses/:id        # 更新支出记录
DELETE /api/expenses/:id        # 删除支出记录
GET    /api/expenses/stats/summary # 获取支出统计摘要
```

## 数据库表结构

### 1. travel_checklist (出行清单表)
- id: 主键
- item_name: 项目名称
- category: 分类（证件类、衣物类等）
- is_completed: 是否完成
- priority: 优先级
- notes: 备注

### 2. travel_itinerary (行程安排表)
- id: 主键
- date: 日期
- time: 时间
- activity: 活动内容
- description: 详细描述
- tips: 贴心提示
- location: 地点
- duration: 预计时长
- status: 状态

### 3. travel_activities (活动规划表)
- id: 主键
- title: 活动标题
- category: 活动分类
- description: 活动描述
- location: 活动地点
- estimated_cost: 预估费用
- priority: 优先级

### 4. budget_reference (预算参考表)
- id: 主键
- category: 费用分类
- item_name: 项目名称
- min_amount: 最低金额
- max_amount: 最高金额
- recommended_amount: 推荐金额
- unit: 计费单位

### 5. travel_expenses (实际支出表)
- id: 主键
- category: 支出分类
- amount: 支出金额
- description: 支出描述
- date: 支出日期
- payment_method: 支付方式
- is_planned: 是否计划内支出

## 错误处理

系统提供统一的错误处理机制，所有错误都会返回标准格式的错误信息：

```json
{
  "status": "error",
  "message": "错误描述信息"
}
```

## 日志记录

系统使用 Winston 进行日志记录，日志文件保存在 `logs/` 目录下：

- `error.log`: 错误日志
- `combined.log`: 所有日志

## 开发说明

1. 所有接口都支持分页查询
2. 数据验证使用 express-validator
3. 支持中文错误消息
4. 自动处理数据库连接池
5. 支持事务处理

## 测试

访问前端应用的 API 测试页面可以测试所有接口的连接状态。
