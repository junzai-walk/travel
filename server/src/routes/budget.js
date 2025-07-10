import express from 'express';
import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { BudgetReference, Expenses } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 预算参考验证规则
const budgetReferenceValidation = [
  body('category')
    .isIn(['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'])
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
    .isIn(['人/天', '人/次', '总计', '其他'])
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
    .isMongoId()
    .withMessage('ID必须是有效的MongoDB ObjectId')
];

// GET /api/budget/reference - 获取预算参考数据
router.get('/reference', catchAsync(async (req, res) => {
  const { category, is_essential, page = 1, limit = 50 } = req.query;

  // 构建查询条件
  const filter = {};
  if (category) filter.category = category;
  if (is_essential !== undefined) filter.is_essential = is_essential === 'true';

  // 分页参数
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [total, items] = await Promise.all([
    BudgetReference.countDocuments(filter),
    BudgetReference.find(filter)
      .sort({
        category: 1,
        is_essential: -1,
        recommended_amount: 1
      })
      .skip(skip)
      .limit(limitNum)
      .lean()
  ]);

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

  const item = await BudgetReference.findById(id);

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

  const newItem = new BudgetReference({
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

  await newItem.save();

  logger.info(`创建新预算参考，ID: ${newItem._id}, 项目: ${item_name}`);

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

    const item = await BudgetReference.findByIdAndUpdate(
      id,
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
      { new: true, runValidators: true }
    );

    if (!item) {
      throw new AppError('预算参考不存在', 404);
    }

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

  const item = await BudgetReference.findByIdAndDelete(id);

  if (!item) {
    throw new AppError('预算参考不存在', 404);
  }

  logger.info(`删除预算参考，ID: ${id}, 项目: ${item.item_name}`);

  res.json({
    status: 'success',
    message: '删除预算参考成功'
  });
}));

// GET /api/budget/analysis - 获取预算vs实际对比分析数据
router.get('/analysis', catchAsync(async (req, res) => {
  const { date_from, date_to } = req.query;

  // 构建日期查询条件
  const expenseMatchStage = {};
  if (date_from || date_to) {
    expenseMatchStage.date = {};
    if (date_from) expenseMatchStage.date.$gte = new Date(date_from);
    if (date_to) expenseMatchStage.date.$lte = new Date(date_to);
  }

  // 获取预算参考数据（按分类汇总）
  const budgetData = await BudgetReference.aggregate([
    {
      $group: {
        _id: '$category',
        total_budget: { $sum: '$recommended_amount' },
        avg_budget: { $avg: '$recommended_amount' },
        min_budget: { $min: '$min_amount' },
        max_budget: { $max: '$max_amount' },
        budget_items_count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        category: '$_id',
        total_budget: { $round: ['$total_budget', 2] },
        avg_budget: { $round: ['$avg_budget', 2] },
        min_budget: { $round: ['$min_budget', 2] },
        max_budget: { $round: ['$max_budget', 2] },
        budget_items_count: 1,
        _id: 0
      }
    }
  ]);

  // 获取实际支出数据（按分类汇总）
  const expenseData = await Expenses.aggregate([
    ...(Object.keys(expenseMatchStage).length > 0 ? [{ $match: expenseMatchStage }] : []),
    {
      $group: {
        _id: '$category',
        total_expense: { $sum: '$amount' },
        avg_expense: { $avg: '$amount' },
        expense_items_count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    },
    {
      $project: {
        category: '$_id',
        total_expense: { $round: ['$total_expense', 2] },
        avg_expense: { $round: ['$avg_expense', 2] },
        expense_items_count: 1,
        _id: 0
      }
    }
  ]);

  // 合并预算和实际支出数据
  const categories = ['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'];
  const analysisData = categories.map(category => {
    const budget = budgetData.find(item => item.category === category);
    const expense = expenseData.find(item => item.category === category);

    const budgetAmount = budget ? budget.total_budget || 0 : 0;
    const expenseAmount = expense ? expense.total_expense || 0 : 0;
    const variance = expenseAmount - budgetAmount;
    const variancePercent = budgetAmount > 0 ? ((variance / budgetAmount) * 100) : 0;

    return {
      category,
      budget: {
        total: budgetAmount,
        average: budget ? budget.avg_budget || 0 : 0,
        min: budget ? budget.min_budget || 0 : 0,
        max: budget ? budget.max_budget || 0 : 0,
        items_count: budget ? budget.budget_items_count || 0 : 0
      },
      actual: {
        total: expenseAmount,
        average: expense ? expense.avg_expense || 0 : 0,
        items_count: expense ? expense.expense_items_count || 0 : 0
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
    total_budget: totalBudget,
    total_expense: totalExpense,
    total_variance: totalVariance,
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
  const stats = await BudgetReference.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avg_amount: { $avg: '$recommended_amount' },
        total_amount: { $sum: '$recommended_amount' }
      }
    },
    {
      $sort: { total_amount: -1 }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        avg_amount: { $round: ['$avg_amount', 2] },
        total_amount: { $round: ['$total_amount', 2] },
        _id: 0
      }
    }
  ]);

  logger.info('获取预算分类统计');

  res.json({
    status: 'success',
    message: '获取预算分类统计成功',
    data: stats
  });
}));

export default router;
