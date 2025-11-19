/**
 * Migration Script: Convert products from fixed pricing to weight-based pricing
 * 
 * This script:
 * 1. Removes basePrice and priceModifiers from all products
 * 2. Adds weight field (if not present)
 * 3. Converts priceModifiers to availableOptions
 * 4. Initializes pricing configuration
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const PricingConfig = require('../models/PricingConfig.model');

async function migrateProducts() {
  try {
    console.log('🔄 Starting product pricing migration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize pricing configuration
    console.log('\n📊 Initializing pricing configuration...');
    const pricingConfig = await PricingConfig.getConfig();
    console.log('✅ Pricing configuration initialized');

    // Get all products
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} products to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Extract available options from old priceModifiers
        const availableOptions = {
          compositions: [],
          materials: [],
          ringSizes: [],
          diamondTypes: [],
          diamondCarat: 0
        };

        // Convert priceModifiers to availableOptions
        if (product.priceModifiers) {
          // Extract compositions from purities
          if (product.priceModifiers.purities && product.priceModifiers.purities.length > 0) {
            availableOptions.compositions = product.priceModifiers.purities
              .filter(p => p.available)
              .map(p => p.name);
          }

          // Extract materials
          if (product.priceModifiers.materials && product.priceModifiers.materials.length > 0) {
            availableOptions.materials = product.priceModifiers.materials
              .filter(m => m.available)
              .map(m => m.name);
          }

          // Extract ring sizes
          if (product.priceModifiers.ringSizes && product.priceModifiers.ringSizes.length > 0) {
            availableOptions.ringSizes = product.priceModifiers.ringSizes
              .filter(rs => rs.available)
              .map(rs => rs.size);
          }

          // Extract diamond types
          if (product.priceModifiers.diamondTypes && product.priceModifiers.diamondTypes.length > 0) {
            availableOptions.diamondTypes = product.priceModifiers.diamondTypes
              .filter(dt => dt.available)
              .map(dt => dt.name);
          }
        }

        // Default to all options if none specified
        if (availableOptions.compositions.length === 0) {
          availableOptions.compositions = ['14K', '18K'];
        }
        if (availableOptions.materials.length === 0) {
          availableOptions.materials = ['yellow-gold', 'white-gold', 'rose-gold'];
        }
        if (availableOptions.diamondTypes.length === 0) {
          availableOptions.diamondTypes = ['none'];
        }

        // Set default weight if not present (estimate 5 grams for rings)
        let weight = product.weight || 5;

        // Update product without validation to allow removal of required fields
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              weight: weight,
              availableOptions: availableOptions
            },
            $unset: {
              basePrice: "",
              priceModifiers: ""
            }
          }
        );

        migratedCount++;
        console.log(`✅ Migrated: ${product.name} (${product.sku})`);
        console.log(`   Weight: ${weight}g, Options: ${availableOptions.compositions.join(', ')}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating product ${product.sku}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   Total Products: ${products.length}`);
    console.log(`   ✅ Successfully Migrated: ${migratedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const updatedProducts = await Product.find({});
    const withWeight = updatedProducts.filter(p => p.weight > 0).length;
    const withOptions = updatedProducts.filter(p => p.availableOptions).length;
    const withOldFields = updatedProducts.filter(p => p.basePrice !== undefined || p.priceModifiers !== undefined).length;

    console.log(`   Products with weight: ${withWeight}/${updatedProducts.length}`);
    console.log(`   Products with availableOptions: ${withOptions}/${updatedProducts.length}`);
    console.log(`   Products still with old fields: ${withOldFields}`);

    if (withOldFields > 0) {
      console.warn('\n⚠️  Warning: Some products still have old pricing fields');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }

    // Display sample pricing
    console.log('\n💰 Sample Price Calculation:');
    const sampleProduct = updatedProducts[0];
    if (sampleProduct && sampleProduct.availableOptions) {
      const sampleOptions = {
        composition: sampleProduct.availableOptions.compositions[0],
        material: sampleProduct.availableOptions.materials[0],
        diamondType: sampleProduct.availableOptions.diamondTypes[0]
      };
      
      try {
        const price = await sampleProduct.calculatePrice(sampleOptions);
        console.log(`   Product: ${sampleProduct.name}`);
        console.log(`   Weight: ${sampleProduct.weight}g`);
        console.log(`   Options: ${JSON.stringify(sampleOptions)}`);
        console.log(`   Calculated Price: $${price}`);
      } catch (error) {
        console.error('   Error calculating sample price:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateProducts();
