import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// 预算参考模型
const BudgetReference = sequelize.define('BudgetReference', {
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
        msg: '费用分类必须是有效的分类'
      }
    },
    comment: '费用分类'
  },
  item_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '费用项目名称不能为空'
      },
      len: {
        args: [1, 200],
        msg: '费用项目名称长度必须在1-200字符之间'
      }
    },
    comment: '费用项目名称'
  },
  min_amount: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '最低预算金额不能为负数'
      },
      max: {
        args: [999999.99],
        msg: '最低预算金额不能超过999999.99'
      }
    },
    comment: '最低预算金额'
  },
  max_amount: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: '最高预算金额不能为负数'
      },
      max: {
        args: [999999.99],
        msg: '最高预算金额不能超过999999.99'
      },
      isGreaterThanMin(value) {
        if (value < this.min_amount) {
          throw new Error('最高预算金额必须大于等于最低预算金额');
        }
      }
    },
    comment: '最高预算金额'
  },
  recommended_amount: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: '推荐预算金额不能为负数'
      },
      max: {
        args: [999999.99],
        msg: '推荐预算金额不能超过999999.99'
      },
      isBetweenMinMax(value) {
        if (value !== null && value !== undefined) {
          if (value < this.min_amount || value > this.max_amount) {
            throw new Error('推荐预算金额必须在最低和最高预算金额之间');
          }
        }
      }
    },
    comment: '推荐预算金额'
  },
  unit: {
    type: DataTypes.ENUM('元/人', '元/天', '元/次', '元/公里', '元/小时', '元'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['元/人', '元/天', '元/次', '元/公里', '元/小时', '元']],
        msg: '计费单位必须是有效的单位'
      }
    },
    comment: '计费单位'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: '费用说明不能超过2000字符'
      }
    },
    comment: '费用说明'
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: '省钱小贴士不能超过2000字符'
      }
    },
    comment: '省钱小贴士'
  },
  season_factor: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 1.00,
    validate: {
      min: {
        args: [0.1],
        msg: '季节调整系数不能小于0.1'
      },
      max: {
        args: [5.0],
        msg: '季节调整系数不能大于5.0'
      }
    },
    comment: '季节调整系数'
  },
  is_essential: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否必需'
  }
}, {
  tableName: 'budget_reference',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '预算参考表',
  indexes: [
    {
      name: 'idx_category',
      fields: ['category']
    },
    {
      name: 'idx_is_essential',
      fields: ['is_essential']
    },
    {
      name: 'idx_recommended_amount',
      fields: ['recommended_amount']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// 添加实例方法
BudgetReference.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

export default BudgetReference;
