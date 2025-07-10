import express from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { Expenses, BudgetReference } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 实际支出验证规则
const expensesValidation = [
  body('category')
    .isIn(['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'])
    .withMessage('支出分类必须是有效的分类'),
  body('amount')
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('支出金额必须在0-999999.99之间'),
  body('description')
    .notEmpty()
    .withMessage('支出描述不能为空')
    .isLength({ min: 1, max: 300 })
    .withMessage('支出描述长度必须在1-300字符之间'),
  body('date')
    .isISO8601()
    .withMessage('请输入有效的日期格式(YYYY-MM-DD)'),
  body('time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('请输入有效的时间格式(HH:MM)'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('支出地点不能超过200字符'),
  body('payment_method')
    .isIn(['现金', '支付宝', '微信支付', '银行卡', '信用卡', '其他'])
    .withMessage('支付方式必须是有效的方式'),
  body('receipt_number')
    .optional()
    .isLength({ max: 100 })
    .withMessage('收据/发票号码不能超过100字符'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('备注信息不能超过1000字符'),
  body('is_planned')
    .optional()
    .isBoolean()
    .withMessage('是否为计划内支出必须是布尔值'),
  body('budget_reference_id')
    .optional()
    .isMongoId()
    .withMessage('预算参考ID必须是有效的MongoDB ObjectId')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID必须是有效的MongoDB ObjectId')
];

// GET /api/expenses - 获取所有实际支出记录
router.get('/', catchAsync(async (req, res) => {
  const { 
    category, 
    payment_method, 
    is_planned, 
    date_from, 
    date_to, 
    page = 1, 
    limit = 50 
  } = req.query;
  
  // 构建查询条件
  const filter = {};
  if (category) filter.category = category;
  if (payment_method) filter.payment_method = payment_method;
  if (is_planned !== undefined) filter.is_planned = is_planned === 'true';
  
  // 日期范围查询
  if (date_from || date_to) {
    filter.date = {};
    if (date_from) filter.date.$gte = new Date(date_from);
    if (date_to) filter.date.$lte = new Date(date_to);
  }

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [total, items] = await Promise.all([
    Expenses.countDocuments(filter),
    Expenses.find(filter)
      .populate('budget_reference_id', 'item_name category recommended_amount')
      .sort({ date: -1, time: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
  ]);

  logger.info(`获取实际支出列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取实际支出列表成功',
    data: {
      items: items.map(item => ({
        ...item,
        budgetReference: item.budget_reference_id
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

// GET /api/expenses/:id - 获取指定支出记录
router.get('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const item = await Expenses.findById(id)
    .populate('budget_reference_id', 'item_name category recommended_amount');
  
  if (!item) {
    throw new AppError('支出记录不存在', 404);
  }

  logger.info(`获取支出记录详情，ID: ${id}`);

  const result = item.toObject();
  result.budgetReference = result.budget_reference_id;

  res.json({
    status: 'success',
    message: '获取支出记录详情成功',
    data: result
  });
}));

// POST /api/expenses - 创建新的支出记录
router.post('/', expensesValidation, validateRequest, catchAsync(async (req, res) => {
  const { 
    category,
    amount,
    description,
    date,
    time,
    location,
    payment_method,
    receipt_number,
    notes,
    is_planned = false,
    budget_reference_id
  } = req.body;

  // 验证预算参考ID是否存在
  if (budget_reference_id) {
    const budgetRef = await BudgetReference.findById(budget_reference_id);
    if (!budgetRef) {
      throw new AppError('关联的预算参考不存在', 400);
    }
  }

  const newItem = new Expenses({
    category,
    amount,
    description,
    date: new Date(date),
    time,
    location,
    payment_method,
    receipt_number,
    notes,
    is_planned,
    budget_reference_id
  });

  await newItem.save();

  // 获取完整的记录（包含关联数据）
  const fullItem = await Expenses.findById(newItem._id)
    .populate('budget_reference_id', 'item_name category recommended_amount');

  logger.info(`创建新支出记录，ID: ${newItem._id}, 金额: ${amount}`);

  const result = fullItem.toObject();
  result.budgetReference = result.budget_reference_id;

  res.status(201).json({
    status: 'success',
    message: '创建支出记录成功',
    data: result
  });
}));

// PUT /api/expenses/:id - 更新支出记录
router.put('/:id', 
  [...idValidation, ...expensesValidation], 
  validateRequest, 
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { 
      category,
      amount,
      description,
      date,
      time,
      location,
      payment_method,
      receipt_number,
      notes,
      is_planned,
      budget_reference_id
    } = req.body;

    // 验证预算参考ID是否存在
    if (budget_reference_id) {
      const budgetRef = await BudgetReference.findById(budget_reference_id);
      if (!budgetRef) {
        throw new AppError('关联的预算参考不存在', 400);
      }
    }

    const item = await Expenses.findByIdAndUpdate(
      id,
      {
        category,
        amount,
        description,
        date: new Date(date),
        time,
        location,
        payment_method,
        receipt_number,
        notes,
        is_planned,
        budget_reference_id
      },
      { new: true, runValidators: true }
    ).populate('budget_reference_id', 'item_name category recommended_amount');
    
    if (!item) {
      throw new AppError('支出记录不存在', 404);
    }

    logger.info(`更新支出记录，ID: ${id}, 金额: ${amount}`);

    const result = item.toObject();
    result.budgetReference = result.budget_reference_id;

    res.json({
      status: 'success',
      message: '更新支出记录成功',
      data: result
    });
  })
);

// DELETE /api/expenses/:id - 删除支出记录
router.delete('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const item = await Expenses.findByIdAndDelete(id);
  
  if (!item) {
    throw new AppError('支出记录不存在', 404);
  }

  logger.info(`删除支出记录，ID: ${id}, 描述: ${item.description}`);

  res.json({
    status: 'success',
    message: '删除支出记录成功'
  });
}));

// GET /api/expenses/stats/summary - 获取支出统计摘要
router.get('/stats/summary', catchAsync(async (req, res) => {
  const { date_from, date_to } = req.query;
  
  // 构建日期查询条件
  const matchStage = {};
  if (date_from || date_to) {
    matchStage.date = {};
    if (date_from) matchStage.date.$gte = new Date(date_from);
    if (date_to) matchStage.date.$lte = new Date(date_to);
  }

  const summary = await Expenses.aggregate([
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        total_amount: { $sum: '$amount' },
        avg_amount: { $avg: '$amount' }
      }
    },
    {
      $sort: { total_amount: -1 }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        total_amount: { $round: ['$total_amount', 2] },
        avg_amount: { $round: ['$avg_amount', 2] },
        _id: 0
      }
    }
  ]);

  logger.info('获取支出统计摘要');

  res.json({
    status: 'success',
    message: '获取支出统计摘要成功',
    data: summary
  });
}));

export default router;
