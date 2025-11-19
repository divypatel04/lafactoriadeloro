# Quick Start Guide

## 🚀 Get Your E-commerce Platform Running in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
# Backend
cd d:/Projects/lafactoriadeloro/la-factoria-ecommerce/backend
npm install

# Frontend (open new terminal)
cd d:/Projects/lafactoriadeloro/la-factoria-ecommerce/frontend
npm install
```

### Step 2: Configure Environment (1 minute)

**Backend:** Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lafactoria
JWT_SECRET=my-super-secret-jwt-key-2024
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=La Factoria <noreply@lafactoria.com>
FRONTEND_URL=http://localhost:3000
```

**Frontend:** Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB (30 seconds)

Make sure MongoDB is running:
```bash
# Windows
mongod

# Or if using MongoDB service
net start MongoDB
```

### Step 4: Run the Application (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
✅ Frontend running at `http://localhost:3000`

### Step 5: Create Admin Account

**Option A - Using API (Postman/Insomnia):**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@lafactoria.com",
  "password": "Admin123!",
  "role": "admin"
}
```

**Option B - Using MongoDB:**
```bash
mongosh
use lafactoria
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## 🎯 What's Next?

1. **Test the Application:**
   - Visit `http://localhost:3000`
   - Register a customer account
   - Browse products (Shop page)
   - Test cart functionality

2. **Add Sample Products:**
   - Login as admin
   - Go to `/admin/products`
   - Add products with variants

3. **Customize:**
   - Update colors in `frontend/src/index.css`
   - Add your logo to `frontend/public/`
   - Configure email settings for notifications

## 📋 Testing Checklist

- [ ] Backend API responds at `http://localhost:5000/api`
- [ ] Frontend loads at `http://localhost:3000`
- [ ] User registration works
- [ ] User login works
- [ ] Products display on Shop page
- [ ] Cart functionality works
- [ ] Admin can access `/admin` routes

## 🐛 Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Make sure MongoDB is running (`mongod` command)

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Fix:** Change PORT in `backend/.env` to 5001

### CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Check FRONTEND_URL in backend `.env` matches your frontend URL

### Email Not Sending
```
Error: Invalid login credentials
```
**Fix:** 
1. Enable "Less secure app access" in Gmail (or use App Password)
2. Use App Password from Google Account Security settings

## 📚 Next Steps

- Read [README.md](README.md) for complete documentation
- Check [backend/README.md](backend/README.md) for API details
- Review [frontend/README.md](frontend/README.md) for component structure

## 🆘 Need Help?

- Check console logs for errors
- Review `.env` configuration
- Ensure all dependencies are installed
- Verify MongoDB connection

Happy coding! 🎉
