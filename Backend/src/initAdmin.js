// Script tạo tài khoản admin
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webdemo';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const email = 'admin@example.com';
  const username = 'admin';
  const password = 'admin123';
  const name = 'Admin User';
  const phone = '0123456789';
  const address = 'Hanoi';

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }

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

async function deleteAdmin() {
  await mongoose.connect(MONGO_URI);
  const result = await User.deleteOne({ email: 'admin@example.com' });
  console.log('Deleted:', result);
  process.exit(0);
}

deleteAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
