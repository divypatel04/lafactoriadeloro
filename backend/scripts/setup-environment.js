#!/usr/bin/env node

/**
 * Security Setup Script
 * Generates secure keys and helps configure environment variables
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

async function main() {
  console.log('🔐 La Factoria Del Oro - Security Setup\n');
  console.log('This script will help you generate secure keys and configure your environment.\n');

  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\n❌ Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Generating secure secrets...\n');

  // Generate secrets
  const jwtSecret = generateJWTSecret();
  const sessionSecret = generateSecret(32);

  console.log('✅ JWT Secret generated');
  console.log('✅ Session Secret generated\n');

  // Gather environment information
  console.log('📋 Please provide the following information:\n');

  const nodeEnv = await question('Environment (development/production) [development]: ') || 'development';
  const port = await question('Port [5000]: ') || '5000';
  
  console.log('\n--- Database Configuration ---');
  const mongoUri = await question('MongoDB URI [mongodb://localhost:27017/lafactoria-ecommerce]: ') 
    || 'mongodb://localhost:27017/lafactoria-ecommerce';

  console.log('\n--- Email Configuration ---');
  console.log('Choose email service:');
  console.log('1. Gmail (requires App Password)');
  console.log('2. SendGrid (recommended for production)');
  console.log('3. Skip for now');
  const emailChoice = await question('Choice [1]: ') || '1';

  let emailConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: '587',
    secure: 'false',
    user: '',
    password: '',
    from: 'noreply@lafactoriadeloro.com',
    fromName: 'La Factoria Del Oro'
  };

  if (emailChoice === '1') {
    emailConfig.user = await question('Gmail address: ');
    emailConfig.password = await question('Gmail App Password: ');
  } else if (emailChoice === '2') {
    emailConfig.service = 'sendgrid';
    const sendgridKey = await question('SendGrid API Key: ');
    emailConfig.sendgridKey = sendgridKey;
  }

  console.log('\n--- Payment Configuration ---');
  console.log('Do you have Stripe credentials? (You can add these later)');
  const hasStripe = await question('Configure Stripe now? (y/N): ');
  
  let stripeConfig = {
    secretKey: 'sk_test_your_stripe_secret_key',
    publishableKey: 'pk_test_your_stripe_publishable_key',
    webhookSecret: 'whsec_your_webhook_secret'
  };

  if (hasStripe.toLowerCase() === 'y') {
    stripeConfig.secretKey = await question('Stripe Secret Key: ');
    stripeConfig.publishableKey = await question('Stripe Publishable Key: ');
    stripeConfig.webhookSecret = await question('Stripe Webhook Secret (optional): ') || 'whsec_your_webhook_secret';
  }

  console.log('\n--- Frontend Configuration ---');
  const frontendUrl = await question('Frontend URL [http://localhost:3000]: ') || 'http://localhost:3000';

  console.log('\n🔨 Generating .env file...\n');

  // Build .env content
  let envContent = `# ==================================
# GENERATED: ${new Date().toISOString()}
# ==================================
# IMPORTANT: Never commit this file to version control!
# This file contains sensitive credentials.
# ==================================

# ==================================
# SERVER CONFIGURATION
# ==================================
PORT=${port}
NODE_ENV=${nodeEnv}

# ==================================
# DATABASE
# ==================================
MONGODB_URI=${mongoUri}

# ==================================
# JWT CONFIGURATION
# ==================================
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
RESET_TOKEN_EXPIRE=30

# ==================================
# SESSION CONFIGURATION
# ==================================
SESSION_SECRET=${sessionSecret}

# ==================================
# EMAIL CONFIGURATION
# ==================================
EMAIL_SERVICE=${emailConfig.service}
EMAIL_HOST=${emailConfig.host}
EMAIL_PORT=${emailConfig.port}
EMAIL_SECURE=${emailConfig.secure}
EMAIL_USER=${emailConfig.user}
EMAIL_PASSWORD=${emailConfig.password}
EMAIL_FROM=${emailConfig.from}
EMAIL_FROM_NAME=${emailConfig.fromName}
${emailConfig.sendgridKey ? `SENDGRID_API_KEY=${emailConfig.sendgridKey}` : ''}

# ==================================
# PAYMENT GATEWAY - STRIPE
# ==================================
STRIPE_SECRET_KEY=${stripeConfig.secretKey}
STRIPE_PUBLISHABLE_KEY=${stripeConfig.publishableKey}
STRIPE_WEBHOOK_SECRET=${stripeConfig.webhookSecret}

# PayPal (Optional - configure if needed)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# ==================================
# FRONTEND URL
# ==================================
FRONTEND_URL=${frontendUrl}

# ==================================
# FILE UPLOAD CONFIGURATION
# ==================================
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# ==================================
# SECURITY CONFIGURATION
# ==================================
# Rate Limiting (15 min window)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=${nodeEnv === 'production' ? '100' : '1000'}

# CORS Origins (comma-separated)
CORS_ORIGIN=${frontendUrl}

# ==================================
# BUSINESS CONFIGURATION
# ==================================
TAX_RATE=8
CURRENCY_CODE=USD
CURRENCY_SYMBOL=$
BUSINESS_EMAIL=contact@lafactoriadeloro.com
BUSINESS_PHONE=+1-xxx-xxx-xxxx

# ==================================
# EXTERNAL SERVICES (Optional)
# ==================================
# Google Analytics
# GA_TRACKING_ID=UA-XXXXXXXXX-X

# Sentry Error Tracking
# SENTRY_DSN=your_sentry_dsn

# ==================================
# DEVELOPMENT/DEBUG
# ==================================
DEBUG=false
LOG_LEVEL=${nodeEnv === 'development' ? 'debug' : 'info'}
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent.trim());

  console.log('✅ .env file created successfully!\n');
  console.log('📋 Summary:');
  console.log(`   Environment: ${nodeEnv}`);
  console.log(`   Port: ${port}`);
  console.log(`   Database: ${mongoUri.includes('localhost') ? 'Local MongoDB' : 'Remote MongoDB'}`);
  console.log(`   Email: ${emailConfig.service === 'gmail' ? 'Gmail' : emailConfig.service === 'sendgrid' ? 'SendGrid' : 'Not configured'}`);
  console.log(`   Stripe: ${hasStripe.toLowerCase() === 'y' ? 'Configured' : 'Not configured'}`);
  console.log(`   Frontend: ${frontendUrl}\n`);

  console.log('🔒 Security Keys Generated:');
  console.log('   ✓ JWT Secret (128 characters)');
  console.log('   ✓ Session Secret (64 characters)\n');

  console.log('⚠️  IMPORTANT NEXT STEPS:');
  console.log('   1. Review the .env file and update any placeholder values');
  console.log('   2. Never commit .env to version control (already in .gitignore)');
  console.log('   3. Keep .env.example updated with structure (but no real values)');
  
  if (emailChoice === '1' && !emailConfig.user) {
    console.log('   4. Configure email credentials in .env file');
  }
  
  if (hasStripe.toLowerCase() !== 'y') {
    console.log('   5. Add Stripe credentials when ready for payment processing');
  }

  console.log('\n📚 For more information, see:');
  console.log('   - PRODUCTION_TODO.md (production checklist)');
  console.log('   - PRICING_SYSTEM.md (pricing configuration)\n');

  console.log('✨ Setup complete! You can now start the server.\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Error during setup:', error.message);
  rl.close();
  process.exit(1);
});
