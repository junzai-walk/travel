import { logger } from '../utils/logger.js';

// 自定义错误类
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(`错误: ${error.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = new AppError(`数据验证失败: ${message}`, 400);
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = '数据已存在，请检查重复项';
    error = new AppError(message, 400);
  }

  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = '关联数据不存在或已被引用';
    error = new AppError(message, 400);
  }

  // Sequelize 数据库连接错误
  if (err.name === 'SequelizeConnectionError') {
    const message = '数据库连接失败';
    error = new AppError(message, 500);
  }

  // Sequelize 数据库错误
  if (err.name === 'SequelizeDatabaseError') {
    const message = '数据库操作失败';
    error = new AppError(message, 500);
  }

  // Sequelize 超时错误
  if (err.name === 'SequelizeTimeoutError') {
    const message = '数据库操作超时';
    error = new AppError(message, 500);
  }

  // JSON 解析错误
  if (err.type === 'entity.parse.failed') {
    const message = '请求数据格式错误';
    error = new AppError(message, 400);
  }

  // 404 错误
  if (err.statusCode === 404) {
    error = new AppError('请求的资源不存在', 404);
  }

  // 发送错误响应
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 异步错误捕获包装器
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
