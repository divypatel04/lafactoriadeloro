require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@lafactoria.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('\n📋 Admin User Details:');
    console.log('================================');
    console.log('ID:', admin._id);
    console.log('Email:', admin.email);
    console.log('First Name:', admin.firstName);
    console.log('Last Name:', admin.lastName);
    console.log('Role:', admin.role);
    console.log('Role Type:', typeof admin.role);
    console.log('Is Active:', admin.isActive);
    console.log('Created At:', admin.createdAt);
    console.log('================================\n');

    if (admin.role !== 'admin') {
      console.log('⚠️  WARNING: User role is not "admin"! It is:', admin.role);
      console.log('Fixing role...');
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Role updated to "admin"');
    } else {
      console.log('✅ Admin role is correctly set!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmin();
