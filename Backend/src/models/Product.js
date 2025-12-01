const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  images: [String],
  variants: [variantSchema],
  availableSizes: [String],
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  isXakho: { type: Boolean, default: false }
});

productSchema.index({ slug: 1, category: 1, brand: 1, isXakho: 1 });

module.exports = mongoose.model('Product', productSchema);
