const mongoose = require('mongoose');
require('dotenv').config();

const migrateProductsFixed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get the raw collection to avoid schema validation
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products to migrate\n`);

    let migrated = 0;

    for (const product of products) {
      console.log(`Migrating: ${product.name}`);
      
      const updates = {
        $set: {},
        $unset: { variants: 1 } // This properly removes the field
      };

      // Initialize priceModifiers if needed
      if (!product.priceModifiers || Object.keys(product.priceModifiers).length === 0) {
        const priceModifiers = {
          materials: [],
          purities: [],
          ringSizes: [],
          diamondTypes: []
        };

        // Extract from variants if they exist
        if (product.variants && product.variants.length > 0) {
          const materialsMap = new Map();
          const puritiesMap = new Map();
          const ringSizesMap = new Map();
          const diamondTypesMap = new Map();
          
          let totalStock = 0;
          const prices = [];

          product.variants.forEach(variant => {
            totalStock += variant.stock || 0;
            prices.push(variant.price);

            // Extract unique materials
            if (variant.material && !materialsMap.has(variant.material)) {
              materialsMap.set(variant.material, {
                name: variant.material,
                label: variant.material.split('-').map(w => 
                  w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' '),
                priceAdjustment: 0,
                available: true
              });
            }

            // Extract unique purities
            if (variant.purity && !puritiesMap.has(variant.purity)) {
              puritiesMap.set(variant.purity, {
                name: variant.purity,
                label: `${variant.purity} Gold`,
                priceAdjustment: 0,
                available: true
              });
            }

            // Extract unique ring sizes
            if (variant.ringSize && !ringSizesMap.has(variant.ringSize)) {
              ringSizesMap.set(variant.ringSize, {
                size: variant.ringSize.toString(),
                priceAdjustment: 0,
                available: true
              });
            }

            // Extract unique diamond types
            if (variant.diamondType && !diamondTypesMap.has(variant.diamondType)) {
              const diamondLabel = variant.diamondType === 'natural' ? 'Natural Diamond' :
                                  variant.diamondType === 'lab-grown' ? 'Lab-Grown Diamond' :
                                  variant.diamondType === 'none' ? 'No Diamond' : variant.diamondType;
              
              diamondTypesMap.set(variant.diamondType, {
                name: variant.diamondType,
                label: diamondLabel,
                priceAdjustment: 0,
                available: true
              });
            }
          });

          // Convert maps to arrays
          priceModifiers.materials = Array.from(materialsMap.values());
          priceModifiers.purities = Array.from(puritiesMap.values());
          priceModifiers.ringSizes = Array.from(ringSizesMap.values());
          priceModifiers.diamondTypes = Array.from(diamondTypesMap.values());

          // Calculate price adjustments based on average prices
          const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : product.basePrice;
          
          // Assign price adjustments to materials (simplified logic)
          priceModifiers.materials.forEach((mat, idx) => {
            if (mat.name === 'white-gold') mat.priceAdjustment = 100;
            if (mat.name === 'rose-gold') mat.priceAdjustment = 50;
            if (mat.name === 'platinum') mat.priceAdjustment = 200;
          });

          // Assign price adjustments to purities
          priceModifiers.purities.forEach((pur, idx) => {
            if (pur.name === '18K') pur.priceAdjustment = 150;
            if (pur.name === '22K') pur.priceAdjustment = 300;
            if (pur.name === '24K') pur.priceAdjustment = 500;
            if (pur.name === '950') pur.priceAdjustment = 250;
          });

          // Assign price adjustments to diamond types
          priceModifiers.diamondTypes.forEach((dia, idx) => {
            if (dia.name === 'natural') dia.priceAdjustment = 500;
            if (dia.name === 'lab-grown') dia.priceAdjustment = 300;
          });

          updates.$set.priceModifiers = priceModifiers;
          updates.$set.stock = totalStock;

          // Set SKU if not exists
          if (!product.sku) {
            updates.$set.sku = product.variants[0]?.sku || `PROD-${product._id.toString().slice(-6).toUpperCase()}`;
          }

          console.log(`  - Materials: ${priceModifiers.materials.length}`);
          console.log(`  - Purities: ${priceModifiers.purities.length}`);
          console.log(`  - Ring Sizes: ${priceModifiers.ringSizes.length}`);
          console.log(`  - Diamond Types: ${priceModifiers.diamondTypes.length}`);
          console.log(`  - Total Stock: ${totalStock}`);
        } else {
          // No variants, create default structure
          priceModifiers.materials.push({
            name: 'yellow-gold',
            label: 'Yellow Gold',
            priceAdjustment: 0,
            available: true
          });
          
          priceModifiers.purities.push({
            name: '14K',
            label: '14K Gold',
            priceAdjustment: 0,
            available: true
          });

          priceModifiers.ringSizes.push({
            size: '7',
            priceAdjustment: 0,
            available: true
          });

          priceModifiers.diamondTypes.push({
            name: 'none',
            label: 'No Diamond',
            priceAdjustment: 0,
            available: true
          });

          updates.$set.priceModifiers = priceModifiers;
          updates.$set.stock = product.stock || 100;
          
          if (!product.sku) {
            updates.$set.sku = `PROD-${product._id.toString().slice(-6).toUpperCase()}`;
          }

          console.log(`  - Created default options`);
        }
      }

      // Ensure stock and sku exist
      if (!product.stock && product.stock !== 0) {
        updates.$set.stock = 100;
      }
      
      if (!product.sku) {
        updates.$set.sku = `PROD-${product._id.toString().slice(-6).toUpperCase()}`;
      }

      // Apply updates
      if (Object.keys(updates.$set).length > 0 || Object.keys(updates.$unset).length > 0) {
        await productsCollection.updateOne(
          { _id: product._id },
          updates
        );
        migrated++;
        console.log(`  ✓ Migrated\n`);
      } else {
        console.log(`  - Already migrated\n`);
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Migrated: ${migrated}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateProductsFixed();
