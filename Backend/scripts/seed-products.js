// Script to seed sample products for TH Sport
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../app/models/Product');
const Category = require('../app/models/Category');
const Brand = require('../app/models/Brand');

// Sample products data
const sampleProducts = [
  {
    name: 'Giày đá bóng Nike Mercurial Vapor 15',
    brand: 'Nike',
    category: 'Giày bóng đá',
    description: 'Giày đá bóng Nike Mercurial Vapor 15 Elite FG với thiết kế tốc độ, trọng lượng siêu nhẹ',
    originalPrice: 5500000,
    price: 4990000,
    images: [
      'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4a64d5b3-8b6d-4c6f-9c0f-2b8c0f2e2f3d/mercurial-vapor-15-elite-fg-football-boots.png'
    ],
    availableSizes: ['39', '40', '41', '42', '43', '44'],
    availableColors: ['Đỏ', 'Xanh dương'],
    stock: 100,
    gender: 'nam',
    material: 'Da tổng hợp cao cấp',
    sole: 'Cao su FG',
    isFeatured: true,
    isNewArrival: true
  },
  {
    name: 'Giày đá bóng Adidas Predator Edge',
    brand: 'Adidas',
    category: 'Giày bóng đá',
    description: 'Giày Adidas Predator Edge với công nghệ PRIMEKNIT giúp kiểm soát bóng tốt hơn',
    originalPrice: 4800000,
    price: 4290000,
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/5b9d1b8c6e5a4d4b8f8b0b3a8c8e8b8d/predator-edge.png'
    ],
    availableSizes: ['39', '40', '41', '42', '43'],
    availableColors: ['Đen', 'Trắng'],
    stock: 80,
    gender: 'nam',
    material: 'PRIMEKNIT',
    sole: 'Cao su AG',
    isFeatured: true
  },
  {
    name: 'Giày chạy bộ Nike Air Zoom Pegasus 40',
    brand: 'Nike',
    category: 'Giày chạy bộ',
    description: 'Giày chạy bộ Nike Air Zoom Pegasus 40 với đệm khí Zoom Air cho cảm giác êm ái',
    originalPrice: 3500000,
    price: 2990000,
    images: [
      'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-zoom-pegasus-40-running-shoes.png'
    ],
    availableSizes: ['38', '39', '40', '41', '42', '43'],
    availableColors: ['Đen', 'Xám', 'Trắng'],
    stock: 120,
    gender: 'unisex',
    material: 'Vải mesh thoáng khí',
    sole: 'React foam + Zoom Air',
    isNewArrival: true
  },
  {
    name: 'Giày training Adidas Ultraboost 23',
    brand: 'Adidas',
    category: 'Giày training',
    description: 'Giày training Adidas Ultraboost 23 với đệm Boost cung cấp năng lượng tối đa',
    originalPrice: 4200000,
    price: 3690000,
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/5f8a1b7c6d5a4c3b7f7b0a3a7c7d7a7c/ultraboost-23.png'
    ],
    availableSizes: ['39', '40', '41', '42', '43', '44'],
    availableColors: ['Đen', 'Xanh navy'],
    stock: 90,
    gender: 'nam',
    material: 'Primeknit+',
    sole: 'Boost',
    isFeatured: true
  },
  {
    name: 'Giày bóng rổ Nike LeBron 21',
    brand: 'Nike',
    category: 'Giày bóng rổ',
    description: 'Giày bóng rổ Nike LeBron 21 thiết kế cho sức mạnh và tốc độ',
    originalPrice: 5200000,
    price: 4690000,
    images: [
      'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p/lebron-21-basketball-shoes.png'
    ],
    availableSizes: ['40', '41', '42', '43', '44', '45'],
    availableColors: ['Đen', 'Tím', 'Vàng'],
    stock: 60,
    gender: 'nam',
    material: 'Da tổng hợp + Vải',
    sole: 'Phylon + Zoom Air',
    isFeatured: true
  },
  {
    name: 'Giày tennis Adidas Barricade',
    brand: 'Adidas',
    category: 'Giày tennis',
    description: 'Giày tennis Adidas Barricade với độ bền cao và độ bám sân tốt',
    originalPrice: 3200000,
    price: 2790000,
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/barricade-tennis.png'
    ],
    availableSizes: ['39', '40', '41', '42', '43'],
    availableColors: ['Trắng', 'Xanh'],
    stock: 70,
    gender: 'unisex',
    material: 'Da tổng hợp',
    sole: 'Adiwear'
  },
  {
    name: 'Giày đá bóng Mizuno Morelia Neo IV',
    brand: 'Mizuno',
    category: 'Giày bóng đá',
    description: 'Giày Mizuno Morelia Neo IV với da kangaroo cao cấp',
    originalPrice: 4500000,
    price: 3990000,
    images: [
      'https://via.placeholder.com/800x600/FF0000/FFFFFF?text=Mizuno+Morelia'
    ],
    availableSizes: ['39', '40', '41', '42', '43'],
    availableColors: ['Đen', 'Trắng'],
    stock: 50,
    gender: 'nam',
    material: 'Da kangaroo',
    sole: 'Cao su FG',
    isNewArrival: true
  },
  {
    name: 'Giày futsal Puma Future Z',
    brand: 'Puma',
    category: 'Giày futsal',
    description: 'Giày futsal Puma Future Z với công nghệ FUZIONFIT',
    originalPrice: 2800000,
    price: 2490000,
    images: [
      'https://via.placeholder.com/800x600/000000/FFFFFF?text=Puma+Future+Z'
    ],
    availableSizes: ['38', '39', '40', '41', '42', '43'],
    availableColors: ['Vàng', 'Đen'],
    stock: 85,
    gender: 'nam',
    material: 'FUZIONFIT',
    sole: 'Cao su IC'
  },
  {
    name: 'Giày bóng đá nữ Nike Phantom',
    brand: 'Nike',
    category: 'Giày bóng đá nữ',
    description: 'Giày bóng đá Nike Phantom thiết kế dành riêng cho nữ',
    originalPrice: 3800000,
    price: 3290000,
    images: [
      'https://via.placeholder.com/800x600/FF69B4/FFFFFF?text=Nike+Phantom+Nữ'
    ],
    availableSizes: ['36', '37', '38', '39', '40'],
    availableColors: ['Hồng', 'Trắng'],
    stock: 60,
    gender: 'nu',
    material: 'Flyknit',
    sole: 'Cao su FG',
    isNewArrival: true
  },
  {
    name: 'Giày xả kho Adidas Copa Mundial',
    brand: 'Adidas',
    category: 'Giày bóng đá',
    description: 'Giày Adidas Copa Mundial cổ điển - Hàng xả kho giá tốt',
    originalPrice: 3500000,
    price: 1990000,
    images: [
      'https://via.placeholder.com/800x600/000000/FFFFFF?text=Copa+Mundial+Sale'
    ],
    availableSizes: ['40', '41', '42', '43'],
    availableColors: ['Đen'],
    stock: 30,
    gender: 'nam',
    material: 'Da thật',
    sole: 'Cao su FG',
    isXakho: true
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // 1. Create categories if not exist
    console.log('Creating categories...');
    const categories = ['Giày bóng đá', 'Giày chạy bộ', 'Giày training', 'Giày bóng rổ', 'Giày tennis', 'Giày futsal', 'Giày bóng đá nữ'];
    
    for (const catName of categories) {
      await Category.findOneAndUpdate(
        { name: catName },
        { name: catName, description: `Danh mục ${catName}` },
        { upsert: true, new: true }
      );
    }
    console.log(`✓ Created ${categories.length} categories\n`);

    // 2. Create brands if not exist
    console.log('Creating brands...');
    const brands = ['Nike', 'Adidas', 'Mizuno', 'Puma'];
    
    for (const brandName of brands) {
      await Brand.findOneAndUpdate(
        { name: brandName },
        { name: brandName, description: `Thương hiệu ${brandName}` },
        { upsert: true, new: true }
      );
    }
    console.log(`✓ Created ${brands.length} brands\n`);

    // 3. Create products
    console.log('Creating products...');
    let createdCount = 0;

    for (const productData of sampleProducts) {
      // Find brand and category IDs
      const brand = await Brand.findOne({ name: productData.brand });
      const category = await Category.findOne({ name: productData.category });

      if (!brand || !category) {
        console.log(`⚠ Skipping ${productData.name} - Brand or Category not found`);
        continue;
      }

      // Check if product exists
      const exists = await Product.findOne({ name: productData.name });
      
      if (!exists) {
        await Product.create({
          ...productData,
          brand: brand._id,
          category: category._id,
          rating: Math.random() * 2 + 3, // Random rating 3-5
          reviews: Math.floor(Math.random() * 100) + 10, // Random reviews 10-110
          sold: Math.floor(Math.random() * 50)
        });
        console.log(`  ✓ Created: ${productData.name}`);
        createdCount++;
      } else {
        console.log(`  ○ Exists: ${productData.name}`);
      }
    }

    console.log(`\n✅ Successfully created ${createdCount} products`);
    console.log(`\n📊 Summary:`);
    console.log(`  - Total products: ${await Product.countDocuments()}`);
    console.log(`  - Total categories: ${await Category.countDocuments()}`);
    console.log(`  - Total brands: ${await Brand.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

seedProducts();
