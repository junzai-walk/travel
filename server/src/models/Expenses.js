import mongoose from 'mongoose';

// 实际消费支出 Schema
const expensesSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, '支出分类不能为空'],
    enum: {
      values: ['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'],
      message: '支出分类必须是有效的分类'
    }
  },
  amount: {
    type: Number,
    required: [true, '支出金额不能为空'],
    min: [0, '支出金额不能为负数'],
    max: [999999.99, '支出金额不能超过999999.99元'],
    validate: {
      validator: function(value) {
        // 验证小数点后最多2位
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: '支出金额最多保留2位小数'
    }
  },
  description: {
    type: String,
    required: [true, '支出描述不能为空'],
    trim: true,
    maxlength: [300, '支出描述长度不能超过300字符'],
    minlength: [1, '支出描述不能为空']
  },
  date: {
    type: Date,
    required: [true, '支出日期不能为空']
  },
  time: {
    type: String,
    validate: {
      validator: function(value) {
        if (!value) return true; // 允许为空
        // 验证时间格式 HH:MM
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
      },
      message: '请输入有效的时间格式(HH:MM)'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, '支出地点不能超过200字符']
  },
  payment_method: {
    type: String,
    required: true,
    enum: {
      values: ['现金', '支付宝', '微信支付', '银行卡', '信用卡', '其他'],
      message: '支付方式必须是有效的方式'
    },
    default: '其他'
  },
  receipt_number: {
    type: String,
    trim: true,
    maxlength: [100, '收据/发票号码不能超过100字符']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, '备注信息不能超过1000字符']
  },
  is_planned: {
    type: Boolean,
    required: true,
    default: false
  },
  budget_reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetReference',
    validate: {
      validator: async function(value) {
        if (!value) return true; // 允许为空
        const BudgetReference = mongoose.model('BudgetReference');
        const exists = await BudgetReference.findById(value);
        return !!exists;
      },
      message: '关联的预算参考不存在'
    }
  }
}, {
  timestamps: true,
  collection: 'travel_expenses',
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      // 格式化日期为 YYYY-MM-DD
      if (ret.date) {
        ret.date = ret.date.toISOString().split('T')[0];
      }
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
      // 格式化日期为 YYYY-MM-DD
      if (ret.date) {
        ret.date = ret.date.toISOString().split('T')[0];
      }
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  }
});

// 创建索引
expensesSchema.index({ category: 1 });
expensesSchema.index({ date: -1 });
expensesSchema.index({ amount: 1 });
expensesSchema.index({ payment_method: 1 });
expensesSchema.index({ is_planned: 1 });
expensesSchema.index({ budget_reference_id: 1 });
expensesSchema.index({ createdAt: -1 });

// 创建模型
export const Expenses = mongoose.model('Expenses', expensesSchema);

export default Expenses;
