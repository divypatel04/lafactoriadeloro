@echo off
REM Environment Setup Script for La Factoria Del Oro (Windows)
REM Run this script to generate secure environment variables

echo ========================================== 
echo La Factoria Del Oro - Environment Setup
echo ==========================================
echo.

REM Generate JWT Secret using Node.js
echo Generating JWT Secret...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"') do set JWT_SECRET=%%i
echo JWT Secret generated
echo.

REM Create backend .env file
echo Creating backend\.env file...
(
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo FRONTEND_URL=http://localhost:3000
echo CLIENT_URL=http://localhost:3000
echo.
echo # Database
echo MONGODB_URI=mongodb://localhost:27017/lafactoria
echo.
echo # JWT Configuration
echo JWT_SECRET=%JWT_SECRET%
echo JWT_EXPIRE=7d
echo JWT_COOKIE_EXPIRE=7
echo.
echo # Email Configuration
echo # Option 1: Gmail ^(for testing^)
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_USER=your_email@gmail.com
echo EMAIL_PASSWORD=your_app_password
echo.
echo # Option 2: SendGrid ^(recommended for production^)
echo # EMAIL_HOST=smtp.sendgrid.net
echo # EMAIL_PORT=587
echo # EMAIL_USER=apikey
echo # EMAIL_PASSWORD=SG.your_sendgrid_api_key
echo.
echo # File Upload
echo MAX_FILE_UPLOAD=10000000
echo FILE_UPLOAD_PATH=./uploads
echo.
echo # Stripe Payment Gateway
echo STRIPE_SECRET_KEY=your_stripe_secret_key_here_get_from_stripe_dashboard
echo STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
echo STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
echo.
echo # Admin
echo ADMIN_EMAIL=admin@lafactoriadeloro.com
) > backend\.env

echo backend\.env created successfully!
echo.

echo ==========================================
echo NEXT STEPS:
echo ==========================================
echo.
echo 1. Update backend\.env with your credentials:
echo    - MongoDB connection string ^(if using Atlas^)
echo    - Email service credentials
echo    - Stripe API keys
echo.
echo 2. Install dependencies:
echo    cd backend ^&^& npm install
echo    cd frontend ^&^& npm install
echo.
echo 3. Start development servers:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo.
echo 4. For email setup instructions, see PRODUCTION_READY.md
echo.
echo Your JWT Secret has been automatically generated!
echo Keep your .env file secure and never commit it to git
echo.
pause
