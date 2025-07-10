import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

// 验证请求中间件
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new AppError(`数据验证失败: ${errorMessages.join(', ')}`, 400);
  }
  
  next();
};
