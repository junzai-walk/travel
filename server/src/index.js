import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isTestMode = process.env.NODE_ENV === 'test';

// 中间件配置
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://175.178.87.16:9943',  // 生产环境前端地址
    'https://175.178.87.16:9943'  // HTTPS 版本
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 测试模式下的简单路由
if (isTestMode) {
  app.use('/api/*', (req, res) => {
    res.json({
      status: 'info',
      message: '测试模式：数据库功能已禁用',
      endpoint: req.originalUrl,
      method: req.method
    });
  });
}

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: isTestMode ? '徐州旅游指南后端服务运行正常（测试模式）' : '徐州旅游指南后端服务运行正常',
    mode: isTestMode ? 'test' : 'production',
    database: isTestMode ? 'disabled' : 'enabled',
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use(errorHandler);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: '请求的接口不存在'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 如果是测试模式，跳过数据库连接
    if (!isTestMode) {
      // 动态导入数据库配置
      const { connectDB } = await import('./config/database.js');

      // 连接 MongoDB 数据库
      const connected = await connectDB();
      if (!connected) {
        throw new Error('MongoDB 连接失败');
      }
      logger.info('MongoDB 连接成功');

      // 动态导入并设置路由
      const { default: checklistRoutes } = await import('./routes/checklist.js');
      const { default: itineraryRoutes } = await import('./routes/itinerary.js');
      const { default: activitiesRoutes } = await import('./routes/activities.js');
      const { default: budgetRoutes } = await import('./routes/budget.js');
      const { default: expensesRoutes } = await import('./routes/expenses.js');

      app.use('/api/checklist', checklistRoutes);
      app.use('/api/itinerary', itineraryRoutes);
      app.use('/api/activities', activitiesRoutes);
      app.use('/api/budget', budgetRoutes);
      app.use('/api/expenses', expensesRoutes);

      logger.info('API 路由已加载');
    } else {
      logger.info('测试模式：跳过数据库连接');
    }

    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      console.log(`🚀 徐州旅游指南后端服务启动成功！`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
      if (isTestMode) {
        console.log(`⚠️  测试模式：数据库功能已禁用`);
      }
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    if (!isTestMode) {
      process.exit(1);
    } else {
      // 测试模式下即使数据库连接失败也继续启动
      logger.warn('测试模式：忽略数据库连接错误，继续启动服务器');
      app.listen(PORT, () => {
        logger.info(`服务器运行在端口 ${PORT} (测试模式)`);
        console.log(`🚀 徐州旅游指南后端服务启动成功！(测试模式)`);
        console.log(`📍 服务地址: http://localhost:${PORT}`);
        console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
        console.log(`⚠️  测试模式：数据库功能已禁用`);
      });
    }
  }
}

startServer();
