const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 创建索引
CategorySchema.index({ userId: 1, name: 1 });
CategorySchema.index({ parentId: 1 });

// 在保存前计算level
CategorySchema.pre('save', async function(next) {
  if (this.parentId) {
    try {
      const parent = await this.constructor.findById(this.parentId);
      if (parent) {
        this.level = parent.level + 1;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// 获取完整路径
CategorySchema.methods.getPath = async function() {
  const path = [this];
  let currentCategory = this;
  
  while (currentCategory.parentId) {
    const parent = await this.constructor.findById(currentCategory.parentId);
    if (!parent) break;
    
    path.unshift(parent);
    currentCategory = parent;
  }
  
  return path;
};

// 获取所有子分类
CategorySchema.methods.getChildren = async function() {
  return await this.constructor.find({ parentId: this._id });
};

// 获取所有后代分类
CategorySchema.methods.getDescendants = async function() {
  const descendants = [];
  const children = await this.getChildren();
  
  descendants.push(...children);
  
  for (const child of children) {
    const childDescendants = await child.getDescendants();
    descendants.push(...childDescendants);
  }
  
  return descendants;
};

module.exports = mongoose.model('Category', CategorySchema);

