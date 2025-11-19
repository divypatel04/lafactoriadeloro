const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product.model');

const setFeaturedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    if (products.length === 0) {
      console.log('No products found in database');
      process.exit(0);
    }

    // Set the first 6 products as featured
    const featuredCount = Math.min(6, products.length);
    const productNames = [];

    for (let i = 0; i < featuredCount; i++) {
      await Product.findByIdAndUpdate(products[i]._id, {
        isFeatured: true,
        isNew: i < 3 // First 3 are also marked as new
      });
      productNames.push(products[i].name);
      console.log(`✅ Set "${products[i].name}" as featured ${i < 3 ? 'and new' : ''}`);
    }

    // Set remaining products as not featured
    for (let i = featuredCount; i < products.length; i++) {
      await Product.findByIdAndUpdate(products[i]._id, {
        isFeatured: false,
        isNew: false
      });
    }

    console.log('\n📋 Summary:');
    console.log(`Featured products (${featuredCount}):`);
    productNames.forEach((name, idx) => {
      console.log(`  ${idx + 1}. ${name}`);
    });

    console.log('\n✅ Successfully updated featured products!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setFeaturedProducts();
