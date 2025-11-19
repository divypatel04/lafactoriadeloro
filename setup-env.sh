#!/bin/bash
# Environment Setup Script for La Factoria Del Oro
# Run this script to generate secure environment variables

echo "🚀 La Factoria Del Oro - Environment Setup"
echo "=========================================="
echo ""

# Generate JWT Secret
echo "📝 Generating JWT Secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
echo "✅ JWT Secret generated"
echo ""

# Create backend .env file
echo "Creating backend/.env file..."
cat > backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/lafactoria

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email Configuration
# Option 1: Gmail (for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Option 2: SendGrid (recommended for production)
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASSWORD=SG.your_sendgrid_api_key

# File Upload
MAX_FILE_UPLOAD=10000000
FILE_UPLOAD_PATH=./uploads

# Stripe Payment Gateway
STRIPE_SECRET_KEY=your_stripe_secret_key_here_get_from_stripe_dashboard
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Admin
ADMIN_EMAIL=admin@lafactoriadeloro.com
EOF

echo "✅ backend/.env created"
echo ""

echo "📋 NEXT STEPS:"
echo ""
echo "1. Update backend/.env with your credentials:"
echo "   - MongoDB connection string (if using Atlas)"
echo "   - Email service credentials"
echo "   - Stripe API keys"
echo ""
echo "2. Install dependencies:"
echo "   cd backend && npm install"
echo "   cd frontend && npm install"
echo ""
echo "3. Start development servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "4. For email setup instructions, see PRODUCTION_READY.md"
echo ""
echo "🔑 Your JWT Secret has been automatically generated!"
echo "⚠️  Keep your .env file secure and never commit it to git"
echo ""
