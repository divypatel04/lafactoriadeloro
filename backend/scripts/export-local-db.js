/**
 * Export Local MongoDB to JSON Files
 * 
 * Usage: node export-local-db.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const LOCAL_URI = 'mongodb://localhost:27017/lafactoria-ecommerce';
const EXPORT_DIR = path.join(__dirname, '../mongodb-export');

const collections = [
  'users',
  'products',
  'categories',
  'orders',
  'carts',
  'reviews',
  'wishlists',
  'coupons',
  'sliders',
  'settings',
  'pricingconfigs',
  'contacts'
];

async function exportDatabase() {
  try {
    console.log('📤 Exporting Local MongoDB to JSON files...\n');

    // Create export directory
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;

    // Export each collection
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count === 0) {
          console.log(`⚠️  ${collectionName}: empty - skipping`);
          continue;
        }

        const documents = await collection.find({}).toArray();
        const filePath = path.join(EXPORT_DIR, `${collectionName}.json`);
        
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
        console.log(`✓ ${collectionName}: exported ${count} documents → ${collectionName}.json`);
        
      } catch (error) {
        console.error(`❌ Error exporting ${collectionName}:`, error.message);
      }
    }

    await mongoose.disconnect();
    console.log(`\n✅ Export completed!`);
    console.log(`📁 Files saved in: ${EXPORT_DIR}\n`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

exportDatabase();
