const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String
});

brandSchema.index({ slug: 1 });

module.exports = mongoose.model('Brand', brandSchema);
