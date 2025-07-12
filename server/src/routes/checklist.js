import express from 'express';
import { body, param, query } from 'express-validator';
import { Checklist } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 验证规则
const checklistValidation = [
  body('item_name')
    .notEmpty()
    .withMessage('清单项目名称不能为空')
    .isLength({ min: 1, max: 200 })
    .withMessage('清单项目名称长度必须在1-200字符之间'),
  body('category')
    .isIn(['证件类', '衣物类', '电子设备', '洗护用品', '药品类', '其他'])
    .withMessage('清单项目分类必须是有效的分类'),
  body('priority')
    .optional()
    .isIn(['高', '中', '低'])
    .withMessage('优先级必须是高、中、低之一'),
  body('is_completed')
    .optional()
    .isBoolean()
    .withMessage('完成状态必须是布尔值'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('备注信息不能超过1000字符')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须是有效的正整数')
];

// GET /api/checklist - 获取所有清单项目
router.get('/', catchAsync(async (req, res) => {
  const { category, is_completed, priority, page = 1, limit = 50 } = req.query;

  // 构建查询条件
  const where = {};
  if (category) where.category = category;
  if (is_completed !== undefined) where.is_completed = is_completed === 'true';
  if (priority) where.priority = priority;

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 构建排序条件
  const order = [];
  if (priority === '高') {
    order.push(['priority', 'DESC']);
  } else if (priority === '低') {
    order.push(['priority', 'ASC']);
  }
  order.push(['created_at', 'DESC']);

  // 获取总数和数据
  const { count: total, rows: items } = await Checklist.findAndCountAll({
    where,
    order,
    limit: limitNum,
    offset
  });

  logger.info(`获取清单项目列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取清单项目列表成功',
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

// GET /api/checklist/:id - 获取指定清单项目
router.get('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Checklist.findByPk(id);

  if (!item) {
    throw new AppError('清单项目不存在', 404);
  }

  logger.info(`获取清单项目详情，ID: ${id}`);

  res.json({
    status: 'success',
    message: '获取清单项目详情成功',
    data: item
  });
}));

// POST /api/checklist - 创建新的清单项目
router.post('/', checklistValidation, validateRequest, catchAsync(async (req, res) => {
  const { item_name, category, priority = '中', is_completed = false, notes } = req.body;

  const newItem = await Checklist.create({
    item_name,
    category,
    priority,
    is_completed,
    notes
  });

  logger.info(`创建新清单项目，ID: ${newItem.id}, 名称: ${item_name}`);

  res.status(201).json({
    status: 'success',
    message: '创建清单项目成功',
    data: newItem
  });
}));

// PUT /api/checklist/:id - 更新指定清单项目
router.put('/:id',
  [...idValidation, ...checklistValidation],
  validateRequest,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { item_name, category, priority, is_completed, notes } = req.body;

    const [updatedRowsCount] = await Checklist.update(
      {
        item_name,
        category,
        priority,
        is_completed,
        notes
      },
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('清单项目不存在', 404);
    }

    const item = await Checklist.findByPk(id);

    logger.info(`更新清单项目，ID: ${id}, 名称: ${item_name}`);

    res.json({
      status: 'success',
      message: '更新清单项目成功',
      data: item
    });
  })
);

// DELETE /api/checklist/:id - 删除指定清单项目
router.delete('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedRowsCount = await Checklist.destroy({
    where: { id }
  });

  if (deletedRowsCount === 0) {
    throw new AppError('清单项目不存在', 404);
  }

  // 获取项目名称用于日志记录
  const item = await Checklist.findByPk(id);
  logger.info(`删除清单项目，ID: ${id}, 名称: ${item ? item.item_name : '未知'}`);

  res.json({
    status: 'success',
    message: '删除清单项目成功'
  });
}));

// PATCH /api/checklist/:id/toggle - 切换完成状态
router.patch('/:id/toggle', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Checklist.findByPk(id);

  if (!item) {
    throw new AppError('清单项目不存在', 404);
  }

  const newStatus = !item.is_completed;

  await Checklist.update(
    { is_completed: newStatus },
    { where: { id } }
  );

  // 重新获取更新后的数据
  const updatedItem = await Checklist.findByPk(id);

  logger.info(`切换清单项目完成状态，ID: ${id}, 新状态: ${newStatus}`);

  res.json({
    status: 'success',
    message: '切换完成状态成功',
    data: updatedItem
  });
}));

export default router;
