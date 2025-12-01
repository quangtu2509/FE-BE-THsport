require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Import models
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

// Hàm tạo slug từ tên
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ, số, space, dấu gạch ngang
    .trim()
    .replace(/\s+/g, '-') // Thay space bằng dấu gạch ngang
    .replace(/-+/g, '-'); // Xóa dấu gạch ngang thừa
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webdemo-thsport';

// Kết nối MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    importProducts();
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function importProducts() {
  const products = [];
  const csvFilePath = path.join(__dirname, 'neymar_50_products_with_images.csv');

  // Kiểm tra file có tồn tại không
  if (!fs.existsSync(csvFilePath)) {
    console.error('✗ File CSV không tồn tại:', csvFilePath);
    console.log('Vui lòng copy file "neymar_50_products_with_images.csv" vào folder data-import/');
    process.exit(1);
  }

  // Tạo hoặc lấy category mặc định
  console.log('Đang kiểm tra category mặc định...');
  let defaultCategory = await Category.findOne({ name: 'Chưa phân loại' });
  if (!defaultCategory) {
    defaultCategory = await Category.create({
      name: 'Chưa phân loại',
      slug: 'chua-phan-loai',
      description: 'Sản phẩm chưa được phân loại'
    });
    console.log('✓ Đã tạo category mặc định');
  } else {
    console.log('✓ Đã có category mặc định');
  }

  console.log('Đang đọc file CSV...');

  // Đọc file CSV
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Chuyển đổi dữ liệu từ CSV sang format Product model
      const productName = row.name || row.Name || row['Product Name'] || 'Sản phẩm';
      const product = {
        name: productName,
        slug: createSlug(productName) + '-' + Date.now() + Math.floor(Math.random() * 1000), // Thêm timestamp để tránh trùng
        price: parseFloat(row.price || row.Price || 0),
        description: row.description || row.Description || '',
        // Bỏ qua image, sẽ thêm sau
        // images: [],
        category: defaultCategory._id, // Dùng category mặc định
        brand: null, // Sẽ set sau nếu cần
        stock: parseInt(row.stock || row.Stock || 100),
        availableSizes: row.sizes ? row.sizes.split(',').map(s => s.trim()) : ['39', '40', '41', '42', '43'],
        isXakho: false,
      };

      products.push(product);
    })
    .on('end', async () => {
      console.log(`✓ Đọc xong ${products.length} sản phẩm từ CSV`);
      
      try {
        // Xóa sản phẩm cũ (tùy chọn - comment dòng này nếu muốn giữ sản phẩm cũ)
        // await Product.deleteMany({});
        // console.log('✓ Đã xóa sản phẩm cũ');

        // Insert sản phẩm mới
        const result = await Product.insertMany(products);
        console.log(`✓ Đã thêm ${result.length} sản phẩm vào database`);
        
        // Hiển thị một vài sản phẩm mẫu
        console.log('\nMột số sản phẩm đã thêm:');
        result.slice(0, 5).forEach(p => {
          console.log(`  - ${p.name}: ${p.price.toLocaleString('vi-VN')} đ`);
        });

        process.exit(0);
      } catch (error) {
        console.error('✗ Lỗi khi import:', error);
        process.exit(1);
      }
    })
    .on('error', (error) => {
      console.error('✗ Lỗi khi đọc CSV:', error);
      process.exit(1);
    });
}
