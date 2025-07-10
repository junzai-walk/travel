import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// 简单的日志中间件
app.use(morgan('combined'));

// 测试模式下的简单路由
app.use('/api/*', (req, res) => {
  res.json({
    status: 'info',
    message: '测试模式：数据库功能已禁用',
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '徐州旅游指南后端服务运行正常（测试模式）',
    mode: 'test',
    database: 'disabled',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: '请求的接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 徐州旅游指南后端服务启动成功！(测试模式)`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  测试模式：数据库功能已禁用`);
});
