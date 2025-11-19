#!/bin/bash

# La Factoria E-commerce Setup Script
# This script helps you set up the development environment

echo "🚀 La Factoria E-commerce - Development Setup"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB not found in PATH. Make sure MongoDB is installed.${NC}"
else
    echo -e "${GREEN}✅ MongoDB found${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if npm install; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
if npm install; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ Created backend/.env from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env.example found. Creating basic .env file...${NC}"
        cat > backend/.env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lafactoria
JWT_SECRET=change-this-to-a-random-secret-key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=La Factoria <noreply@lafactoria.com>
FRONTEND_URL=http://localhost:3000
EOF
        echo -e "${GREEN}✅ Created backend/.env${NC}"
        echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
    fi
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
    echo -e "${GREEN}✅ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✅ frontend/.env already exists${NC}"
fi

echo ""
echo "============================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update backend/.env with your email credentials"
echo "2. Make sure MongoDB is running:"
echo "   mongod"
echo ""
echo "3. Start the backend (in one terminal):"
echo "   cd backend && npm run dev"
echo ""
echo "4. Start the frontend (in another terminal):"
echo "   cd frontend && npm start"
echo ""
echo "5. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "📚 For more information, see:"
echo "   - README.md (Complete documentation)"
echo "   - QUICKSTART.md (Quick start guide)"
echo ""
echo "Happy coding! 🎉"
