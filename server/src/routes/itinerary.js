import express from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { Itinerary } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 验证规则
const itineraryValidation = [
  body('date')
    .isISO8601()
    .withMessage('请输入有效的日期格式(YYYY-MM-DD)')
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        throw new Error('行程日期不能早于今天');
      }
      return true;
    }),
  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('请输入有效的时间格式(HH:MM)'),
  body('activity')
    .notEmpty()
    .withMessage('活动内容不能为空')
    .isLength({ min: 1, max: 300 })
    .withMessage('活动内容长度必须在1-300字符之间'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('详细描述不能超过2000字符'),
  body('tips')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('贴心提示不能超过2000字符'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('地点位置不能超过200字符'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('预计时长必须是正整数（分钟）'),
  body('status')
    .optional()
    .isIn(['计划中', '进行中', '已完成', '已取消'])
    .withMessage('行程状态必须是有效的状态')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID必须是有效的MongoDB ObjectId')
];

// GET /api/itinerary - 获取所有行程安排
router.get('/', catchAsync(async (req, res) => {
  const { date, status, page = 1, limit = 50 } = req.query;
  
  // 构建查询条件
  const filter = {};
  if (date) filter.date = new Date(date);
  if (status) filter.status = status;

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [total, items] = await Promise.all([
    Itinerary.countDocuments(filter),
    Itinerary.find(filter)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
  ]);

  logger.info(`获取行程安排列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取行程安排列表成功',
    data: {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
}));

// GET /api/itinerary/:id - 获取指定行程安排
router.get('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const item = await Itinerary.findById(id);
  
  if (!item) {
    throw new AppError('行程安排不存在', 404);
  }

  logger.info(`获取行程安排详情，ID: ${id}`);

  res.json({
    status: 'success',
    message: '获取行程安排详情成功',
    data: item
  });
}));

// POST /api/itinerary - 创建新的行程安排
router.post('/', itineraryValidation, validateRequest, catchAsync(async (req, res) => {
  const { 
    date, 
    time, 
    activity, 
    description, 
    tips, 
    location, 
    duration, 
    status = '计划中' 
  } = req.body;

  const newItem = new Itinerary({
    date: new Date(date),
    time,
    activity,
    description,
    tips,
    location,
    duration,
    status
  });

  await newItem.save();

  logger.info(`创建新行程安排，ID: ${newItem._id}, 活动: ${activity}`);

  res.status(201).json({
    status: 'success',
    message: '创建行程安排成功',
    data: newItem
  });
}));

// PUT /api/itinerary/:id - 更新指定行程安排
router.put('/:id', 
  [...idValidation, ...itineraryValidation], 
  validateRequest, 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { 
      date, 
      time, 
      activity, 
      description, 
      tips, 
      location, 
      duration, 
      status 
    } = req.body;

    const item = await Itinerary.findByIdAndUpdate(
      id,
      {
        date: new Date(date),
        time,
        activity,
        description,
        tips,
        location,
        duration,
        status
      },
      { new: true, runValidators: true }
    );
    
    if (!item) {
      throw new AppError('行程安排不存在', 404);
    }

    logger.info(`更新行程安排，ID: ${id}, 活动: ${activity}`);

    res.json({
      status: 'success',
      message: '更新行程安排成功',
      data: item
    });
  })
);

// DELETE /api/itinerary/:id - 删除指定行程安排
router.delete('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const item = await Itinerary.findByIdAndDelete(id);
  
  if (!item) {
    throw new AppError('行程安排不存在', 404);
  }

  logger.info(`删除行程安排，ID: ${id}, 活动: ${item.activity}`);

  res.json({
    status: 'success',
    message: '删除行程安排成功'
  });
}));

// PATCH /api/itinerary/:id/status - 更新行程状态
router.patch('/:id/status', 
  [
    ...idValidation,
    body('status')
      .isIn(['计划中', '进行中', '已完成', '已取消'])
      .withMessage('行程状态必须是有效的状态')
  ], 
  validateRequest, 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const item = await Itinerary.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!item) {
      throw new AppError('行程安排不存在', 404);
    }

    logger.info(`更新行程状态，ID: ${id}, 新状态: ${status}`);

    res.json({
      status: 'success',
      message: '更新行程状态成功',
      data: item
    });
  })
);

export default router;
