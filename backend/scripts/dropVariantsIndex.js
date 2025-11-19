const mongoose = require('mongoose');
require('dotenv').config();

const dropVariantsIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // List all indexes
    console.log('Current indexes:');
    const indexes = await productsCollection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Drop variant-related indexes
    console.log('\nDropping variant indexes...');
    
    try {
      await productsCollection.dropIndex('variants.sku_1');
      console.log('  ✓ Dropped variants.sku_1');
    } catch (err) {
      console.log('  - variants.sku_1 not found or already dropped');
    }

    try {
      await productsCollection.dropIndex('variants_1');
      console.log('  ✓ Dropped variants_1');
    } catch (err) {
      console.log('  - variants_1 not found or already dropped');
    }

    console.log('\n✅ Index cleanup completed!');
    console.log('\nRemaining indexes:');
    const remainingIndexes = await productsCollection.indexes();
    remainingIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropVariantsIndex();
