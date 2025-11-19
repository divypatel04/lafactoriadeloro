/**
 * Import JSON Files to MongoDB Atlas
 * 
 * Usage: node import-to-atlas.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// UPDATE THIS with your MongoDB Atlas connection string
const ATLAS_URI = 'mongodb+srv://username:password@cluster.mongodb.net/lafactoria-ecommerce?retryWrites=true&w=majority';
const IMPORT_DIR = path.join(__dirname, '../mongodb-export');

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

async function importDatabase() {
  try {
    console.log('📥 Importing JSON files to MongoDB Atlas...\n');

    // Check if export directory exists
    if (!fs.existsSync(IMPORT_DIR)) {
      console.error('❌ Export directory not found!');
      console.log('Please run: node export-local-db.js first\n');
      process.exit(1);
    }

    // Connect to Atlas MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;

    // Import each collection
    for (const collectionName of collections) {
      try {
        const filePath = path.join(IMPORT_DIR, `${collectionName}.json`);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  ${collectionName}.json not found - skipping`);
          continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const documents = JSON.parse(fileContent);
        
        if (documents.length === 0) {
          console.log(`⚠️  ${collectionName}: no documents - skipping`);
          continue;
        }

        const collection = db.collection(collectionName);
        
        // Clear existing data (optional)
        await collection.deleteMany({});
        
        // Insert documents
        const result = await collection.insertMany(documents);
        console.log(`✓ ${collectionName}: imported ${result.insertedCount} documents`);
        
      } catch (error) {
        console.error(`❌ Error importing ${collectionName}:`, error.message);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Import completed successfully!\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importDatabase();
