import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './src/utils/logger.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 30001;

// 中间件配置
app.use(cors({
  origin: [
    'http://175.178.87.16:5173',
    'http://175.178.87.16:5174',
    'http://175.178.87.16:5175',
    'http://175.178.87.16:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '徐州旅游指南后端服务运行正常（MySQL迁移测试模式）',
    mode: 'mysql-migration-test',
    database: 'mysql-ready',
    timestamp: new Date().toISOString(),
    migration_status: {
      dependencies: '✅ MySQL依赖已安装',
      models: '✅ Sequelize模型已转换',
      routes: '✅ 路由已更新',
      config: '✅ 数据库配置已更新',
      connection: '⚠️ 等待MySQL服务器权限配置'
    }
  });
});

// 模拟API端点用于测试
app.get('/api/checklist', (req, res) => {
  res.json({
    status: 'success',
    message: '获取清单项目列表成功（测试模式）',
    data: {
      items: [
        {
          id: 1,
          item_name: '身份证',
          category: '证件类',
          is_completed: false,
          priority: '高',
          notes: '必带证件',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 50,
        pages: 1
      }
    }
  });
});

app.post('/api/checklist', (req, res) => {
  res.status(201).json({
    status: 'success',
    message: '创建清单项目成功（测试模式）',
    data: {
      id: 2,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  });
});

// budget路由的特殊处理
app.get('/api/budget/reference', (req, res) => {
  res.json({
    status: 'success',
    message: '获取预算参考列表成功（测试模式）',
    data: {
      items: [
        {
          id: 1,
          category: '交通费',
          item_name: '高铁票',
          min_amount: 100,
          max_amount: 300,
          recommended_amount: 200,
          unit: '元/人',
          description: '往返高铁票费用',
          is_essential: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      pagination: { total: 1, page: 1, limit: 50, pages: 1 }
    }
  });
});

app.post('/api/budget/reference', (req, res) => {
  res.status(201).json({
    status: 'success',
    message: '创建预算参考成功（测试模式）',
    data: { id: 2, ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  });
});

// 其他API端点的模拟
['itinerary', 'activities', 'expenses'].forEach(endpoint => {
  app.get(`/api/${endpoint}`, (req, res) => {
    res.json({
      status: 'success',
      message: `获取${endpoint}列表成功（测试模式）`,
      data: {
        items: [],
        pagination: { total: 0, page: 1, limit: 50, pages: 0 }
      }
    });
  });

  app.post(`/api/${endpoint}`, (req, res) => {
    res.status(201).json({
      status: 'success',
      message: `创建${endpoint}成功（测试模式）`,
      data: { id: 1, ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    });
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: '请求的接口不存在'
  });
});

// 错误处理
app.use((error, req, res, next) => {
  logger.error('服务器错误:', error);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 徐州旅游指南后端服务启动成功！(MySQL迁移测试模式)');
  console.log(`📍 服务地址: http://175.178.87.16:${PORT}`);
  console.log(`🏥 健康检查: http://175.178.87.16:${PORT}/api/health`);
  console.log('');
  console.log('📋 迁移状态:');
  console.log('✅ 依赖包: mongoose → mysql2 + sequelize');
  console.log('✅ 数据模型: Mongoose Schema → Sequelize Models');
  console.log('✅ 路由更新: MongoDB查询 → Sequelize查询');
  console.log('✅ 错误处理: Mongoose错误 → Sequelize错误');
  console.log('⚠️  数据库连接: 等待MySQL服务器权限配置');
  console.log('');
  console.log('🔧 下一步: 配置MySQL服务器权限后即可完成迁移');
});
