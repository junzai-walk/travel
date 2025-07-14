import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// 实际消费支出模型
const Expenses = sequelize.define('Expenses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  category: {
    type: DataTypes.ENUM('交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['交通费', '住宿费', '餐饮费', '门票费', '购物费', '娱乐费', '其他费用']],
        msg: '支出分类必须是有效的分类'
      }
    },
    comment: '支出分类'
  },
  amount: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '支出金额不能为负数'
      },
      max: {
        args: [999999.99],
        msg: '支出金额不能超过999999.99元'
      }
    },
    comment: '支出金额'
  },
  description: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '支出描述不能为空'
      },
      len: {
        args: [1, 300],
        msg: '支出描述长度必须在1-300字符之间'
      }
    },
    comment: '支出描述'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '支出日期不能为空'
      },
      isDate: {
        msg: '请输入有效的日期格式'
      }
    },
    comment: '支出日期'
  },
  time: {
    type: DataTypes.STRING(5),
    allowNull: true,
    validate: {
      is: {
        args: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        msg: '请输入有效的时间格式(HH:MM)'
      }
    },
    comment: '支出时间'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: {
        args: [0, 200],
        msg: '支出地点不能超过200字符'
      }
    },
    comment: '支出地点'
  },
  payment_method: {
    type: DataTypes.ENUM('现金', '支付宝', '微信支付', '银行卡', '信用卡', '其他'),
    allowNull: false,
    defaultValue: '其他',
    validate: {
      isIn: {
        args: [['现金', '支付宝', '微信支付', '银行卡', '信用卡', '其他']],
        msg: '支付方式必须是有效的方式'
      }
    },
    comment: '支付方式'
  },
  receipt_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: '收据/发票号码不能超过100字符'
      }
    },
    comment: '收据/发票号码'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: '备注信息不能超过1000字符'
      }
    },
    comment: '备注信息'
  },
  is_planned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否计划内支出'
  },
  budget_reference_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'budget_reference',
      key: 'id'
    },
    comment: '关联的预算参考ID'
  }
}, {
  tableName: 'travel_expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '实际支出表',
  indexes: [
    {
      name: 'idx_category',
      fields: ['category']
    },
    {
      name: 'idx_date',
      fields: ['date']
    },
    {
      name: 'idx_amount',
      fields: ['amount']
    },
    {
      name: 'idx_payment_method',
      fields: ['payment_method']
    },
    {
      name: 'idx_is_planned',
      fields: ['is_planned']
    },
    {
      name: 'idx_budget_reference_id',
      fields: ['budget_reference_id']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// 添加实例方法
Expenses.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  // 格式化日期为 YYYY-MM-DD
  if (values.date) {
    // 检查是否已经是Date对象，如果不是则转换
    if (values.date instanceof Date) {
      values.date = values.date.toISOString().split('T')[0];
    } else if (typeof values.date === 'string') {
      // 如果是字符串，尝试解析为Date对象再格式化
      try {
        const dateObj = new Date(values.date);
        if (!isNaN(dateObj.getTime())) {
          values.date = dateObj.toISOString().split('T')[0];
        }
        // 如果已经是YYYY-MM-DD格式，保持不变
      } catch (error) {
        // 如果转换失败，保持原值
        console.warn('日期格式转换失败:', values.date, error);
      }
    }
  }
  return values;
};

export default Expenses;
