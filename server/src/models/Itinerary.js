import mongoose from 'mongoose';

// 行程安排 Schema
const itinerarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, '行程日期不能为空'],
    validate: {
      validator: function(value) {
        // 允许今天及以后的日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value >= today;
      },
      message: '行程日期不能早于今天'
    }
  },
  time: {
    type: String,
    required: [true, '行程时间不能为空'],
    validate: {
      validator: function(value) {
        // 验证时间格式 HH:MM
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
      },
      message: '请输入有效的时间格式(HH:MM)'
    }
  },
  activity: {
    type: String,
    required: [true, '活动内容不能为空'],
    trim: true,
    maxlength: [300, '活动内容长度不能超过300字符'],
    minlength: [1, '活动内容不能为空']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, '详细描述不能超过2000字符']
  },
  tips: {
    type: String,
    trim: true,
    maxlength: [2000, '贴心提示不能超过2000字符']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, '地点位置不能超过200字符']
  },
  duration: {
    type: Number,
    min: [1, '预计时长必须大于0分钟'],
    validate: {
      validator: Number.isInteger,
      message: '预计时长必须是整数'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['计划中', '进行中', '已完成', '已取消'],
      message: '行程状态必须是有效的状态'
    },
    default: '计划中'
  }
}, {
  timestamps: true,
  collection: 'travel_itinerary',
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
itinerarySchema.index({ date: 1 });
itinerarySchema.index({ status: 1 });
itinerarySchema.index({ date: 1, time: 1 });
itinerarySchema.index({ createdAt: -1 });

// 创建模型
export const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;
