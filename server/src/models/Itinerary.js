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
      isValidDate(value) {
        const inputDate = new Date(value);
        const minDate = new Date('1900-01-01');
        const maxDate = new Date('2100-12-31');

        if (inputDate < minDate || inputDate > maxDate) {
          throw new Error('请输入有效的日期范围(1900-2100年)');
        }

        // 对于过去的日期，只记录警告，不阻止创建（允许历史数据）
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate < today) {
          console.warn(`警告：创建了过去日期的行程: ${value}`);
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
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '📍',
    validate: {
      len: {
        args: [0, 50],
        msg: '图标标识不能超过50字符'
      }
    },
    comment: '活动图标（支持emoji或React图标key）'
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
    try {
      // 检查是否已经是Date对象
      if (values.date instanceof Date) {
        // 确保Date对象是有效的
        if (!isNaN(values.date.getTime())) {
          values.date = values.date.toISOString().split('T')[0];
        } else {
          console.warn('Itinerary toJSON: 无效的Date对象:', values.date);
          values.date = new Date().toISOString().split('T')[0]; // 使用当前日期作为默认值
        }
      } else if (typeof values.date === 'string') {
        // 如果是字符串，检查是否已经是YYYY-MM-DD格式
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(values.date)) {
          // 已经是正确格式，保持不变
          // 但验证一下是否是有效日期
          const testDate = new Date(values.date);
          if (isNaN(testDate.getTime())) {
            console.warn('Itinerary toJSON: 无效的日期字符串:', values.date);
            values.date = new Date().toISOString().split('T')[0];
          }
        } else {
          // 尝试解析为Date对象再格式化
          const dateObj = new Date(values.date);
          if (!isNaN(dateObj.getTime())) {
            values.date = dateObj.toISOString().split('T')[0];
          } else {
            console.warn('Itinerary toJSON: 无法解析的日期字符串:', values.date);
            values.date = new Date().toISOString().split('T')[0];
          }
        }
      } else {
        // 其他类型，尝试转换为Date
        console.warn('Itinerary toJSON: 意外的日期类型:', typeof values.date, values.date);
        const dateObj = new Date(values.date);
        if (!isNaN(dateObj.getTime())) {
          values.date = dateObj.toISOString().split('T')[0];
        } else {
          values.date = new Date().toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('Itinerary toJSON: 日期格式转换失败:', values.date, error);
      values.date = new Date().toISOString().split('T')[0]; // 使用当前日期作为默认值
    }
  }

  return values;
};

export default Itinerary;
