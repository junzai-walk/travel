import express from 'express';
import { body, param, query } from 'express-validator';
import { Op, fn, col } from 'sequelize';
import { BudgetReference, Expenses } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 预算参考验证规则
const budgetReferenceValidation = [
  body('category')
    .isIn(['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '物品费', '其他费用'])
    .withMessage('费用分类必须是有效的分类'),
  body('item_name')
    .notEmpty()
    .withMessage('费用项目名称不能为空')
    .isLength({ min: 1, max: 200 })
    .withMessage('费用项目名称长度必须在1-200字符之间'),
  body('min_amount')
    .isFloat({ min: 0 })
    .withMessage('最低预算金额不能为负数'),
  body('max_amount')
    .isFloat({ min: 0 })
    .withMessage('最高预算金额不能为负数'),
  body('recommended_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('推荐预算金额不能为负数'),
  body('unit')
    .isIn(['元/人', '元/天', '元/次', '元/公里', '元/小时', '元'])
    .withMessage('计费单位必须是有效的单位'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('费用说明不能超过2000字符'),
  body('tips')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('省钱小贴士不能超过2000字符'),
  body('season_factor')
    .optional()
    .isFloat({ min: 0.1, max: 5.0 })
    .withMessage('季节调整系数必须在0.1-5.0之间'),
  body('is_essential')
    .optional()
    .isBoolean()
    .withMessage('是否必需费用必须是布尔值')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须是有效的正整数')
];

// GET /api/budget - 获取预算参考数据（默认路由）
router.get('/', catchAsync(async (req, res) => {
  const { category, is_essential, page = 1, limit = 50 } = req.query;

  // 构建查询条件
  const where = {};
  if (category) where.category = category;
  if (is_essential !== undefined) where.is_essential = is_essential === 'true';

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 获取总数和数据
  const { count: total, rows: items } = await BudgetReference.findAndCountAll({
    where,
    order: [['category', 'ASC'], ['recommended_amount', 'DESC']],
    limit: limitNum,
    offset
  });

  logger.info(`获取预算参考列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取预算参考列表成功',
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

// GET /api/budget/reference - 获取预算参考数据
router.get('/reference', catchAsync(async (req, res) => {
  const { category, is_essential, page = 1, limit = 50 } = req.query;

  // 构建查询条件
  const where = {};
  if (category) where.category = category;
  if (is_essential !== undefined) where.is_essential = is_essential === 'true';

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // 构建排序条件
  const order = [
    ['category', 'ASC'],
    ['is_essential', 'DESC'],
    ['recommended_amount', 'ASC']
  ];

  const { count: total, rows: items } = await BudgetReference.findAndCountAll({
    where,
    order,
    limit: limitNum,
    offset
  });

  logger.info(`获取预算参考列表，共${total}条记录`);

  res.json({
    status: 'success',
    message: '获取预算参考列表成功',
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

// GET /api/budget/reference/:id - 获取指定预算参考
router.get('/reference/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  const item = await BudgetReference.findByPk(id);

  if (!item) {
    throw new AppError('预算参考不存在', 404);
  }

  logger.info(`获取预算参考详情，ID: ${id}`);

  res.json({
    status: 'success',
    message: '获取预算参考详情成功',
    data: item
  });
}));

// POST /api/budget/reference - 创建预算参考项目
router.post('/reference', budgetReferenceValidation, validateRequest, catchAsync(async (req, res) => {
  const {
    category,
    item_name,
    min_amount,
    max_amount,
    recommended_amount,
    unit,
    description,
    tips,
    season_factor = 1.00,
    is_essential = true
  } = req.body;

  // 验证金额逻辑
  if (max_amount < min_amount) {
    throw new AppError('最高预算金额不能小于最低预算金额', 400);
  }

  if (recommended_amount && (recommended_amount < min_amount || recommended_amount > max_amount)) {
    throw new AppError('推荐预算金额必须在最低和最高预算金额之间', 400);
  }

  const newItem = await BudgetReference.create({
    category,
    item_name,
    min_amount,
    max_amount,
    recommended_amount,
    unit,
    description,
    tips,
    season_factor,
    is_essential
  });

  logger.info(`创建新预算参考，ID: ${newItem.id}, 项目: ${item_name}`);

  res.status(201).json({
    status: 'success',
    message: '创建预算参考成功',
    data: newItem
  });
}));

// PUT /api/budget/reference/:id - 更新预算参考项目
router.put('/reference/:id',
  [...idValidation, ...budgetReferenceValidation],
  validateRequest,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const {
      category,
      item_name,
      min_amount,
      max_amount,
      recommended_amount,
      unit,
      description,
      tips,
      season_factor,
      is_essential
    } = req.body;

    // 验证金额逻辑
    if (max_amount < min_amount) {
      throw new AppError('最高预算金额不能小于最低预算金额', 400);
    }

    if (recommended_amount && (recommended_amount < min_amount || recommended_amount > max_amount)) {
      throw new AppError('推荐预算金额必须在最低和最高预算金额之间', 400);
    }

    const [updatedRowsCount] = await BudgetReference.update(
      {
        category,
        item_name,
        min_amount,
        max_amount,
        recommended_amount,
        unit,
        description,
        tips,
        season_factor,
        is_essential
      },
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      throw new AppError('预算参考不存在', 404);
    }

    const item = await BudgetReference.findByPk(id);

    logger.info(`更新预算参考，ID: ${id}, 项目: ${item_name}`);

    res.json({
      status: 'success',
      message: '更新预算参考成功',
      data: item
    });
  })
);

// DELETE /api/budget/reference/:id - 删除预算参考项目
router.delete('/reference/:id', idValidation, validateRequest, catchAsync(async (req, res) => {
  const { id } = req.params;

  // 获取项目信息用于日志
  const item = await BudgetReference.findByPk(id);

  const deletedRowsCount = await BudgetReference.destroy({
    where: { id }
  });

  if (deletedRowsCount === 0) {
    throw new AppError('预算参考不存在', 404);
  }

  logger.info(`删除预算参考，ID: ${id}, 项目: ${item ? item.item_name : '未知'}`);

  res.json({
    status: 'success',
    message: '删除预算参考成功'
  });
}));

// GET /api/budget/analysis - 获取预算vs实际对比分析数据
router.get('/analysis', catchAsync(async (req, res) => {
  const { date_from, date_to } = req.query;

  // 构建日期查询条件
  const expenseWhere = {};
  if (date_from || date_to) {
    expenseWhere.date = {};
    if (date_from) expenseWhere.date[Op.gte] = new Date(date_from);
    if (date_to) expenseWhere.date[Op.lte] = new Date(date_to);
  }

  // 获取预算参考数据（按分类汇总）
  const budgetData = await BudgetReference.findAll({
    attributes: [
      'category',
      [fn('SUM', col('recommended_amount')), 'total_budget'],
      [fn('AVG', col('recommended_amount')), 'avg_budget'],
      [fn('MIN', col('min_amount')), 'min_budget'],
      [fn('MAX', col('max_amount')), 'max_budget'],
      [fn('COUNT', col('id')), 'budget_items_count']
    ],
    group: ['category'],
    order: [['category', 'ASC']],
    raw: true
  });

  // 获取实际支出数据（按分类汇总）
  const expenseData = await Expenses.findAll({
    attributes: [
      'category',
      [fn('SUM', col('amount')), 'total_expense'],
      [fn('AVG', col('amount')), 'avg_expense'],
      [fn('COUNT', col('id')), 'expense_items_count']
    ],
    where: expenseWhere,
    group: ['category'],
    order: [['category', 'ASC']],
    raw: true
  });

  // 合并预算和实际支出数据
  const categories = ['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'];
  const analysisData = categories.map(category => {
    const budget = budgetData.find(item => item.category === category);
    const expense = expenseData.find(item => item.category === category);

    const budgetAmount = budget ? parseFloat(budget.total_budget) || 0 : 0;
    const expenseAmount = expense ? parseFloat(expense.total_expense) || 0 : 0;
    const variance = expenseAmount - budgetAmount;
    const variancePercent = budgetAmount > 0 ? ((variance / budgetAmount) * 100) : 0;

    return {
      category,
      budget: {
        total: budgetAmount,
        average: budget ? parseFloat(budget.avg_budget) || 0 : 0,
        min: budget ? parseFloat(budget.min_budget) || 0 : 0,
        max: budget ? parseFloat(budget.max_budget) || 0 : 0,
        items_count: budget ? parseInt(budget.budget_items_count) || 0 : 0
      },
      actual: {
        total: expenseAmount,
        average: expense ? parseFloat(expense.avg_expense) || 0 : 0,
        items_count: expense ? parseInt(expense.expense_items_count) || 0 : 0
      },
      variance: {
        amount: Math.round(variance * 100) / 100,
        percent: Math.round(variancePercent * 100) / 100,
        status: variance > 0 ? '超支' : variance < 0 ? '节省' : '持平'
      }
    };
  });

  // 计算总体统计
  const totalBudget = analysisData.reduce((sum, item) => sum + item.budget.total, 0);
  const totalExpense = analysisData.reduce((sum, item) => sum + item.actual.total, 0);
  const totalVariance = totalExpense - totalBudget;
  const totalVariancePercent = totalBudget > 0 ? ((totalVariance / totalBudget) * 100) : 0;

  const summary = {
    total_budget: Math.round(totalBudget * 100) / 100,
    total_expense: Math.round(totalExpense * 100) / 100,
    total_variance: Math.round(totalVariance * 100) / 100,
    total_variance_percent: Math.round(totalVariancePercent * 100) / 100,
    overall_status: totalVariance > 0 ? '超支' : totalVariance < 0 ? '节省' : '持平'
  };

  logger.info('获取预算对比分析数据');

  res.json({
    status: 'success',
    message: '获取预算对比分析数据成功',
    data: {
      summary,
      categories: analysisData,
      date_range: {
        from: date_from || null,
        to: date_to || null
      }
    }
  });
}));

// GET /api/budget/stats/categories - 获取预算分类统计
router.get('/stats/categories', catchAsync(async (req, res) => {

  const stats = await BudgetReference.findAll({
    attributes: [
      'category',
      [fn('COUNT', col('id')), 'count'],
      [fn('AVG', col('recommended_amount')), 'avg_amount'],
      [fn('SUM', col('recommended_amount')), 'total_amount']
    ],
    group: ['category'],
    order: [[fn('SUM', col('recommended_amount')), 'DESC']],
    raw: true
  });

  // 格式化数据
  const formattedStats = stats.map(stat => ({
    category: stat.category,
    count: parseInt(stat.count),
    avg_amount: Math.round(parseFloat(stat.avg_amount) * 100) / 100,
    total_amount: Math.round(parseFloat(stat.total_amount) * 100) / 100
  }));

  logger.info('获取预算分类统计');

  res.json({
    status: 'success',
    message: '获取预算分类统计成功',
    data: formattedStats
  });
}));

export default router;
