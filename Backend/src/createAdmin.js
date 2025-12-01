// Script tạo tài khoản admin mới
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/webdemo-thsport';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const email = 'admin2@example.com';
  const username = 'adminuser2';
  const password = 'admin123';
  const name = 'Admin User 2';
  const phone = '0123456789';
  const address = 'Hanoi';

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminUser = new User({
    email,
    username,
    password: hashedPassword,
    name,
    phone,
    address,
    role: 'admin'
  });
  await adminUser.save();
  console.log('Admin user created:', adminUser);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
