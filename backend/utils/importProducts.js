const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
require('dotenv').config();

// CSV file path (update this to match your file location)
const CSV_FILE_PATH = './data.csv';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Helper function to clean and extract description
function extractShortDescription(htmlDescription) {
  if (!htmlDescription) return '';
  
  // Extract the first paragraph
  const match = htmlDescription.match(/<p>(.*?)<\/p>/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return htmlDescription.substring(0, 200);
}

// Helper function to parse images
function parseImages(imagesString) {
  if (!imagesString) return [];
  
  return imagesString.split(', ').map(url => url.trim()).filter(url => url);
}

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to extract weight from description
function extractWeight(description) {
  if (!description) return 3.2;
  
  const match = description.match(/(\d+\.?\d*)\s*gm/i);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  return 3.2; // Default weight
}

// Main import function
async function importProducts() {
  try {
    console.log('🚀 Starting product import...\n');
    
    // First, ensure "Rings" category exists
    let ringsCategory = await Category.findOne({ slug: 'rings' });
    if (!ringsCategory) {
      ringsCategory = await Category.create({
        name: 'Rings',
        slug: 'rings',
        description: 'Beautiful engagement and wedding rings',
        isActive: true
      });
      console.log('✅ Created Rings category');
    }

    // Parse CSV
    const products = new Map(); // Use Map to group variations by parent product
    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 Parsed ${rows.length} rows from CSV\n`);

    // Process rows
    for (const row of rows) {
      const tipo = row['Tipo']; // Type: variable or variation
      const sku = row['SKU'];
      const nombre = row['Nombre']; // Product name
      const descripcion = row['Descripción']; // Full description
      const precioRebajado = parseFloat(row['Precio rebajado']) || 0;
      const precioNormal = parseFloat(row['Precio normal']) || 0;
      const imagenes = row['Imágenes'];
      const categoria = row['Categorías'] || 'Rings';
      
      // Attributes
      const composition = row['Valor(es) del atributo 1']; // e.g., "10 Kt, 14 Kt, 18 Kt"
      const ringSize = row['Valor(es) del atributo 2']; // e.g., "4, 4.5, 5..."
      const diamondType = row['Valor(es) del atributo 3']; // e.g., "Lab Grown, Natural"
      const color = row['Valor(es) del atributo 4']; // e.g., "Rose Gold, White Gold, Yellow Gold"

      if (tipo === 'variable') {
        // This is a parent product
        const images = parseImages(imagenes);
        const shortDescription = extractShortDescription(descripcion);
        const weight = extractWeight(descripcion);

        products.set(sku, {
          sku,
          name: nombre,
          slug: createSlug(nombre),
          description: descripcion,
          shortDescription,
          category: ringsCategory._id,
          images: images.slice(0, 5).map((url, index) => ({
            url,
            alt: nombre,
            isDefault: index === 0
          })),
          material: 'Gold', // Default, can be extracted from description
          weight,
          basePrice: 500, // Will be updated with minimum variant price
          variants: [],
          isActive: true,
          isFeatured: false
        });

        console.log(`📦 Found product: ${nombre} (${sku})`);
      } else if (tipo === 'variation') {
        // This is a variation
        const parentSKU = row['Superior']; // Parent SKU
        
        if (products.has(parentSKU)) {
          const product = products.get(parentSKU);
          
          // Extract purity from composition
          let purity = '';
          if (composition) {
            if (composition.includes('10 Kt')) purity = '10K';
            else if (composition.includes('14 Kt')) purity = '14K';
            else if (composition.includes('18 Kt')) purity = '18K';
          }
          
          // Extract material from color (convert to enum format)
          let material = 'gold';
          if (color) {
            if (color.includes('Yellow')) material = 'yellow-gold';
            else if (color.includes('White')) material = 'white-gold';
            else if (color.includes('Rose')) material = 'rose-gold';
          }
          
          // Extract diamond type
          let type = 'Lab Grown';
          if (diamondType) {
            if (diamondType.includes('Natural')) type = 'Natural';
          }
          
          const variant = {
            sku,
            material,
            purity,
            weight: product.weight,
            price: precioNormal > 0 ? precioNormal : precioRebajado,
            stock: 10, // Default stock
          };
          
          product.variants.push(variant);
        }
      }
    }

    console.log(`\n✅ Processed ${products.size} unique products\n`);

    // Clear existing products (optional - comment out if you want to keep existing data)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products\n');

    // Insert products into database
    let insertedCount = 0;
    for (const [sku, productData] of products) {
      try {
        // Only insert products with variants
        if (productData.variants.length > 0) {
          // Calculate basePrice as minimum variant price
          productData.basePrice = Math.min(...productData.variants.map(v => v.price));
          
          await Product.create(productData);
          insertedCount++;
          console.log(`✅ Inserted: ${productData.name} (${productData.variants.length} variants)`);
        } else {
          console.log(`⚠️  Skipped: ${productData.name} (no variants)`);
        }
      } catch (error) {
        console.error(`❌ Error inserting ${productData.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Inserted ${insertedCount} products`);
    console.log(`📊 Total variants: ${Array.from(products.values()).reduce((sum, p) => sum + p.variants.length, 0)}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the import
importProducts();
