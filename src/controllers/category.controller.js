const Category = require('../models/category.model');
const Card = require('../models/card.model');
const SentCard = require('../models/sentCard.model');
const { createError } = require('../utils/error.util');

/**
 * @desc    创建分类
 * @route   POST /api/categories
 * @access  Private
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId, order } = req.body;

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ 
      userId: req.user.id,
      name,
      parentId: parentId || null
    });

    if (existingCategory) {
      return next(createError(400, '同一级别下已存在相同名称的分类'));
    }

    // 如果有父分类，检查父分类是否存在
    if (parentId) {
      const parentCategory = await Category.findOne({ 
        _id: parentId,
        userId: req.user.id
      });

      if (!parentCategory) {
        return next(createError(404, '父分类不存在'));
      }
    }

    // 创建分类
    const category = new Category({
      userId: req.user.id,
      name,
      description,
      parentId: parentId || null,
      order: order || 0
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取分类列表
 * @route   GET /api/categories
 * @access  Private
 */
exports.getCategories = async (req, res, next) => {
  try {
    const { parentId, flat } = req.query;
    
    // 构建查询条件
    const query = { userId: req.user.id };
    
    if (parentId === 'null' || parentId === 'root') {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    // 排序
    const sort = { order: 1, name: 1 };

    // 执行查询
    let categories = await Category.find(query).sort(sort);

    // 如果需要扁平结构，直接返回
    if (flat === 'true') {
      return res.status(200).json({
        success: true,
        data: categories
      });
    }

    // 如果没有指定parentId，构建树形结构
    if (!parentId) {
      const rootCategories = categories.filter(c => !c.parentId);
      const childCategories = categories.filter(c => c.parentId);
      
      // 构建树形结构
      const buildTree = (roots) => {
        return roots.map(root => {
          const children = childCategories.filter(c => c.parentId.toString() === root._id.toString());
          return {
            ...root.toObject(),
            children: children.length > 0 ? buildTree(children) : []
          };
        });
      };
      
      categories = buildTree(rootCategories);
    }

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取分类详情
 * @route   GET /api/categories/:id
 * @access  Private
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    更新分类
 * @route   PUT /api/categories/:id
 * @access  Private
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, order, isActive } = req.body;

    // 查找分类
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    // 如果更改了名称，检查是否与同级别的其他分类重名
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        userId: req.user.id,
        name,
        parentId: category.parentId,
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return next(createError(400, '同一级别下已存在相同名称的分类'));
      }
    }

    // 更新分类
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    删除分类
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    // 查找分类
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    // 检查是否有子分类
    const childCategories = await Category.find({
      parentId: category._id
    });

    if (childCategories.length > 0) {
      return next(createError(400, '无法删除含有子分类的分类，请先删除所有子分类'));
    }

    // 检查是否有关联的卡片
    const cards = await Card.find({
      categories: category._id
    });

    const sentCards = await SentCard.find({
      categories: category._id
    });

    if (cards.length > 0 || sentCards.length > 0) {
      return next(createError(400, '无法删除已被卡片使用的分类'));
    }

    // 删除分类
    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {
        message: '分类已删除'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取分类路径
 * @route   GET /api/categories/:id/path
 * @access  Private
 */
exports.getCategoryPath = async (req, res, next) => {
  try {
    // 查找分类
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    // 获取路径
    const path = await category.getPath();

    res.status(200).json({
      success: true,
      data: path
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取子分类
 * @route   GET /api/categories/:id/children
 * @access  Private
 */
exports.getCategoryChildren = async (req, res, next) => {
  try {
    // 查找分类
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    // 获取子分类
    const children = await category.getChildren();

    res.status(200).json({
      success: true,
      data: children
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    获取所有后代分类
 * @route   GET /api/categories/:id/descendants
 * @access  Private
 */
exports.getCategoryDescendants = async (req, res, next) => {
  try {
    // 查找分类
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    // 获取所有后代分类
    const descendants = await category.getDescendants();

    res.status(200).json({
      success: true,
      data: descendants
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    移动分类
 * @route   POST /api/categories/:id/move
 * @access  Private
 */
exports.moveCategory = async (req, res, next) => {
  try {
    const { parentId } = req.body;

    // 查找分类
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return next(createError(404, '分类不存在'));
    }

    // 如果有父分类，检查父分类是否存在
    if (parentId) {
      // 检查是否将分类移动到自己的子分类下
      if (parentId === category._id.toString()) {
        return next(createError(400, '无法将分类移动到自身下'));
      }

      const parentCategory = await Category.findOne({ 
        _id: parentId,
        userId: req.user.id
      });

      if (!parentCategory) {
        return next(createError(404, '父分类不存在'));
      }

      // 检查是否将分类移动到自己的后代分类下
      const descendants = await category.getDescendants();
      const isDescendant = descendants.some(d => d._id.toString() === parentId);
      
      if (isDescendant) {
        return next(createError(400, '无法将分类移动到其后代分类下'));
      }
    }

    // 检查是否与同级别的其他分类重名
    const existingCategory = await Category.findOne({ 
      userId: req.user.id,
      name: category.name,
      parentId: parentId || null,
      _id: { $ne: category._id }
    });

    if (existingCategory) {
      return next(createError(400, '目标位置已存在相同名称的分类'));
    }

    // 更新分类
    category.parentId = parentId || null;
    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

