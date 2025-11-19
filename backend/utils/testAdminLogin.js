require('dotenv').config();
const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@lafactoria.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!\n');
    console.log('📋 Response Data:');
    console.log('================================');
    console.log('Success:', response.data.success);
    console.log('Token exists:', !!response.data.token);
    console.log('Token (first 20 chars):', response.data.token?.substring(0, 20) + '...');
    console.log('\n👤 User Object:');
    console.log(JSON.stringify(response.data.user, null, 2));
    console.log('================================\n');
    
    console.log('🔍 User Role Check:');
    console.log('user.role value:', response.data.user.role);
    console.log('user.role type:', typeof response.data.user.role);
    console.log('Is admin?:', response.data.user.role === 'admin');
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Error:', error.response?.data || error.message);
  }
}

testAdminLogin();
