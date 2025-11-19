# 🚀 Deployment Guide - La Factoria del Oro E-commerce

This guide explains how to deploy your application with **Frontend on Vercel** and **Backend on Railway**.

## 📋 Table of Contents
- [Overview](#overview)
- [Backend Deployment (Railway)](#backend-deployment-railway)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## 🌐 Overview

### Architecture
```
┌─────────────────┐         ┌─────────────────┐
│   Vercel        │  HTTPS  │   Railway       │
│  (Frontend)     │────────▶│  (Backend API)  │
│  React App      │         │  Node.js/Express│
└─────────────────┘         └─────────────────┘
         │                           │
         │                           │
         └───────────────┬───────────┘
                         ▼
                  ┌─────────────┐
                  │  MongoDB    │
                  │  Atlas      │
                  └─────────────┘
```

### Communication Flow
1. **Frontend (Vercel)** makes API calls to `REACT_APP_API_URL`
2. **Backend (Railway)** accepts requests from `FRONTEND_URL` (CORS)
3. **Backend** processes requests and communicates with MongoDB Atlas
4. **Backend** sends responses back to Frontend

---

## 🚂 Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Connect your GitHub repository** or upload your backend code

### Step 2: Configure Environment Variables on Railway

Go to your Railway project → Variables tab and add these:

```bash
# Server
NODE_ENV=production
PORT=5000

# Frontend URL (Your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lafactoria-prod?retryWrites=true&w=majority

# JWT Secrets (Generate new ones for production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
RESET_TOKEN_EXPIRE=30

# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=La Factoria del Oro <your-email@gmail.com>

# Stripe (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Admin User (Optional - for initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

### Step 3: Deploy Backend

1. Railway will automatically detect Node.js and deploy
2. Note your Railway backend URL: `https://your-app.railway.app`
3. Your API will be available at: `https://your-app.railway.app/api`

### Step 4: Test Backend

Test your backend is working:
```bash
curl https://your-app.railway.app/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

## ▲ Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

### Step 2: Configure Environment Variables on Vercel

#### Option A: Via Vercel Dashboard
1. Go to your project → Settings → Environment Variables
2. Add this variable:

```bash
REACT_APP_API_URL=https://your-app.railway.app/api
```

#### Option B: Via `.env.production` file

Create `frontend/.env.production`:
```bash
REACT_APP_API_URL=https://your-app.railway.app/api
```

### Step 3: Create Vercel Configuration

Create `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 4: Deploy Frontend

#### Via GitHub (Recommended):
1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Vercel will auto-detect React and deploy
4. Add environment variable: `REACT_APP_API_URL`

#### Via Vercel CLI:
```bash
cd frontend
vercel --prod
```

### Step 5: Get Your Vercel URL

After deployment, you'll get: `https://your-app.vercel.app`

### Step 6: Update Backend CORS

**IMPORTANT:** Go back to Railway and update `FRONTEND_URL`:
```bash
FRONTEND_URL=https://your-app.vercel.app
```

This allows your backend to accept requests from your frontend.

---

## 🔐 Environment Variables Reference

### Backend (.env on Railway)

| Variable | Example | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Server port (Railway sets this) |
| `FRONTEND_URL` | `https://your-app.vercel.app` | **CRITICAL: Your Vercel frontend URL** |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `random-32-char-string` | JWT signing secret |
| `JWT_EXPIRE` | `7d` | Token expiry |
| `EMAIL_SERVICE` | `gmail` | Email service provider |
| `EMAIL_USER` | `your@email.com` | Email account |
| `EMAIL_PASSWORD` | `app-password` | Email app password |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook secret |

### Frontend (.env on Vercel)

| Variable | Example | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `https://your-app.railway.app/api` | **CRITICAL: Your Railway backend API URL** |

---

## ✅ Post-Deployment Checklist

### 1. Test Backend API
```bash
# Health check
curl https://your-app.railway.app/api/health

# Test auth endpoint
curl https://your-app.railway.app/api/auth/test
```

### 2. Test Frontend to Backend Connection
1. Open `https://your-app.vercel.app`
2. Open browser console (F12)
3. Try to login or fetch products
4. Check Network tab - requests should go to Railway URL

### 3. Verify CORS is Working
- If you see CORS errors, check `FRONTEND_URL` on Railway
- Must match your Vercel URL exactly (no trailing slash)

### 4. Test Full User Flow
- [ ] User Registration
- [ ] User Login
- [ ] Browse Products
- [ ] Add to Cart
- [ ] Checkout Process
- [ ] Payment (Stripe)
- [ ] Email Notifications

### 5. Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.railway.app/api/payment/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret to Railway `STRIPE_WEBHOOK_SECRET`

### 6. Set Up MongoDB Atlas
1. Whitelist Railway's IP (or use 0.0.0.0/0 for all IPs)
2. Create database user with read/write permissions
3. Get connection string and add to Railway

---

## 🔧 Troubleshooting

### Problem: "CORS Error" in Browser Console

**Cause:** Backend doesn't recognize frontend URL

**Solution:**
1. Check Railway environment variable `FRONTEND_URL`
2. Must match Vercel URL exactly: `https://your-app.vercel.app`
3. No trailing slash
4. Restart Railway deployment after changing

### Problem: "Network Error" or "Failed to Fetch"

**Cause:** Frontend can't reach backend

**Solution:**
1. Check Vercel environment variable `REACT_APP_API_URL`
2. Should be: `https://your-app.railway.app/api`
3. Test backend URL manually in browser
4. Redeploy frontend after changing environment variable

### Problem: "Cannot connect to MongoDB"

**Cause:** MongoDB Atlas not configured or connection string wrong

**Solution:**
1. Check MongoDB Atlas → Network Access → Add IP Address → Allow All (0.0.0.0/0)
2. Verify `MONGODB_URI` in Railway
3. Check database user has correct permissions
4. Test connection string format

### Problem: Stripe Payments Not Working

**Cause:** Webhook secret or API keys incorrect

**Solution:**
1. Use LIVE keys in production (start with `sk_live_`)
2. Configure webhook in Stripe Dashboard
3. Point webhook to Railway URL: `/api/payment/webhook`
4. Copy webhook secret to Railway

### Problem: Emails Not Sending

**Cause:** Email credentials wrong or app password not set

**Solution:**
1. For Gmail: Enable 2FA and create App Password
2. Use App Password in `EMAIL_PASSWORD`, not regular password
3. Check `EMAIL_USER` and `EMAIL_FROM` are correct
4. Test with a simple order

---

## 📱 How Frontend & Backend Communicate

### 1. Frontend Makes Request
```javascript
// In frontend/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL; // https://your-app.railway.app/api

axios.get(`${API_URL}/products`)
```

### 2. Backend Receives Request
```javascript
// In backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL, // https://your-app.vercel.app
  credentials: true
}));
```

### 3. Backend Processes & Responds
```javascript
// Backend sends JSON response
res.json({ success: true, data: products });
```

### 4. Frontend Receives Response
```javascript
// Frontend processes data
const response = await api.get('/products');
setProducts(response.data.data);
```

---

## 🔄 Deployment Workflow

### Making Changes

#### Backend Changes:
1. Push code to GitHub
2. Railway auto-deploys
3. Check deployment logs
4. Test API endpoints

#### Frontend Changes:
1. Push code to GitHub
2. Vercel auto-deploys
3. Check build logs
4. Test on production URL

### Environment Variable Changes:
1. Update in Railway/Vercel dashboard
2. Trigger manual redeploy
3. Clear browser cache
4. Test changes

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Stripe Webhooks:** https://stripe.com/docs/webhooks

---

## 🆘 Need Help?

If you encounter issues:
1. Check Railway logs: Railway Dashboard → Deployments → Logs
2. Check Vercel logs: Vercel Dashboard → Deployments → Logs
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set correctly

---

**Remember:** After any environment variable change, you must redeploy!
