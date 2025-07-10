import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xuzhou';

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

// 简单的测试模型
const TestSchema = new mongoose.Schema({
  name: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('Test', TestSchema);

// 健康检查端点
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'success',
    message: '徐州旅游指南后端服务运行正常（MongoDB 测试模式）',
    mode: 'mongodb-test',
    database: dbStatus,
    mongodb_uri: MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

// 测试 MongoDB 连接的端点
app.get('/api/test-mongo', async (req, res) => {
  try {
    // 尝试创建一个测试文档
    const testDoc = new TestModel({
      name: 'MongoDB 连接测试',
      message: '如果您看到这条消息，说明 MongoDB 连接正常'
    });
    
    await testDoc.save();
    
    // 查询刚创建的文档
    const docs = await TestModel.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      status: 'success',
      message: 'MongoDB 连接测试成功',
      data: {
        connection_status: 'connected',
        test_document: testDoc,
        recent_tests: docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'MongoDB 连接测试失败',
      error: error.message
    });
  }
});

// 清理测试数据
app.delete('/api/test-mongo', async (req, res) => {
  try {
    const result = await TestModel.deleteMany({});
    res.json({
      status: 'success',
      message: '测试数据清理完成',
      deleted_count: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '清理测试数据失败',
      error: error.message
    });
  }
});

// 模拟 API 端点
app.use('/api/*', (req, res) => {
  res.json({
    status: 'info',
    message: 'MongoDB 测试模式：API 功能正在开发中',
    endpoint: req.originalUrl,
    method: req.method,
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

// 连接 MongoDB 并启动服务器
async function startServer() {
  try {
    console.log('🔄 正在连接 MongoDB...');
    console.log(`📍 MongoDB URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB 连接成功');
    console.log(`📊 数据库: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 徐州旅游指南后端服务启动成功！(MongoDB 测试模式)`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🧪 MongoDB 测试: http://localhost:${PORT}/api/test-mongo`);
      console.log(`🗄️  MongoDB 状态: 已连接`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    console.log('💡 请确保 MongoDB 服务正在运行');
    console.log('💡 检查 MongoDB 连接字符串:', MONGODB_URI);
    process.exit(1);
  }
}

// 监听 MongoDB 连接事件
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose 连接已建立');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose 连接错误:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose 连接已断开');
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🔄 正在关闭服务器...');
  await mongoose.connection.close();
  console.log('✅ MongoDB 连接已关闭');
  process.exit(0);
});

startServer();
