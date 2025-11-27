const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product.model');

async function testGenderFilter() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Count all products
    const allCount = await Product.countDocuments();
    console.log(`Total products: ${allCount}`);

    // Test 2: Filter by unisex
    const unisexCount = await Product.countDocuments({ gender: 'unisex' });
    console.log(`Unisex products: ${unisexCount}`);

    // Test 3: Filter by female
    const femaleCount = await Product.countDocuments({ gender: 'female' });
    console.log(`Female products: ${femaleCount}`);

    // Test 4: Filter by male
    const maleCount = await Product.countDocuments({ gender: 'male' });
    console.log(`Male products: ${maleCount}`);

    // Test 5: Simulate the controller filter
    console.log('\n--- Simulating Controller Filter ---');
    const filter = { isActive: true, gender: 'female' };
    const products = await Product.find(filter).limit(5).select('name gender');
    console.log(`Filter: ${JSON.stringify(filter)}`);
    console.log(`Found ${products.length} products:`);
    products.forEach(p => console.log(`  - ${p.name}: ${p.gender}`));

    mongoose.connection.close();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testGenderFilter();
