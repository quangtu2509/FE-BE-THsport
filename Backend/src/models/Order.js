const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  image: String,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cod' }, // cod: cash on delivery
  shippingAddress: String,
  notes: String,
  status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model('Order', orderSchema);
