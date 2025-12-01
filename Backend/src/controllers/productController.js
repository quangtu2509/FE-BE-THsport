const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, brand, category, description, price, images, variants, isXakho } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, category là bắt buộc' });
    }

    // Tự động chuyển tên brand/category sang ObjectId nếu truyền vào là string
    let brandId = brand;
    let categoryId = category;
    const mongoose = require('mongoose');
    if (brandId && typeof brandId === 'string' && !brandId.match(/^[0-9a-fA-F]{24}$/)) {
      const Brand = require('../models/Brand');
      const brandDoc = await Brand.findOne({ name: brandId });
      if (brandDoc) brandId = brandDoc._id;
    }
    if (categoryId && typeof categoryId === 'string' && !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      const Category = require('../models/Category');
      const categoryDoc = await Category.findOne({ name: categoryId });
      if (categoryDoc) categoryId = categoryDoc._id;
    }

    const product = new Product({ 
      name, 
      brand: brandId, 
      category: categoryId, 
      description, 
      price, 
      images: images || [], 
      variants: variants || [], 
      isXakho: isXakho || false 
    });
    await product.save();
    await product.populate('brand category');
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      brand, 
      minPrice, 
      maxPrice,
      search, 
      sort = '-createdAt' 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (brand) {
      filter.brand = brand;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Text search by name, description, or SKU
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch products
    const products = await Product.find(filter)
      .populate('brand category')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({ 
      products, 
      pagination: { 
        currentPage: Number(page), 
        totalPages, 
        total, 
        limit: Number(limit) 
      } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand category');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('brand category');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    
    const product = await Product.findOneAndUpdate(
      query,
      { ...req.body, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    ).populate('brand category');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    
    const product = await Product.findOneAndDelete(query);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id: product._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getXakhoProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find({ isXakho: true })
      .populate('brand category')
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments({ isXakho: true });
    const totalPages = Math.ceil(total / limit);

    res.json({ 
      products, 
      pagination: { 
        currentPage: Number(page), 
        totalPages, 
        total, 
        limit: Number(limit) 
      } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
