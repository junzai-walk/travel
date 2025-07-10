import mongoose from 'mongoose';

// 预算参考 Schema
const budgetReferenceSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, '费用分类不能为空'],
    enum: {
      values: ['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'],
      message: '费用分类必须是有效的分类'
    }
  },
  item_name: {
    type: String,
    required: [true, '费用项目名称不能为空'],
    trim: true,
    maxlength: [200, '费用项目名称长度不能超过200字符'],
    minlength: [1, '费用项目名称不能为空']
  },
  min_amount: {
    type: Number,
    required: [true, '最低预算金额不能为空'],
    min: [0, '最低预算金额不能为负数'],
    max: [999999.99, '最低预算金额不能超过999999.99'],
    validate: {
      validator: function(value) {
        // 验证小数点后最多2位
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: '最低预算金额最多保留2位小数'
    }
  },
  max_amount: {
    type: Number,
    required: [true, '最高预算金额不能为空'],
    min: [0, '最高预算金额不能为负数'],
    max: [999999.99, '最高预算金额不能超过999999.99'],
    validate: {
      validator: function(value) {
        // 验证小数点后最多2位
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: '最高预算金额最多保留2位小数'
    }
  },
  recommended_amount: {
    type: Number,
    min: [0, '推荐预算金额不能为负数'],
    max: [999999.99, '推荐预算金额不能超过999999.99'],
    validate: {
      validator: function(value) {
        if (value === null || value === undefined) return true;
        // 验证小数点后最多2位
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: '推荐预算金额最多保留2位小数'
    }
  },
  unit: {
    type: String,
    required: true,
    enum: {
      values: ['人/天', '人/次', '总计', '其他'],
      message: '计费单位必须是有效的单位'
    },
    default: '人/次'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, '费用说明不能超过2000字符']
  },
  tips: {
    type: String,
    trim: true,
    maxlength: [2000, '省钱小贴士不能超过2000字符']
  },
  season_factor: {
    type: Number,
    min: [0.1, '季节调整系数不能小于0.1'],
    max: [5.0, '季节调整系数不能大于5.0'],
    default: 1.00,
    validate: {
      validator: function(value) {
        if (value === null || value === undefined) return true;
        // 验证小数点后最多2位
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: '季节调整系数最多保留2位小数'
    }
  },
  is_essential: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true,
  collection: 'budget_reference',
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  }
});

// 自定义验证：最高金额必须大于等于最低金额
budgetReferenceSchema.pre('save', function(next) {
  if (this.max_amount < this.min_amount) {
    return next(new Error('最高预算金额不能小于最低预算金额'));
  }

  if (this.recommended_amount &&
      (this.recommended_amount < this.min_amount || this.recommended_amount > this.max_amount)) {
    return next(new Error('推荐预算金额必须在最低和最高预算金额之间'));
  }

  next();
});

// 创建索引
budgetReferenceSchema.index({ category: 1 });
budgetReferenceSchema.index({ is_essential: 1 });
budgetReferenceSchema.index({ recommended_amount: 1 });
budgetReferenceSchema.index({ createdAt: -1 });

// 创建模型
export const BudgetReference = mongoose.model('BudgetReference', budgetReferenceSchema);

export default BudgetReference;
