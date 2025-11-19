require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product.model');

async function checkProduct() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get one product to check structure
    const product = await Product.findOne({ slug: 'petite-elodie-1-5mm-engagement-ring' });
    
    if (!product) {
      console.log('Product not found!');
      process.exit(1);
    }

    console.log('=== PRODUCT STRUCTURE ===\n');
    console.log('Name:', product.name);
    console.log('Slug:', product.slug);
    console.log('Base Price:', product.basePrice);
    console.log('Stock:', product.stock);
    console.log('SKU:', product.sku);
    console.log('\n=== CHECKING FIELDS ===\n');
    console.log('Has variants field?:', product.variants !== undefined);
    console.log('Has priceModifiers field?:', product.priceModifiers !== undefined);
    
    if (product.variants) {
      console.log('\n⚠️  WARNING: Product still has variants field!');
      console.log('Number of variants:', product.variants.length);
    }
    
    if (product.priceModifiers) {
      console.log('\n✅ Product has priceModifiers:');
      console.log('  Materials:', product.priceModifiers.materials?.length || 0);
      console.log('  Purities:', product.priceModifiers.purities?.length || 0);
      console.log('  Ring Sizes:', product.priceModifiers.ringSizes?.length || 0);
      console.log('  Diamond Types:', product.priceModifiers.diamondTypes?.length || 0);
      
      console.log('\n=== SAMPLE PRICE MODIFIERS ===\n');
      
      if (product.priceModifiers.materials && product.priceModifiers.materials.length > 0) {
        console.log('Materials:');
        product.priceModifiers.materials.forEach(m => {
          console.log(`  - ${m.label}: +$${m.priceAdjustment} (available: ${m.available})`);
        });
      }
      
      if (product.priceModifiers.purities && product.priceModifiers.purities.length > 0) {
        console.log('\nPurities:');
        product.priceModifiers.purities.forEach(p => {
          console.log(`  - ${p.label}: +$${p.priceAdjustment} (available: ${p.available})`);
        });
      }
      
      if (product.priceModifiers.ringSizes && product.priceModifiers.ringSizes.length > 0) {
        console.log('\nRing Sizes:');
        product.priceModifiers.ringSizes.slice(0, 5).forEach(s => {
          console.log(`  - Size ${s.size}: +$${s.priceAdjustment} (available: ${s.available})`);
        });
        if (product.priceModifiers.ringSizes.length > 5) {
          console.log(`  ... and ${product.priceModifiers.ringSizes.length - 5} more sizes`);
        }
      }
      
      if (product.priceModifiers.diamondTypes && product.priceModifiers.diamondTypes.length > 0) {
        console.log('\nDiamond Types:');
        product.priceModifiers.diamondTypes.forEach(d => {
          console.log(`  - ${d.label}: +$${d.priceAdjustment} (available: ${d.available})`);
        });
      }
    } else {
      console.log('\n❌ ERROR: Product does NOT have priceModifiers!');
    }

    // Check total products
    const totalProducts = await Product.countDocuments();
    const productsWithModifiers = await Product.countDocuments({ priceModifiers: { $exists: true } });
    const productsWithVariants = await Product.countDocuments({ variants: { $exists: true } });
    
    console.log('\n=== DATABASE STATISTICS ===\n');
    console.log('Total Products:', totalProducts);
    console.log('Products with priceModifiers:', productsWithModifiers);
    console.log('Products with variants field:', productsWithVariants);
    
    if (productsWithVariants > 0) {
      console.log('\n⚠️  WARNING: Some products still have the variants field!');
      console.log('Migration may not have completed properly.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProduct();
