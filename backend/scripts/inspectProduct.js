const mongoose = require('mongoose');
require('dotenv').config();

const checkVariantStructure = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Get a product with more complete data
    const product = await productsCollection.findOne({ 
      slug: 'petite-elodie-1-5mm-engagement-ring' 
    });

    console.log('=== PRODUCT DETAILS ===\n');
    console.log('Name:', product.name);
    console.log('Base Price:', product.basePrice);
    console.log('Stock:', product.stock);
    console.log('SKU:', product.sku);
    
    console.log('\n=== PRICE MODIFIERS ===\n');
    console.log(JSON.stringify(product.priceModifiers, null, 2));

    // Check if there's any remnant variant data
    console.log('\n=== CHECKING FOR VARIANT DATA ===\n');
    console.log('variants field exists:', product.variants !== undefined);
    console.log('sizes field exists:', product.sizes !== undefined);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkVariantStructure();
