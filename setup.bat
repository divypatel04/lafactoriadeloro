@echo off
REM La Factoria E-commerce Setup Script for Windows
REM This script helps you set up the development environment

echo.
echo ========================================
echo La Factoria E-commerce - Development Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)
echo [OK] Node.js found
for /f "delims=" %%i in ('node --version') do set NODE_VERSION=%%i
echo     Version: %NODE_VERSION%

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found in PATH. Make sure MongoDB is installed.
) else (
    echo [OK] MongoDB found
)

echo.
echo Installing dependencies...
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

REM Setup environment files
echo.
echo Setting up environment files...

REM Backend .env
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [OK] Created backend\.env from .env.example
        echo [WARNING] Please update backend\.env with your configuration
    ) else (
        echo [WARNING] No .env.example found. Creating basic .env file...
        (
            echo PORT=5000
            echo NODE_ENV=development
            echo MONGODB_URI=mongodb://localhost:27017/lafactoria
            echo JWT_SECRET=change-this-to-a-random-secret-key
            echo JWT_EXPIRE=7d
            echo EMAIL_HOST=smtp.gmail.com
            echo EMAIL_PORT=587
            echo EMAIL_USER=your-email@gmail.com
            echo EMAIL_PASS=your-app-password
            echo EMAIL_FROM=La Factoria ^<noreply@lafactoria.com^>
            echo FRONTEND_URL=http://localhost:3000
        ) > "backend\.env"
        echo [OK] Created backend\.env
        echo [WARNING] Please update backend\.env with your configuration
    )
) else (
    echo [OK] backend\.env already exists
)

REM Frontend .env
if not exist "frontend\.env" (
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > "frontend\.env"
    echo [OK] Created frontend\.env
) else (
    echo [OK] frontend\.env already exists
)

echo.
echo ========================================
echo [OK] Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Update backend\.env with your email credentials
echo.
echo 2. Make sure MongoDB is running:
echo    mongod
echo.
echo 3. Start the backend (in one terminal):
echo    cd backend
echo    npm run dev
echo.
echo 4. Start the frontend (in another terminal):
echo    cd frontend
echo    npm start
echo.
echo 5. Open your browser to:
echo    http://localhost:3000
echo.
echo For more information, see:
echo    - README.md (Complete documentation)
echo    - QUICKSTART.md (Quick start guide)
echo.
echo Happy coding!
echo.
pause
