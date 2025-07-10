import express from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
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
    .isMongoId()
    .withMessage('ID必须是有效的MongoDB ObjectId')
];

// GET /api/checklist - 获取所有清单项目
router.get('/', catchAsync(async (req, res) => {
  const { category, is_completed, priority, page = 1, limit = 50 } = req.query;

  // 构建查询条件
  const filter = {};
  if (category) filter.category = category;
  if (is_completed !== undefined) filter.is_completed = is_completed === 'true';
  if (priority) filter.priority = priority;

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // 获取总数和数据
  const [total, items] = await Promise.all([
    Checklist.countDocuments(filter),
    Checklist.find(filter)
      .sort({
        priority: priority === '高' ? -1 : priority === '低' ? 1 : 0,
        createdAt: -1
      })
      .skip(skip)
      .limit(limitNum)
      .lean()
  ]);

  logger.info(`获取清单项目列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取清单项目列表成功',
    data: {
      items: items.map(item => ({
        ...item,
        id: item._id,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      })),
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

  const item = await Checklist.findById(id);

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

  const newItem = new Checklist({
    item_name,
    category,
    priority,
    is_completed,
    notes
  });

  await newItem.save();

  logger.info(`创建新清单项目，ID: ${newItem._id}, 名称: ${item_name}`);

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

    const item = await Checklist.findByIdAndUpdate(
      id,
      {
        item_name,
        category,
        priority,
        is_completed,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new AppError('清单项目不存在', 404);
    }

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

  const item = await Checklist.findByIdAndDelete(id);

  if (!item) {
    throw new AppError('清单项目不存在', 404);
  }

  logger.info(`删除清单项目，ID: ${id}, 名称: ${item.item_name}`);

  res.json({
    status: 'success',
    message: '删除清单项目成功'
  });
}));

// PATCH /api/checklist/:id/toggle - 切换完成状态
router.patch('/:id/toggle', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Checklist.findById(id);

  if (!item) {
    throw new AppError('清单项目不存在', 404);
  }

  item.is_completed = !item.is_completed;
  await item.save();

  logger.info(`切换清单项目完成状态，ID: ${id}, 新状态: ${item.is_completed}`);

  res.json({
    status: 'success',
    message: '切换完成状态成功',
    data: item
  });
}));

export default router;
