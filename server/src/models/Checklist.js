import mongoose from 'mongoose';

// 出行清单 Schema
const checklistSchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: [true, '清单项目名称不能为空'],
    trim: true,
    maxlength: [200, '清单项目名称长度不能超过200字符'],
    minlength: [1, '清单项目名称不能为空']
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['证件类', '衣物类', '电子设备', '洗护用品', '药品类', '其他'],
      message: '清单项目分类必须是有效的分类'
    },
    default: '其他'
  },
  is_completed: {
    type: Boolean,
    required: true,
    default: false
  },
  priority: {
    type: String,
    required: true,
    enum: {
      values: ['高', '中', '低'],
      message: '优先级必须是高、中、低之一'
    },
    default: '中'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, '备注信息不能超过1000字符']
  }
}, {
  timestamps: true,
  collection: 'travel_checklist',
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
checklistSchema.index({ category: 1 });
checklistSchema.index({ is_completed: 1 });
checklistSchema.index({ priority: 1 });
checklistSchema.index({ createdAt: -1 });

// 创建模型
export const Checklist = mongoose.model('Checklist', checklistSchema);

export default Checklist;
