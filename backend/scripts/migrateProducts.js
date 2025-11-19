const mongoose = require('mongoose');
const Product = require('../models/Product.model');
require('dotenv').config();

const migrateProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    for (const product of products) {
      console.log(`\nMigrating product: ${product.name}`);
      
      // Initialize priceModifiers if it doesn't exist
      if (!product.priceModifiers) {
        product.priceModifiers = {
          materials: [],
          purities: [],
          ringSizes: [],
          diamondTypes: []
        };
      }

      // Migrate from variants to price modifiers
      if (product.variants && product.variants.length > 0) {
        // Get unique materials
        const materials = {};
        const purities = {};
        const ringSizes = {};
        const diamondTypes = {};
        
        let totalStock = 0;
        let lowestPrice = Infinity;
        let firstVariantSku = null;

        product.variants.forEach(variant => {
          // Track materials
          if (variant.material && !materials[variant.material]) {
            // Calculate price difference from base price
            const priceAdjustment = variant.price - product.basePrice;
            materials[variant.material] = {
              name: variant.material,
              label: variant.material.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              priceAdjustment: priceAdjustment,
              available: true
            };
          }

          // Track purities
          if (variant.purity && !purities[variant.purity]) {
            purities[variant.purity] = {
              name: variant.purity,
              label: variant.purity,
              priceAdjustment: 0, // Set manually if needed
              available: true
            };
          }

          // Track ring sizes
          if (variant.ringSize && !ringSizes[variant.ringSize]) {
            ringSizes[variant.ringSize] = {
              size: variant.ringSize,
              priceAdjustment: 0, // Larger sizes might cost more
              available: true
            };
          }

          // Track diamond types
          if (variant.diamondType && !diamondTypes[variant.diamondType]) {
            diamondTypes[variant.diamondType] = {
              name: variant.diamondType,
              label: variant.diamondType === 'natural' ? 'Natural Diamond' : 
                     variant.diamondType === 'lab-grown' ? 'Lab Grown Diamond' : 
                     'No Diamond',
              priceAdjustment: 0, // Set manually based on diamond type
              available: true
            };
          }

          totalStock += variant.stock || 0;
          if (variant.price < lowestPrice) {
            lowestPrice = variant.price;
          }
          if (!firstVariantSku) {
            firstVariantSku = variant.sku;
          }
        });

        // Update product with new structure
        product.priceModifiers.materials = Object.values(materials);
        product.priceModifiers.purities = Object.values(purities);
        product.priceModifiers.ringSizes = Object.values(ringSizes);
        product.priceModifiers.diamondTypes = Object.values(diamondTypes);
        
        // Set stock to total of all variants
        product.stock = totalStock;
        
        // Use first variant's SKU or generate a new one
        if (!product.sku) {
          product.sku = firstVariantSku || `PROD-${product._id.toString().slice(-6).toUpperCase()}`;
        }

        // Update base price to lowest variant price if lower
        if (lowestPrice < product.basePrice) {
          console.log(`Updating base price from ${product.basePrice} to ${lowestPrice}`);
          product.basePrice = lowestPrice;
        }

        // Store weight from first variant if not set
        if (!product.weight && product.variants[0]?.weight) {
          product.weight = product.variants[0].weight;
        }

        // Store dimensions from first variant if not set
        if (!product.dimensions && product.variants[0]?.dimensions) {
          product.dimensions = product.variants[0].dimensions;
        }

        console.log(`- Added ${product.priceModifiers.materials.length} materials`);
        console.log(`- Added ${product.priceModifiers.purities.length} purities`);
        console.log(`- Added ${product.priceModifiers.ringSizes.length} ring sizes`);
        console.log(`- Added ${product.priceModifiers.diamondTypes.length} diamond types`);
        console.log(`- Total stock: ${totalStock}`);
        console.log(`- SKU: ${product.sku}`);
      } else {
        // Product has no variants, set up default structure
        if (!product.stock) product.stock = 0;
        if (!product.sku) {
          product.sku = `PROD-${product._id.toString().slice(-6).toUpperCase()}`;
        }
        
        // Add default material option
        if (product.priceModifiers.materials.length === 0) {
          product.priceModifiers.materials.push({
            name: 'yellow-gold',
            label: 'Yellow Gold',
            priceAdjustment: 0,
            available: true
          });
        }
      }

      // Remove old variants array
      product.variants = undefined;
      product.sizes = undefined;

      // Save product
      await product.save();
      console.log(`✓ Product migrated successfully`);
    }

    console.log(`\n✅ Migration completed for ${products.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateProducts();
