const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
require('dotenv').config();

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@lafactoria.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📧 Email: admin@lafactoria.com');
      console.log('🔑 Password: admin123');
      console.log('\n🌐 Login at: http://localhost:3000/login');
      console.log('🎯 Admin Dashboard: http://localhost:3000/admin\n');
      process.exit(0);
    }

    // Create admin user
    // Note: Don't hash password here, the User model's pre-save hook will do it
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lafactoria.com',
      password: 'admin123', // Plain password - will be hashed by model
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!\n');
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
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
