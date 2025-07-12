import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// 行程安排模型
const Itinerary = sequelize.define('Itinerary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '行程日期不能为空'
      },
      isDate: {
        msg: '请输入有效的日期格式'
      },
      isAfterToday(value) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) < today) {
          throw new Error('行程日期不能早于今天');
        }
      }
    },
    comment: '行程日期'
  },
  time: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '行程时间不能为空'
      },
      is: {
        args: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        msg: '请输入有效的时间格式(HH:MM)'
      }
    },
    comment: '行程时间'
  },
  activity: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活动内容不能为空'
      },
      len: {
        args: [1, 300],
        msg: '活动内容长度必须在1-300字符之间'
      }
    },
    comment: '活动内容'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: '详细描述不能超过2000字符'
      }
    },
    comment: '详细描述'
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: '贴心提示不能超过2000字符'
      }
    },
    comment: '贴心提示'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: {
        args: [0, 200],
        msg: '地点位置不能超过200字符'
      }
    },
    comment: '地点位置'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: '预计时长必须大于0分钟'
      },
      isInt: {
        msg: '预计时长必须是整数'
      }
    },
    comment: '预计时长（分钟）'
  },
  status: {
    type: DataTypes.ENUM('计划中', '进行中', '已完成', '已取消'),
    allowNull: false,
    defaultValue: '计划中',
    validate: {
      isIn: {
        args: [['计划中', '进行中', '已完成', '已取消']],
        msg: '行程状态必须是有效的状态'
      }
    },
    comment: '行程状态'
  }
}, {
  tableName: 'travel_itinerary',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '行程安排表',
  indexes: [
    {
      name: 'idx_date',
      fields: ['date']
    },
    {
      name: 'idx_status',
      fields: ['status']
    },
    {
      name: 'idx_date_time',
      fields: ['date', 'time']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// 添加实例方法
Itinerary.prototype.toJSON = function() {
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

export default Itinerary;
