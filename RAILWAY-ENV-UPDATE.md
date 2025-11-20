# URGENT: Railway Environment Variable Update

## 🚨 CORS Error Fix - Action Required

### Problem
Your frontend (Vercel) cannot communicate with backend (Railway) due to CORS configuration error.

**Error**: `The 'Access-Control-Allow-Origin' header has a value 'https://lafactoriadeloro.vercel.app/' that is not equal to the supplied origin`

The issue is a **trailing slash** in the FRONTEND_URL environment variable.

### ✅ Code Fixed
I've updated the backend CORS configuration to:
1. Handle multiple origins (localhost + Vercel)
2. Automatically remove trailing slashes
3. Support all necessary HTTP methods
4. Allow credentials

### 🔧 Railway Environment Variable Update

You need to update the `FRONTEND_URL` in Railway:

#### Step 1: Go to Railway Dashboard
1. Open https://railway.app/
2. Navigate to your project: `lafactoriadeloro-production`
3. Click on your backend service

#### Step 2: Update Environment Variables
1. Click on "Variables" tab
2. Find `FRONTEND_URL`
3. **Change from**: `https://lafactoriadeloro.vercel.app/` (with slash)
4. **Change to**: `https://lafactoriadeloro.vercel.app` (without slash)

#### OR if variable doesn't exist, add it:
```
FRONTEND_URL=https://lafactoriadeloro.vercel.app
```

**IMPORTANT**: No trailing slash at the end!

#### Step 3: Redeploy
After saving the environment variable, Railway will automatically redeploy your backend.

### ⚡ Quick Fix via Railway CLI (Alternative)

If you have Railway CLI installed:

```bash
cd la-factoria-ecommerce/backend
railway variables set FRONTEND_URL=https://lafactoriadeloro.vercel.app
```

### 🔍 Verify Environment Variables

Make sure these are set in Railway:

```bash
# Database
MONGODB_URI=mongodb+srv://divy:divy0406@cluster0.h6aaprs.mongodb.net/lafactoria-ecommerce

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Frontend (IMPORTANT - NO TRAILING SLASH!)
FRONTEND_URL=https://lafactoriadeloro.vercel.app

# Stripe (if using)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_FROM=noreply@lafactoriadeloro.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=production
```

### 🧪 Test After Deployment

1. Wait for Railway to finish deployment (2-3 minutes)
2. Open your frontend: https://lafactoriadeloro.vercel.app
3. Check browser console for errors
4. Try navigating to different pages
5. All API requests should work now

### 📝 What Changed in Code

**File**: `backend/server.js`

**Before**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

**After**:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://lafactoriadeloro.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean).map(origin => origin.replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 🚀 Next Steps

1. **Update Railway environment variable** (FRONTEND_URL without trailing slash)
2. **Wait for auto-deployment** (Railway will redeploy automatically)
3. **Test your site** (https://lafactoriadeloro.vercel.app)
4. **Monitor Railway logs** for any errors

### 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Your Frontend**: https://lafactoriadeloro.vercel.app
- **Your Backend**: https://lafactoriadeloro-production.up.railway.app
- **Backend Health Check**: https://lafactoriadeloro-production.up.railway.app/api/health

### 📊 Check Railway Logs

If still having issues after updating:

1. Go to Railway dashboard
2. Click on your backend service
3. Click "Deployments" tab
4. Click on latest deployment
5. Check logs for CORS errors

### ❓ Troubleshooting

**If CORS errors persist:**

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check Railway logs** for startup errors
4. **Verify MongoDB connection** is working
5. **Check all environment variables** are set correctly

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Still getting CORS error | Clear browser cache, hard refresh |
| 502 Bad Gateway | Check Railway logs, verify MongoDB URI |
| Cannot connect to database | Verify MongoDB Atlas credentials |
| Environment variable not updating | Redeploy manually in Railway |

### 🎉 Expected Result

After fixing, you should see in browser console:
```
✅ Successfully connected to backend
✅ Categories loaded
✅ Products loaded
✅ Sliders loaded
```

No more CORS errors! 🎊

---

**Created**: Now
**Priority**: 🔥 URGENT - Deploy immediately
**Estimated Fix Time**: 2-3 minutes (just update env variable)
