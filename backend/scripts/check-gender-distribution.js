const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product.model');

async function checkGenderDistribution() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count products by gender
    const maleCount = await Product.countDocuments({ gender: 'male' });
    const femaleCount = await Product.countDocuments({ gender: 'female' });
    const unisexCount = await Product.countDocuments({ gender: 'unisex' });
    const noGenderCount = await Product.countDocuments({ gender: { $exists: false } });
    const totalCount = await Product.countDocuments();

    console.log('\n📊 Gender Distribution:');
    console.log(`   Male: ${maleCount}`);
    console.log(`   Female: ${femaleCount}`);
    console.log(`   Unisex: ${unisexCount}`);
    console.log(`   No Gender Field: ${noGenderCount}`);
    console.log(`   Total: ${totalCount}`);

    // Show sample products
    console.log('\n📝 Sample products with gender:');
    const samples = await Product.find().limit(5).select('name gender');
    samples.forEach(p => {
      console.log(`   - ${p.name}: ${p.gender}`);
    });

    mongoose.connection.close();
    console.log('\n✅ Check completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkGenderDistribution();
