import express from 'express';
import { body, param, query } from 'express-validator';
import { Op } from 'sequelize';
import { Activities } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 验证规则
const activitiesValidation = [
  body('title')
    .notEmpty()
    .withMessage('活动标题不能为空')
    .isLength({ min: 1, max: 200 })
    .withMessage('活动标题长度必须在1-200字符之间'),
  body('category')
    .isIn(['景点游览', '美食体验', '文化活动', '休闲娱乐', '购物', '交通', '住宿', '其他'])
    .withMessage('活动分类必须是有效的分类'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('活动描述不能超过2000字符'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('活动地点不能超过200字符'),
  body('estimated_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('预估费用不能为负数'),
  body('estimated_duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('预估时长必须是正整数（分钟）'),
  body('priority')
    .optional()
    .isIn(['必去', '推荐', '可选'])
    .withMessage('优先级必须是必去、推荐、可选之一'),
  body('season_suitable')
    .optional()
    .isLength({ max: 100 })
    .withMessage('适宜季节不能超过100字符'),
  body('tips')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('活动提示不能超过2000字符'),
  body('contact_info')
    .optional()
    .isLength({ max: 200 })
    .withMessage('联系方式不能超过200字符'),
  body('opening_hours')
    .optional()
    .isLength({ max: 100 })
    .withMessage('开放时间不能超过100字符')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须是有效的正整数')
];

// GET /api/activities - 获取所有活动规划
router.get('/', catchAsync(async (req, res) => {
  const { category, priority, page = 1, limit = 50, search } = req.query;

  // 构建查询条件
  const where = {};
  if (category) where.category = category;
  if (priority) where.priority = priority;

  // 搜索功能
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { location: { [Op.like]: `%${search}%` } }
    ];
  }

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 构建排序条件
  const order = [];
  if (priority === '必去') {
    order.push(['priority', 'DESC']);
  } else if (priority === '可选') {
    order.push(['priority', 'ASC']);
  }
  order.push(['estimated_cost', 'ASC']);
  order.push(['created_at', 'DESC']);

  // 获取总数和数据
  const { count: total, rows: items } = await Activities.findAndCountAll({
    where,
    order,
    limit: limitNum,
    offset
  });

  logger.info(`获取活动规划列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取活动规划列表成功',
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

// GET /api/activities/:id - 获取指定活动规划
router.get('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Activities.findByPk(id);

  if (!item) {
    throw new AppError('活动规划不存在', 404);
  }

  logger.info(`获取活动规划详情，ID: ${id}`);

  res.json({
    status: 'success',
    message: '获取活动规划详情成功',
    data: item
  });
}));

// POST /api/activities - 创建新的活动规划
router.post('/', activitiesValidation, validateRequest, catchAsync(async (req, res) => {
  const {
    title,
    category,
    description,
    location,
    estimated_cost,
    estimated_duration,
    priority = '推荐',
    season_suitable,
    tips,
    contact_info,
    opening_hours
  } = req.body;

  const newItem = await Activities.create({
    title,
    category,
    description,
    location,
    estimated_cost,
    estimated_duration,
    priority,
    season_suitable,
    tips,
    contact_info,
    opening_hours
  });

  logger.info(`创建新活动规划，ID: ${newItem.id}, 标题: ${title}`);

  res.status(201).json({
    status: 'success',
    message: '创建活动规划成功',
    data: newItem
  });
}));

// PUT /api/activities/:id - 更新指定活动规划
router.put('/:id',
  [...idValidation, ...activitiesValidation],
  validateRequest,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      location,
      estimated_cost,
      estimated_duration,
      priority,
      season_suitable,
      tips,
      contact_info,
      opening_hours
    } = req.body;

    const [updatedRowsCount] = await Activities.update(
      {
        title,
        category,
        description,
        location,
        estimated_cost,
        estimated_duration,
        priority,
        season_suitable,
        tips,
        contact_info,
        opening_hours
      },
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('活动规划不存在', 404);
    }

    const item = await Activities.findByPk(id);

    logger.info(`更新活动规划，ID: ${id}, 标题: ${title}`);

    res.json({
      status: 'success',
      message: '更新活动规划成功',
      data: item
    });
  })
);

// DELETE /api/activities/:id - 删除指定活动规划
router.delete('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Activities.findByPk(id);

  if (!item) {
    throw new AppError('活动规划不存在', 404);
  }

  await Activities.destroy({
    where: { id }
  });

  logger.info(`删除活动规划，ID: ${id}, 标题: ${item.title}`);

  res.json({
    status: 'success',
    message: '删除活动规划成功'
  });
}));

// GET /api/activities/stats/categories - 获取活动分类统计
router.get('/stats/categories', catchAsync(async (req, res) => {
  const stats = await Activities.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avg_cost: { $avg: '$estimated_cost' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        avg_cost: { $round: ['$avg_cost', 2] },
        _id: 0
      }
    }
  ]);

  logger.info('获取活动分类统计');

  res.json({
    status: 'success',
    message: '获取活动分类统计成功',
    data: stats
  });
}));

export default router;
