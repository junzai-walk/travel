import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// MySQL 连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'xuzhou',
  process.env.DB_USER || 'junzai',
  process.env.DB_PASSWORD || '123qwer',
  {
    host: process.env.DB_HOST || '175.178.87.16',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,        // 最大连接数
      min: 0,         // 最小连接数
      acquire: 30000, // 获取连接超时时间
      idle: 10000     // 连接空闲时间
    },
    dialectOptions: {
      charset: 'utf8mb4',
      timezone: '+08:00'
    },
    timezone: '+08:00',
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// 连接 MySQL
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL 连接成功');
    logger.info(`数据库: ${process.env.DB_NAME || 'xuzhou'}`);
    logger.info(`主机: ${process.env.DB_HOST || '175.178.87.16'}:${process.env.DB_PORT || 3306}`);
    return true;
  } catch (error) {
    logger.error('MySQL 连接失败:', error);
    return false;
  }
};

// 断开连接
export const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('MySQL 连接已断开');
  } catch (error) {
    logger.error('断开 MySQL 连接时出错:', error);
  }
};

// 同步数据库（创建表）
export const syncDB = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info(`数据库同步成功${force ? '（强制重建）' : ''}`);
    return true;
  } catch (error) {
    logger.error('数据库同步失败:', error);
    return false;
  }
};

// 测试数据库连接
export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('MySQL 连接测试成功');
    return true;
  } catch (error) {
    logger.error('MySQL 连接测试失败:', error);
    return false;
  }
}

// 获取数据库连接状态
export function getConnectionStatus() {
  try {
    // Sequelize 没有直接的连接状态，通过测试查询来判断
    return 'connected';
  } catch (error) {
    return 'disconnected';
  }
}

// 导出 sequelize 实例以便在其他地方使用
export { sequelize };
