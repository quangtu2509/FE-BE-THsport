// Script to seed Cart and Inventory data
// Đảm bảo mỗi product có đủ inventory và tạo sample cart cho test

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../app/models/Product');
const Inventory = require('../app/models/Inventory');
const Cart = require('../app/models/Cart');
const User = require('../app/models/User');

async function seedCartAndInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 1. Get all products
    const products = await Product.find({ isActive: true });
    console.log(`\n✓ Found ${products.length} active products`);

    if (products.length === 0) {
      console.log('⚠ No products found. Please run product seeder first.');
      process.exit(0);
    }

    // 2. Clear existing inventory (optional - comment out if you want to keep existing)
    // await Inventory.deleteMany({});
    // console.log('✓ Cleared existing inventory');

    // 3. Create/Update inventory for each product
    console.log('\n📦 Creating inventory for products...');
    let inventoryCount = 0;

    for (const product of products) {
      // Set base stock quantity (adjust based on product type)
      let baseStock = 50; // Default stock
      
      if (product.isFeatured) {
        baseStock = 100; // More stock for featured products
      }
      if (product.isXakho) {
        baseStock = 20; // Less stock for clearance items
      }

      // If product has sizes, create inventory for each size
      if (product.availableSizes && product.availableSizes.length > 0) {
        for (const size of product.availableSizes) {
          const variant = size;
          
          // Check if inventory exists
          const existingInventory = await Inventory.findOne({ 
            product: product._id, 
            variant: variant 
          });

          if (existingInventory) {
            // Update if stock is too low
            if (existingInventory.quantity < 10) {
              existingInventory.quantity = baseStock;
              await existingInventory.save();
              console.log(`  ↻ Updated inventory: ${product.name} - Size ${size} → ${baseStock} units`);
              inventoryCount++;
            }
          } else {
            // Create new inventory
            await Inventory.create({
              product: product._id,
              variant: variant,
              quantity: baseStock
            });
            console.log(`  ✓ Created inventory: ${product.name} - Size ${size} → ${baseStock} units`);
            inventoryCount++;
          }
        }
      } else {
        // Product without sizes - create single inventory entry
        const existingInventory = await Inventory.findOne({ 
          product: product._id, 
          variant: null 
        });

        if (existingInventory) {
          if (existingInventory.quantity < 10) {
            existingInventory.quantity = baseStock;
            await existingInventory.save();
            console.log(`  ↻ Updated inventory: ${product.name} → ${baseStock} units`);
            inventoryCount++;
          }
        } else {
          await Inventory.create({
            product: product._id,
            variant: null,
            quantity: baseStock
          });
          console.log(`  ✓ Created inventory: ${product.name} → ${baseStock} units`);
          inventoryCount++;
        }
      }

      // Update product stock field to match total inventory
      const totalInventory = await Inventory.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);
      
      if (totalInventory.length > 0) {
        product.stock = totalInventory[0].total;
        await product.save();
      }
    }

    console.log(`\n✓ Created/Updated ${inventoryCount} inventory entries`);

    // 4. Create sample cart for testing (optional)
    console.log('\n🛒 Creating sample cart...');
    
    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@thsport.com' });
    
    if (!testUser) {
      testUser = await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@thsport.com',
        phone: '0123456789',
        password: 'Test@123456', // Will be hashed by User model pre-save hook
        role: 'user'
      });
      console.log('✓ Created test user: test@thsport.com (username: testuser)');
    }

    // Check if cart already exists
    let cart = await Cart.findOne({ user: testUser._id });
    
    if (!cart) {
      // Create cart with sample items (first 3 products)
      const sampleProducts = products.slice(0, 3);
      const cartItems = [];

      for (const product of sampleProducts) {
        const selectedSize = product.availableSizes && product.availableSizes.length > 0 
          ? product.availableSizes[0] 
          : null;
        
        const selectedColor = product.availableColors && product.availableColors.length > 0
          ? product.availableColors[0]
          : null;

        cartItems.push({
          product: product._id,
          quantity: 2,
          price: product.price,
          selectedSize: selectedSize,
          selectedColor: selectedColor,
          imageUrl: product.images && product.images.length > 0 ? product.images[0] : null
        });
      }

      cart = await Cart.create({
        user: testUser._id,
        items: cartItems
      });

      console.log(`✓ Created cart with ${cartItems.length} items for test user`);
      console.log(`  Total items: ${cart.getTotalItems()}`);
      console.log(`  Total price: ${cart.getTotalPrice().toLocaleString('vi-VN')}₫`);
    } else {
      console.log('✓ Cart already exists for test user');
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Inventory entries: ${await Inventory.countDocuments()}`);
    console.log(`  - Test user: ${testUser.email}`);
    console.log(`  - Test cart items: ${cart.items.length}`);
    
    console.log('\n🔐 Test account credentials:');
    console.log('  Email: test@thsport.com');
    console.log('  Password: Test@123456');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

// Run the seeder
seedCartAndInventory();
