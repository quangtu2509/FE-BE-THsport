const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }
});

userSchema.index({ email: 1, username: 1 });

module.exports = mongoose.model('User', userSchema);
