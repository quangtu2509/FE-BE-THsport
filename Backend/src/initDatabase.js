const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Inventory = require('./models/Inventory');
const News = require('./models/News');
const Promotion = require('./models/Promotion');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webdemo-thsport';

async function createCollections() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // Tạo collection bằng cách gọi createCollection
  const models = [User, Product, Category, Brand, Cart, Order, Inventory, News, Promotion];
  for (const Model of models) {
    await Model.createCollection();
  }
  console.log('All collections created (if not exist)');
  await mongoose.disconnect();
}

createCollections().catch(console.error);
