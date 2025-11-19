/**
 * MongoDB Migration Script
 * Migrates data from local MongoDB to MongoDB Atlas
 * 
 * Usage:
 * 1. Update ATLAS_URI with your MongoDB Atlas connection string
 * 2. Run: node migrate-to-atlas.js
 */

const mongoose = require('mongoose');

// Configuration
const LOCAL_URI = 'mongodb://localhost:27017/lafactoria-ecommerce';
// UPDATE: Set a simple password in Atlas (no special characters) and update below
// Example: mongodb+srv://divypatel0406:YourSimplePassword@cluster0.h6aaprs.mongodb.net/lafactoria-ecommerce?retryWrites=true&w=majority
const ATLAS_URI = 'mongodb+srv://divy:divy0406@cluster0.h6aaprs.mongodb.net/lafactoria-ecommerce?retryWrites=true&w=majority&appName=Cluster0';

// Collections to migrate
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

async function migrateDatabase() {
  let localConn, atlasConn;
  
  try {
    console.log('🚀 Starting MongoDB Migration...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to LOCAL MongoDB...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✓ Connected to LOCAL MongoDB\n');

    // Connect to Atlas MongoDB
    console.log('📡 Connecting to ATLAS MongoDB...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✓ Connected to ATLAS MongoDB\n');

    // Migrate each collection
    for (const collectionName of collections) {
      try {
        console.log(`📦 Migrating collection: ${collectionName}`);
        
        // Check if collection exists in local
        const localDb = localConn.db;
        const localCollections = await localDb.listCollections().toArray();
        const exists = localCollections.some(col => col.name === collectionName);
        
        if (!exists) {
          console.log(`   ⚠️  Collection '${collectionName}' not found in local DB - skipping`);
          continue;
        }

        // Get all documents from local collection
        const localCollection = localDb.collection(collectionName);
        const documents = await localCollection.find({}).toArray();
        
        if (documents.length === 0) {
          console.log(`   ℹ️  Collection '${collectionName}' is empty - skipping`);
          continue;
        }

        // Insert into Atlas collection
        const atlasDb = atlasConn.db;
        const atlasCollection = atlasDb.collection(collectionName);
        
        // Try to drop existing data (skip if not supported)
        try {
          await atlasCollection.deleteMany({});
          console.log(`   🗑️  Cleared existing data`);
        } catch (deleteError) {
          console.log(`   ⚠️  Could not clear existing data (will merge): ${deleteError.message}`);
        }
        
        // Insert documents (with duplicate key handling)
        try {
          const result = await atlasCollection.insertMany(documents, { ordered: false });
          console.log(`   ✓ Migrated ${result.insertedCount} documents\n`);
        } catch (insertError) {
          if (insertError.code === 11000) {
            const inserted = insertError.result?.nInserted || 0;
            console.log(`   ⚠️  Some duplicates skipped, inserted ${inserted} new documents\n`);
          } else {
            throw insertError;
          }
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
      }
    }

    // Close connections
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update Railway environment variables with ATLAS_URI');
    console.log('   2. Redeploy your application');
    console.log('   3. Test your live application\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateDatabase();
