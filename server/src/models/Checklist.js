import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// 出行清单模型
const Checklist = sequelize.define('Checklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  item_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '清单项目名称不能为空'
      },
      len: {
        args: [1, 200],
        msg: '清单项目名称长度必须在1-200字符之间'
      }
    },
    comment: '清单项目名称'
  },
  category: {
    type: DataTypes.ENUM('证件类', '衣物类', '电子设备', '洗护用品',  '日常用品', '财务类', '医疗用品', '食物类'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['证件类', '衣物类', '电子设备', '洗护用品',  '日常用品', '财务类', '医疗用品', '食物类']],
        msg: '清单项目分类必须是有效的分类'
      }
    },
    comment: '清单项目分类'
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否已完成'
  },
  priority: {
    type: DataTypes.ENUM('高', '中', '低'),
    allowNull: false,
    defaultValue: '中',
    validate: {
      isIn: {
        args: [['高', '中', '低']],
        msg: '优先级必须是高、中、低之一'
      }
    },
    comment: '优先级'
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
  }
}, {
  tableName: 'travel_checklist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '出行清单表',
  indexes: [
    {
      name: 'idx_category',
      fields: ['category']
    },
    {
      name: 'idx_is_completed',
      fields: ['is_completed']
    },
    {
      name: 'idx_priority',
      fields: ['priority']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// 添加实例方法
Checklist.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

export default Checklist;
