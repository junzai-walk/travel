import express from 'express';
import { body, param, query } from 'express-validator';
import { Op } from 'sequelize';
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
    .isInt({ min: 1 })
    .withMessage('ID必须是有效的正整数')
];

// GET /api/itinerary - 获取所有行程安排
router.get('/', catchAsync(async (req, res) => {
  const { date, status, page = 1, limit = 50 } = req.query;

  // 构建查询条件
  const where = {};
  if (date) where.date = date;
  if (status) where.status = status;

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 获取总数和数据
  const { count: total, rows: items } = await Itinerary.findAndCountAll({
    where,
    order: [['date', 'ASC'], ['time', 'ASC']],
    limit: limitNum,
    offset
  });

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

  const item = await Itinerary.findByPk(id);

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

  const newItem = await Itinerary.create({
    date,
    time,
    activity,
    description,
    tips,
    location,
    duration,
    status
  });

  logger.info(`创建新行程安排，ID: ${newItem.id}, 活动: ${activity}`);

  res.status(201).json({
    status: 'success',
    message: '创建行程安排成功',
    data: newItem
  });
}));

// PUT /api/itinerary/:id - 更新指定行程安排（全量更新）
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

    const [updatedRowsCount] = await Itinerary.update(
      {
        date,
        time,
        activity,
        description,
        tips,
        location,
        duration,
        status
      },
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('行程安排不存在', 404);
    }

    const item = await Itinerary.findByPk(id);

    logger.info(`更新行程安排，ID: ${id}, 活动: ${activity}`);

    res.json({
      status: 'success',
      message: '更新行程安排成功',
      data: item
    });
  })
);

// PATCH /api/itinerary/:id - 部分更新指定行程安排
router.patch('/:id',
  idValidation,
  validateRequest,
  catchAsync(async (req, res) => {
    const { id } = req.params;

    // 只更新请求体中提供的字段
    const updateFields = {};
    const allowedFields = ['date', 'time', 'activity', 'description', 'tips', 'location', 'duration', 'status'];

    // 只包含请求中实际提供的字段
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updateFields[field] = req.body[field];
      }
    });

    // 如果没有提供任何可更新的字段
    if (Object.keys(updateFields).length === 0) {
      throw new AppError('请提供至少一个要更新的字段', 400);
    }

    const [updatedRowsCount] = await Itinerary.update(
      updateFields,
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('行程安排不存在', 404);
    }

    const item = await Itinerary.findByPk(id);

    logger.info(`部分更新行程安排，ID: ${id}, 更新字段: ${Object.keys(updateFields).join(', ')}`);

    res.json({
      status: 'success',
      message: '部分更新行程安排成功',
      data: item
    });
  })
);

// DELETE /api/itinerary/:id - 删除指定行程安排
router.delete('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Itinerary.findByPk(id);

  if (!item) {
    throw new AppError('行程安排不存在', 404);
  }

  await Itinerary.destroy({
    where: { id }
  });

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

    const [updatedRowsCount] = await Itinerary.update(
      { status },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('行程安排不存在', 404);
    }

    const item = await Itinerary.findByPk(id);

    logger.info(`更新行程状态，ID: ${id}, 新状态: ${status}`);

    res.json({
      status: 'success',
      message: '更新行程状态成功',
      data: item
    });
  })
);

export default router;
