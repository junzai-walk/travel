import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xuzhou';

// 连接选项
const mongooseOptions = {
  // 连接池配置
  maxPoolSize: 10,        // 最大连接数
  minPoolSize: 0,         // 最小连接数
  maxIdleTimeMS: 30000,   // 连接空闲时间
  serverSelectionTimeoutMS: 5000, // 服务器选择超时
  socketTimeoutMS: 45000, // Socket 超时
};

// 连接 MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    logger.info('MongoDB 连接成功');
    logger.info(`数据库: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    logger.error('MongoDB 连接失败:', error);
    return false;
  }
};

// 断开连接
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB 连接已断开');
  } catch (error) {
    logger.error('断开 MongoDB 连接时出错:', error);
  }
};

// 监听连接事件
mongoose.connection.on('connected', () => {
  logger.info('Mongoose 连接已建立');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose 连接已断开');
});

// 测试数据库连接
export async function testConnection() {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB 连接测试成功');
      return true;
    } else {
      const connected = await connectDB();
      return connected;
    }
  } catch (error) {
    logger.error('MongoDB 连接测试失败:', error);
    return false;
  }
}

// 获取数据库连接状态
export function getConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

// 导出 mongoose 实例以便在其他地方使用
export { mongoose };
