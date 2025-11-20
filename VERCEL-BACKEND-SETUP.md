# Deploying Backend to Vercel

## ✅ Why Vercel for Backend?

- ✅ **SMTP ports work** - No email timeout issues
- ✅ **Serverless functions** - Auto-scaling
- ✅ **Free tier** - Generous limits
- ✅ **Fast deployments** - GitHub integration
- ✅ **Same platform** - Frontend + Backend on Vercel

## 🚀 Quick Setup (5 minutes)

### Step 1: Create `vercel.json` in Backend

I'll create this file for you with the right configuration.

### Step 2: Deploy Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repo: `divypatel04/lafactoriadeloro`
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### Step 3: Set Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://divy:divy0406@cluster0.h6aaprs.mongodb.net/lafactoria-ecommerce

# JWT
JWT_SECRET=your_jwt_secret_here_use_random_string
JWT_EXPIRE=7d
RESET_TOKEN_EXPIRE=30

# Email (Gmail SMTP - works on Vercel!)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=samitom11jewelry@gmail.com
EMAIL_PASSWORD=khtwhofyrkudmtmw

# Frontend URL
FRONTEND_URL=https://lafactoriadeloro.vercel.app

# Port (Vercel handles this automatically)
PORT=5000
```

### Step 4: Update Frontend API URL

After backend is deployed, update frontend environment variable:

**In Vercel Frontend Project** → Settings → Environment Variables:
```bash
REACT_APP_API_URL=https://your-backend-project.vercel.app
```

Replace `your-backend-project` with your actual Vercel backend URL.

### Step 5: Redeploy Frontend

After updating the API URL, trigger a redeploy of your frontend in Vercel.

## 📁 Required File Structure

Your backend needs a `vercel.json` file (I'll create this):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## ✅ Benefits of Vercel Backend

### 1. **SMTP Works** ✅
```
Local Dev: SMTP ✅
Railway:   SMTP ❌ (blocked)
Vercel:    SMTP ✅ (works!)
```

### 2. **Serverless Advantages**
- Auto-scaling
- Pay only for what you use
- No cold starts (with enough traffic)
- Global edge network

### 3. **Easy Deployment**
- Push to GitHub → Auto-deploy
- Preview deployments for branches
- Rollback with one click

## 🔄 Migration from Railway

### What to do:
1. ✅ Deploy backend to Vercel (keep same env vars)
2. ✅ Update `REACT_APP_API_URL` in frontend
3. ✅ Redeploy frontend
4. ✅ Test email functionality (should work now!)
5. ⚠️ Delete Railway project (optional, to avoid charges)

### What stays the same:
- MongoDB connection string
- Email credentials
- JWT settings
- All your code

## 🧪 Testing After Deployment

1. Check Vercel Functions logs for:
   ```
   ✅ SMTP email service verified and ready to send emails
      - Using: samitom11jewelry@gmail.com
      - Host: smtp.gmail.com:587
   ```

2. Test API endpoints:
   ```
   https://your-backend.vercel.app/api/products
   ```

3. Test email (password reset):
   - Go to your site
   - Click "Forgot Password"
   - Enter email
   - Check inbox ✅

## 📊 Vercel Limits (Free Tier)

- **Bandwidth**: 100GB/month
- **Serverless Function Executions**: 100GB-hours/month
- **Build Minutes**: 6,000 minutes/month
- **No limit on projects**

More than enough for most e-commerce stores!

## ❓ Troubleshooting

### Email still not working
- Check Vercel Functions logs for errors
- Verify EMAIL_PASSWORD in Vercel env vars (no spaces)
- Make sure Gmail App Password is still valid

### API calls failing
- Update REACT_APP_API_URL in frontend to new Vercel backend URL
- Check CORS configuration includes Vercel frontend URL
- Verify FRONTEND_URL env var in backend matches frontend URL

### Serverless timeout
- Vercel functions have 10s timeout on free tier
- Optimize slow database queries
- Consider upgrading if needed

## 🎯 Final Checklist

- [ ] Created vercel.json in backend folder
- [ ] Deployed backend to Vercel
- [ ] Added all environment variables
- [ ] Updated REACT_APP_API_URL in frontend
- [ ] Redeployed frontend
- [ ] Tested API endpoints
- [ ] Tested email functionality
- [ ] Deleted Railway project (optional)

---

**Your backend will now work perfectly on Vercel with Gmail SMTP! 🎉**
