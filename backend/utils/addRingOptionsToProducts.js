const mongoose = require('mongoose');
const Product = require('../models/Product.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const ringSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9'];
const diamondTypes = ['natural', 'lab-grown'];

async function addRingOptionsToProducts() {
  try {
    console.log('🔄 Starting to update products with ring options...\n');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Check if product already has ring sizes and diamond types
      const hasRingSizes = product.variants.some(v => v.ringSize);
      const hasDiamondTypes = product.variants.some(v => v.diamondType && v.diamondType !== 'natural');

      if (hasRingSizes && hasDiamondTypes) {
        console.log(`⏭️  Skipping "${product.name}" - already has ring options`);
        skippedCount++;
        continue;
      }

      // Get existing variants
      const existingVariants = product.variants;
      const newVariants = [];

      // For each existing variant, create variants for different ring sizes and diamond types
      for (const variant of existingVariants) {
        // Create variants for each ring size and diamond type combination
        for (const ringSize of ringSizes) {
          for (const diamondType of diamondTypes) {
            const newVariant = {
              material: variant.material,
              purity: variant.purity,
              ringSize: ringSize,
              diamondType: diamondType,
              weight: variant.weight,
              price: variant.price * (diamondType === 'lab-grown' ? 0.95 : 1), // 5% discount for lab-grown
              sku: `${variant.sku}-${ringSize}-${diamondType.substring(0, 3).toUpperCase()}`,
              stock: Math.floor(variant.stock / (ringSizes.length * diamondTypes.length)) || 5,
              dimensions: variant.dimensions
            };
            newVariants.push(newVariant);
          }
        }
      }

      // Update product with new variants
      product.variants = newVariants;
      
      // Recalculate base price (minimum price)
      product.basePrice = Math.min(...newVariants.map(v => v.price));

      await product.save();
      updatedCount++;
      console.log(`✅ Updated "${product.name}" - Created ${newVariants.length} variants`);
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ⏭️  Skipped: ${skippedCount} products`);
    console.log(`   📦 Total: ${products.length} products`);
    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

// Run the migration
addRingOptionsToProducts();
