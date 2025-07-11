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
    'http://175.178.87.16:9943',
    'https://175.178.87.16:9943'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '徐州旅游指南后端服务运行正常（简化模式）',
    mode: 'simple',
    database: 'disabled',
    timestamp: new Date().toISOString()
  });
});

// 行程安排 API 模拟
app.get('/api/itinerary', (req, res) => {
  res.json({
    status: 'success',
    message: '获取行程安排列表成功',
    data: {
      items: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 50,
        pages: 0
      }
    }
  });
});

app.post('/api/itinerary', (req, res) => {
  res.status(201).json({
    status: 'success',
    message: '创建行程安排成功',
    data: {
      id: '507f1f77bcf86cd799439011',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  });
});

app.put('/api/itinerary/:id', (req, res) => {
  res.json({
    status: 'success',
    message: '更新行程安排成功',
    data: {
      id: req.params.id,
      ...req.body,
      updated_at: new Date().toISOString()
    }
  });
});

app.delete('/api/itinerary/:id', (req, res) => {
  res.json({
    status: 'success',
    message: '删除行程安排成功'
  });
});

app.patch('/api/itinerary/:id/status', (req, res) => {
  res.json({
    status: 'success',
    message: '更新行程状态成功',
    data: {
      id: req.params.id,
      status: req.body.status,
      updated_at: new Date().toISOString()
    }
  });
});

// 其他API模拟
app.use('/api/checklist*', (req, res) => {
  res.json({
    status: 'info',
    message: '简化模式：清单功能已禁用',
    endpoint: req.originalUrl,
    method: req.method
  });
});

app.use('/api/activities*', (req, res) => {
  res.json({
    status: 'info',
    message: '简化模式：活动功能已禁用',
    endpoint: req.originalUrl,
    method: req.method
  });
});

app.use('/api/budget*', (req, res) => {
  res.json({
    status: 'info',
    message: '简化模式：预算功能已禁用',
    endpoint: req.originalUrl,
    method: req.method
  });
});

app.use('/api/expenses*', (req, res) => {
  res.json({
    status: 'info',
    message: '简化模式：支出功能已禁用',
    endpoint: req.originalUrl,
    method: req.method
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
  console.error('服务器错误:', error);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 徐州旅游指南后端服务启动成功！(简化模式)`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  简化模式：数据库功能已禁用，仅提供API模拟`);
});
