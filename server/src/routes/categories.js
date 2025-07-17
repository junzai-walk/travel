import express from 'express';
import { body, param } from 'express-validator';
import { Op, fn, col } from 'sequelize';
import { Checklist } from '../models/index.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { validateRequest } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

console.log('Categories 路由文件已加载');
logger.info('Categories 路由文件已加载');

// 验证规则
const categoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('分类名称不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('分类名称长度必须在1-50字符之间')
    .trim()
];

const categoryNameValidation = [
  param('name')
    .notEmpty()
    .withMessage('分类名称不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('分类名称长度必须在1-50字符之间')
];

// 默认分类列表
const getDefaultCategories = () => ['证件类', '衣物类', '电子设备', '洗护用品',  '日常用品', '财务类', '医疗用品', '食物类'
];

// GET /api/categories - 获取所有分类
router.get('/', catchAsync(async (req, res) => {
  console.log('收到获取分类列表请求');
  logger.info('收到获取分类列表请求');

  try {
    // 从数据库中获取所有已使用的分类
    const usedCategories = await Checklist.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['category'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    // 获取默认分类
    const defaultCategories = getDefaultCategories();

    // 合并默认分类和已使用的分类，去重
    const allCategories = [...new Set([
      ...defaultCategories,
      ...usedCategories.map(item => item.category).filter(cat => cat && cat.trim())
    ])];

    logger.info(`获取分类列表，共${allCategories.length}个分类`);

    res.json({
      status: 'success',
      message: '获取分类列表成功',
      data: {
        categories: allCategories,
        stats: usedCategories.map(item => ({
          category: item.category,
          count: parseInt(item.count)
        }))
      }
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    logger.error('获取分类列表失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取分类列表失败'
    });
  }
}));

// POST /api/categories - 创建新分类
router.post('/', categoryValidation, validateRequest, catchAsync(async (req, res) => {
  const { name } = req.body;
  const trimmedName = name.trim();

  try {
    // 检查分类是否已存在（在数据库中查找是否有使用该分类的记录）
    const existingCategory = await Checklist.findOne({
      where: { category: trimmedName }
    });

    // 检查是否为默认分类
    const defaultCategories = getDefaultCategories();
    const isDefault = defaultCategories.includes(trimmedName);

    if (existingCategory || isDefault) {
      logger.info(`分类"${trimmedName}"已存在`);
      return res.json({
        status: 'success',
        message: '分类已存在',
        data: { name: trimmedName, exists: true }
      });
    }

    logger.info(`创建新分类: ${trimmedName}`);

    res.status(201).json({
      status: 'success',
      message: '分类创建成功',
      data: { name: trimmedName, exists: false }
    });
  } catch (error) {
    logger.error('创建分类失败:', error);
    throw error;
  }
}));

// PUT /api/categories/:name - 重命名分类
router.put('/:name',
  [...categoryNameValidation, ...categoryValidation],
  validateRequest,
  catchAsync(async (req, res) => {
    const oldName = decodeURIComponent(req.params.name);
    const { name: newName } = req.body;
    const trimmedNewName = newName.trim();

    try {
      // 检查是否为默认分类（不允许重命名）
      const defaultCategories = getDefaultCategories();
      if (defaultCategories.includes(oldName)) {
        throw new AppError('不能重命名系统默认分类', 400);
      }

      // 检查新名称是否已存在
      if (oldName !== trimmedNewName) {
        const existingCategory = await Checklist.findOne({
          where: { category: trimmedNewName }
        });

        if (existingCategory || defaultCategories.includes(trimmedNewName)) {
          throw new AppError('该分类名称已存在', 400);
        }
      }

      // 更新所有使用该分类的记录
      const [updatedCount] = await Checklist.update(
        { category: trimmedNewName },
        { where: { category: oldName } }
      );

      if (updatedCount === 0) {
        throw new AppError('分类不存在或没有相关记录', 404);
      }

      logger.info(`重命名分类: "${oldName}" -> "${trimmedNewName}", 更新了${updatedCount}条记录`);

      res.json({
        status: 'success',
        message: '分类重命名成功',
        data: {
          oldName,
          newName: trimmedNewName,
          updatedCount
        }
      });
    } catch (error) {
      logger.error('重命名分类失败:', error);
      throw error;
    }
  })
);

// DELETE /api/categories/:name - 删除分类
router.delete('/:name', categoryNameValidation, validateRequest, catchAsync(async (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);

  try {
    // 检查是否为默认分类（不允许删除）
    const defaultCategories = getDefaultCategories();
    if (defaultCategories.includes(categoryName)) {
      throw new AppError('不能删除系统默认分类', 400);
    }

    // 将该分类下的所有记录移动到"自定义"分类
    const [updatedCount] = await Checklist.update(
      { category: '自定义' },
      { where: { category: categoryName } }
    );

    if (updatedCount === 0) {
      throw new AppError('分类不存在或没有相关记录', 404);
    }

    logger.info(`删除分类: "${categoryName}", 将${updatedCount}条记录移动到"自定义"分类`);

    res.json({
      status: 'success',
      message: '分类删除成功，相关记录已移动到"自定义"分类',
      data: {
        deletedCategory: categoryName,
        movedCount: updatedCount
      }
    });
  } catch (error) {
    logger.error('删除分类失败:', error);
    throw error;
  }
}));

export default router;
