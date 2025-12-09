const Product = require('../models/Product');
const ResponseHelper = require('../helpers/response.helper');

exports.createProduct = async (req, res) => {
  try {
    const { name, brand, category, description, price, images, variants, isXakho } = req.body;
    if (!name || !price || !category) {
      return ResponseHelper.error(res, 'Name, price, category are required', 400);
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
    return ResponseHelper.success(res, product, 'Product created successfully', 201);
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
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
    
    // Support brand filter by ID or slug (có thể là mảng)
    if (brand) {
      const mongoose = require('mongoose');
      const Brand = require('../models/Brand');
      
      // Convert brand to array nếu là string
      const brandArray = Array.isArray(brand) ? brand : [brand];
      
      // Lookup brand IDs
      const brandIds = [];
      for (const b of brandArray) {
        if (mongoose.Types.ObjectId.isValid(b)) {
          brandIds.push(b);
        } else {
          const brandDoc = await Brand.findOne({ slug: b });
          if (brandDoc) {
            brandIds.push(brandDoc._id);
          }
        }
      }
      
      if (brandIds.length > 0) {
        filter.brand = { $in: brandIds };
      }
      // Note: Nếu brand không tìm thấy, chỉ skip brand filter, không return empty
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Text search by name, description (sử dụng text index)
    if (search) {
      // Ưu tiên text search nếu có text index
      filter.$text = { $search: search };
    }
    
    // Fetch products with lean() để tối ưu memory
    let query = Product.find(filter)
      .populate('brand category')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Return plain JS objects, not Mongoose docs
    
    // Select only needed fields để giảm dung lượng data (QUAN TRỌNG: Thêm stock và sold)
    const products = await query.select('name slug price originalPrice images category brand rating reviews stock sold isXakho');

    // Get total count for pagination (optimize với countDocuments)
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return ResponseHelper.paginated(res, products, {
      currentPage: Number(page),
      totalPages,
      total,
      limit: Number(limit)
    }, 'Products retrieved successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand category');
    if (!product) {
      return ResponseHelper.error(res, 'Product not found', 404);
    }
    return ResponseHelper.success(res, product, 'Product retrieved successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('brand category');
    if (!product) {
      return ResponseHelper.error(res, 'Product not found', 404);
    }
    return ResponseHelper.success(res, product, 'Product retrieved successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
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
      return ResponseHelper.error(res, 'Product not found', 404);
    }
    return ResponseHelper.success(res, product, 'Product updated successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
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
      return ResponseHelper.error(res, 'Product not found', 404);
    }
    return ResponseHelper.success(res, { id: product._id }, 'Product deleted successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
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

    return ResponseHelper.paginated(res, products, {
      currentPage: Number(page),
      totalPages,
      total,
      limit: Number(limit)
    }, 'Clearance products retrieved successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
  }
};

// Advanced search with fuzzy matching using MongoDB text index
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12, category, brand, minPrice, maxPrice } = req.query;
    
    if (!q || q.trim().length < 1) {
      return ResponseHelper.error(res, 'Search query must be at least 1 character', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const searchTerm = q.trim();
    
    // Build filter - use regex for better MongoDB integration
    const filter = {};

    // Use case-insensitive regex for name, description, sku
    if (searchTerm) {
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex }
      ];
    }

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // If brand is provided
    if (brand) {
      const mongoose = require('mongoose');
      const Brand = require('../models/Brand');
      const brandArray = Array.isArray(brand) ? brand : [brand];
      
      const brandIds = [];
      for (const b of brandArray) {
        if (mongoose.Types.ObjectId.isValid(b)) {
          brandIds.push(b);
        } else {
          const brandDoc = await Brand.findOne({ slug: b });
          if (brandDoc) brandIds.push(brandDoc._id);
        }
      }
      
      if (brandIds.length > 0) {
        filter.brand = { $in: brandIds };
      }
    }

    // Execute search with MongoDB
    const products = await Product.find(filter)
      .populate('brand category')
      .skip(skip)
      .limit(Number(limit))
      .select('name slug price originalPrice images category brand rating reviews stock sold isXakho')
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return ResponseHelper.paginated(res, products, {
      currentPage: Number(page),
      totalPages,
      total,
      limit: Number(limit),
      query: searchTerm
    }, 'Search results retrieved successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
  }
};

// Autocomplete search - suggestions for real-time search
exports.autocomplete = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return ResponseHelper.success(res, [], 'No suggestions found');
    }

    const searchTerm = q.trim();
    
    // Find products starting with the search term (highest priority)
    const products = await Product.find({
      name: { $regex: '^' + searchTerm, $options: 'i' } // Case-insensitive, starts with
    })
      .select('name slug')
      .limit(10)
      .lean();

    // If not enough results, find products containing the search term
    if (products.length < 5) {
      const additionalProducts = await Product.find({
        name: { $regex: searchTerm, $options: 'i' }
      })
        .select('name slug')
        .limit(10 - products.length)
        .lean();
      
      products.push(...additionalProducts);
    }

    return ResponseHelper.success(res, products, 'Suggestions retrieved successfully');
  } catch (err) {
    return ResponseHelper.error(res, err.message, 400);
  }
};
