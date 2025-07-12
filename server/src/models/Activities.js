import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// 活动规划模型
const Activities = sequelize.define('Activities', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活动标题不能为空'
      },
      len: {
        args: [1, 200],
        msg: '活动标题长度必须在1-200字符之间'
      }
    },
    comment: '活动标题'
  },
  category: {
    type: DataTypes.ENUM('景点游览', '美食体验', '文化活动', '休闲娱乐', '购物', '交通', '住宿', '其他'),
    allowNull: false,
    defaultValue: '其他',
    validate: {
      isIn: {
        args: [['景点游览', '美食体验', '文化活动', '休闲娱乐', '购物', '交通', '住宿', '其他']],
        msg: '活动分类必须是有效的分类'
      }
    },
    comment: '活动分类'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: '活动描述不能超过2000字符'
      }
    },
    comment: '活动描述'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: {
        args: [0, 200],
        msg: '活动地点不能超过200字符'
      }
    },
    comment: '活动地点'
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: '预估费用不能为负数'
      },
      max: {
        args: [999999.99],
        msg: '预估费用不能超过999999.99'
      }
    },
    comment: '预估费用'
  },
  estimated_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: '预估时长必须大于0分钟'
      },
      isInt: {
        msg: '预估时长必须是整数'
      }
    },
    comment: '预估时长（分钟）'
  },
  priority: {
    type: DataTypes.ENUM('必去', '推荐', '可选'),
    allowNull: false,
    defaultValue: '可选',
    validate: {
      isIn: {
        args: [['必去', '推荐', '可选']],
        msg: '优先级必须是必去、推荐、可选之一'
      }
    },
    comment: '优先级'
  },
  season_suitable: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: '适宜季节不能超过100字符'
      }
    },
    comment: '适宜季节'
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: '活动提示不能超过2000字符'
      }
    },
    comment: '活动提示'
  },
  contact_info: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: {
        args: [0, 200],
        msg: '联系方式不能超过200字符'
      }
    },
    comment: '联系方式'
  },
  opening_hours: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: '开放时间不能超过100字符'
      }
    },
    comment: '开放时间'
  }
}, {
  tableName: 'travel_activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '活动规划表',
  indexes: [
    {
      name: 'idx_category',
      fields: ['category']
    },
    {
      name: 'idx_priority',
      fields: ['priority']
    },
    {
      name: 'idx_estimated_cost',
      fields: ['estimated_cost']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// 添加实例方法
Activities.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

export default Activities;
