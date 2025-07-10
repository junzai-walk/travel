import mongoose from 'mongoose';

// 活动规划 Schema
const activitiesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '活动标题不能为空'],
    trim: true,
    maxlength: [200, '活动标题长度不能超过200字符'],
    minlength: [1, '活动标题不能为空']
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['景点游览', '美食体验', '文化活动', '休闲娱乐', '购物', '交通', '住宿', '其他'],
      message: '活动分类必须是有效的分类'
    },
    default: '其他'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, '活动描述不能超过2000字符']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, '活动地点不能超过200字符']
  },
  estimated_cost: {
    type: Number,
    min: [0, '预估费用不能为负数'],
    max: [999999.99, '预估费用不能超过999999.99'],
    validate: {
      validator: function(value) {
        if (value === null || value === undefined) return true;
        // 验证小数点后最多2位
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: '预估费用最多保留2位小数'
    }
  },
  estimated_duration: {
    type: Number,
    min: [1, '预估时长必须大于0分钟'],
    validate: {
      validator: function(value) {
        if (value === null || value === undefined) return true;
        return Number.isInteger(value);
      },
      message: '预估时长必须是整数'
    }
  },
  priority: {
    type: String,
    required: true,
    enum: {
      values: ['必去', '推荐', '可选'],
      message: '优先级必须是必去、推荐、可选之一'
    },
    default: '推荐'
  },
  season_suitable: {
    type: String,
    trim: true,
    maxlength: [100, '适宜季节不能超过100字符']
  },
  tips: {
    type: String,
    trim: true,
    maxlength: [2000, '活动提示不能超过2000字符']
  },
  contact_info: {
    type: String,
    trim: true,
    maxlength: [200, '联系方式不能超过200字符']
  },
  opening_hours: {
    type: String,
    trim: true,
    maxlength: [100, '开放时间不能超过100字符']
  }
}, {
  timestamps: true,
  collection: 'travel_activities',
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

// 创建索引
activitiesSchema.index({ category: 1 });
activitiesSchema.index({ priority: 1 });
activitiesSchema.index({ estimated_cost: 1 });
activitiesSchema.index({ createdAt: -1 });
activitiesSchema.index({ title: 'text', description: 'text', location: 'text' }); // 文本搜索索引

// 创建模型
export const Activities = mongoose.model('Activities', activitiesSchema);

export default Activities;
