const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product.model');

async function addGenderToProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update all products without a gender field to have 'unisex' as default
    const result = await Product.updateMany(
      { gender: { $exists: false } },
      { $set: { gender: 'unisex' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} products with gender field`);

    // Verify update
    const totalProducts = await Product.countDocuments();
    const productsWithGender = await Product.countDocuments({ gender: { $exists: true } });
    
    console.log(`📊 Total products: ${totalProducts}`);
    console.log(`📊 Products with gender field: ${productsWithGender}`);

    mongoose.connection.close();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

addGenderToProducts();
