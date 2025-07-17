import express from 'express';
import { body, param, query } from 'express-validator';
import { Op, fn, col } from 'sequelize';
import { Expenses, BudgetReference } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 实际支出验证规则
const expensesValidation = [
  body('category')
    .isIn(['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '物品费', '其他费用'])
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
    .isInt({ min: 1 })
    .withMessage('预算参考ID必须是有效的正整数')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须是有效的正整数')
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
  const where = {};
  if (category) where.category = category;
  if (payment_method) where.payment_method = payment_method;
  if (is_planned !== undefined) where.is_planned = is_planned === 'true';

  // 日期范围查询
  if (date_from || date_to) {
    where.date = {};
    if (date_from) where.date[Op.gte] = date_from;
    if (date_to) where.date[Op.lte] = date_to;
  }

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 获取总数和数据
  const { count: total, rows: items } = await Expenses.findAndCountAll({
    where,
    include: [{
      model: BudgetReference,
      as: 'budgetReference',
      attributes: ['item_name', 'category', 'recommended_amount']
    }],
    order: [['date', 'DESC'], ['time', 'DESC'], ['created_at', 'DESC']],
    limit: limitNum,
    offset
  });

  logger.info(`获取实际支出列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取实际支出列表成功',
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

// GET /api/expenses/:id - 获取指定支出记录
router.get('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Expenses.findByPk(id, {
    include: [{
      model: BudgetReference,
      as: 'budgetReference',
      attributes: ['item_name', 'category', 'recommended_amount']
    }]
  });

  if (!item) {
    throw new AppError('支出记录不存在', 404);
  }

  logger.info(`获取支出记录详情，ID: ${id}`);

  res.json({
    status: 'success',
    message: '获取支出记录详情成功',
    data: item
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

  // 详细日志记录请求数据
  logger.info('创建支出记录请求数据:', {
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
    budget_reference_id,
    dateType: typeof date,
    amountType: typeof amount
  });

  // 验证预算参考ID是否存在
  if (budget_reference_id) {
    logger.info(`验证预算参考ID: ${budget_reference_id}`);
    const budgetRef = await BudgetReference.findByPk(budget_reference_id);
    if (!budgetRef) {
      logger.error(`预算参考ID不存在: ${budget_reference_id}`);
      throw new AppError('关联的预算参考不存在', 400);
    }
    logger.info(`预算参考验证成功: ${budgetRef.item_name}`);
  }

  try {
    const newItem = await Expenses.create({
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
    });

    logger.info(`创建新支出记录成功，ID: ${newItem.id}, 金额: ${amount}, 日期: ${date}`);

    res.status(201).json({
      status: 'success',
      message: '创建支出记录成功',
      data: newItem
    });
  } catch (error) {
    logger.error('创建支出记录失败:', {
      error: error.message,
      stack: error.stack,
      requestData: { category, amount, description, date, time, location, payment_method }
    });
    throw error;
  }
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
      const budgetRef = await BudgetReference.findByPk(budget_reference_id);
      if (!budgetRef) {
        throw new AppError('关联的预算参考不存在', 400);
      }
    }

    const [updatedRowsCount] = await Expenses.update(
      {
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
      },
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('支出记录不存在', 404);
    }

    const item = await Expenses.findByPk(id, {
      include: [{
        model: BudgetReference,
        as: 'budgetReference',
        attributes: ['item_name', 'category', 'recommended_amount']
      }]
    });

    logger.info(`更新支出记录，ID: ${id}, 金额: ${amount}`);

    res.json({
      status: 'success',
      message: '更新支出记录成功',
      data: item
    });
  })
);

// DELETE /api/expenses/:id - 删除支出记录
router.delete('/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await Expenses.findByPk(id);

  if (!item) {
    throw new AppError('支出记录不存在', 404);
  }

  await Expenses.destroy({
    where: { id }
  });

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
  const where = {};
  if (date_from || date_to) {
    where.date = {};
    if (date_from) where.date[Op.gte] = date_from;
    if (date_to) where.date[Op.lte] = date_to;
  }

  // 使用Sequelize的聚合查询
  const summary = await Expenses.findAll({
    attributes: [
      'category',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('amount')), 'total_amount'],
      [fn('AVG', col('amount')), 'avg_amount']
    ],
    where,
    group: ['category'],
    order: [[fn('SUM', col('amount')), 'DESC']],
    raw: true
  });

  // 格式化数据，保留两位小数
  const formattedSummary = summary.map(item => ({
    category: item.category,
    count: parseInt(item.count),
    total_amount: parseFloat(parseFloat(item.total_amount).toFixed(2)),
    avg_amount: parseFloat(parseFloat(item.avg_amount).toFixed(2))
  }));

  logger.info('获取支出统计摘要');

  res.json({
    status: 'success',
    message: '获取支出统计摘要成功',
    data: formattedSummary
  });
}));

export default router;
