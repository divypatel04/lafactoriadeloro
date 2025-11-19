require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete existing admin
    const result = await User.deleteOne({ email: 'admin@lafactoria.com' });
    console.log(`🗑️  Deleted ${result.deletedCount} admin user(s)\n`);

    // Create new admin with correct password
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lafactoria.com',
      password: 'admin123', // Will be hashed by model's pre-save hook
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user recreated successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: admin@lafactoria.com');
    console.log('🔑 Password: admin123');
    console.log('═══════════════════════════════════════');
    console.log('\n🎯 Access Points:');
    console.log('   Login: http://localhost:3000/login');
    console.log('   Admin Dashboard: http://localhost:3000/admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdmin();
