const mongoose = require('mongoose');
require('dotenv').config();

const addCompleteOptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products\n`);

    let updated = 0;

    for (const product of products) {
      console.log(`Processing: ${product.name}`);
      
      const updates = { $set: {} };
      let needsUpdate = false;

      // Default complete price modifiers for jewelry
      const defaultModifiers = {
        materials: [
          { name: 'yellow-gold', label: 'Yellow Gold', priceAdjustment: 0, available: true },
          { name: 'white-gold', label: 'White Gold', priceAdjustment: 100, available: true },
          { name: 'rose-gold', label: 'Rose Gold', priceAdjustment: 50, available: true },
          { name: 'platinum', label: 'Platinum', priceAdjustment: 200, available: true }
        ],
        purities: [
          { name: '14K', label: '14K Gold', priceAdjustment: 0, available: true },
          { name: '18K', label: '18K Gold', priceAdjustment: 150, available: true },
          { name: '22K', label: '22K Gold', priceAdjustment: 300, available: true }
        ],
        ringSizes: [
          { size: '4', priceAdjustment: 0, available: true },
          { size: '4.5', priceAdjustment: 0, available: true },
          { size: '5', priceAdjustment: 0, available: true },
          { size: '5.5', priceAdjustment: 0, available: true },
          { size: '6', priceAdjustment: 5, available: true },
          { size: '6.5', priceAdjustment: 5, available: true },
          { size: '7', priceAdjustment: 10, available: true },
          { size: '7.5', priceAdjustment: 10, available: true },
          { size: '8', priceAdjustment: 15, available: true },
          { size: '8.5', priceAdjustment: 15, available: true },
          { size: '9', priceAdjustment: 20, available: true },
          { size: '9.5', priceAdjustment: 20, available: true },
          { size: '10', priceAdjustment: 25, available: true },
          { size: '10.5', priceAdjustment: 25, available: true },
          { size: '11', priceAdjustment: 30, available: true }
        ],
        diamondTypes: [
          { name: 'none', label: 'No Diamond', priceAdjustment: 0, available: true },
          { name: 'natural', label: 'Natural Diamond', priceAdjustment: 500, available: true },
          { name: 'lab-grown', label: 'Lab-Grown Diamond', priceAdjustment: 300, available: true }
        ]
      };

      // Check if priceModifiers need to be completed
      if (!product.priceModifiers) {
        updates.$set.priceModifiers = defaultModifiers;
        needsUpdate = true;
      } else {
        const pm = product.priceModifiers;
        
        // Add missing materials
        if (!pm.materials || pm.materials.length < 3) {
          updates.$set['priceModifiers.materials'] = defaultModifiers.materials;
          needsUpdate = true;
        }
        
        // Add missing purities
        if (!pm.purities || pm.purities.length === 0) {
          updates.$set['priceModifiers.purities'] = defaultModifiers.purities;
          needsUpdate = true;
        }
        
        // Add missing ring sizes
        if (!pm.ringSizes || pm.ringSizes.length === 0) {
          updates.$set['priceModifiers.ringSizes'] = defaultModifiers.ringSizes;
          needsUpdate = true;
        }
        
        // Add missing diamond types
        if (!pm.diamondTypes || pm.diamondTypes.length === 0) {
          updates.$set['priceModifiers.diamondTypes'] = defaultModifiers.diamondTypes;
          needsUpdate = true;
        }
      }

      // Ensure stock exists
      if (product.stock === undefined || product.stock === null) {
        updates.$set.stock = 100;
        needsUpdate = true;
      }

      // Ensure SKU exists
      if (!product.sku) {
        updates.$set.sku = `PROD-${product._id.toString().slice(-6).toUpperCase()}`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await productsCollection.updateOne(
          { _id: product._id },
          updates
        );
        updated++;
        console.log(`  ✓ Updated\n`);
      } else {
        console.log(`  - Already complete\n`);
      }
    }

    console.log(`\n✅ Completed!`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Updated: ${updated}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addCompleteOptions();
