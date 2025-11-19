# ⚡ Quick Deployment Reference

## 🔗 URLs You Need

### After Deployment:
- **Frontend (Vercel):** `https://your-app.vercel.app`
- **Backend (Railway):** `https://your-app.railway.app`
- **API Endpoint:** `https://your-app.railway.app/api`

---

## 🎯 Key Environment Variables

### Railway (Backend) - MUST SET:
```bash
FRONTEND_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-min-32-chars
STRIPE_SECRET_KEY=sk_live_xxxxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Vercel (Frontend) - MUST SET:
```bash
REACT_APP_API_URL=https://your-app.railway.app/api
```

---

## 📋 Deployment Steps

### 1️⃣ Deploy Backend First (Railway)
1. Create Railway project
2. Connect GitHub repo (backend folder)
3. Add all environment variables above
4. Note your Railway URL: `https://xxxxx.railway.app`

### 2️⃣ Deploy Frontend (Vercel)
1. Create Vercel project
2. Connect GitHub repo (frontend folder)
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://xxxxx.railway.app/api`
4. Deploy
5. Note your Vercel URL: `https://xxxxx.vercel.app`

### 3️⃣ Update Backend CORS
1. Go back to Railway
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy

---

## ✅ Test Everything Works

```bash
# Test backend
curl https://your-app.railway.app/api/health

# Test frontend
# Open https://your-app.vercel.app in browser
# Try to browse products
# Check browser console for errors
```

---

## 🔴 Common Issues

### CORS Error
❌ **Error:** `Access to fetch has been blocked by CORS policy`
✅ **Fix:** Make sure `FRONTEND_URL` on Railway matches your Vercel URL exactly

### Network Error
❌ **Error:** `Network Error` or API calls fail
✅ **Fix:** Check `REACT_APP_API_URL` on Vercel points to Railway API

### Can't Login/Register
❌ **Error:** Auth endpoints fail
✅ **Fix:** Check `JWT_SECRET` is set on Railway

### Payments Fail
❌ **Error:** Stripe checkout doesn't work
✅ **Fix:** 
- Use live keys (not test keys)
- Set up webhook on Stripe Dashboard
- Point to: `https://your-app.railway.app/api/payment/webhook`

---

## 🔄 How They Communicate

```
Browser
  ↓
Vercel (React App)
  ↓ Sends request to REACT_APP_API_URL
Railway (Express API)
  ↓ Checks CORS with FRONTEND_URL
  ↓ Processes request
  ↓ Queries MongoDB
  ↓ Sends response back
Vercel (React App)
  ↓
Browser (Shows result)
```

---

## 📝 Remember

1. **Backend must be deployed FIRST**
2. **Get Railway URL before deploying frontend**
3. **Update frontend env with Railway URL**
4. **Update backend env with Vercel URL**
5. **Redeploy after env variable changes**

---

## 🆘 Quick Checklist

- [ ] Railway has `FRONTEND_URL` set to Vercel URL
- [ ] Vercel has `REACT_APP_API_URL` set to Railway API
- [ ] MongoDB Atlas allows connections from Railway
- [ ] Stripe webhook points to Railway URL
- [ ] Email credentials are correct (Gmail app password)
- [ ] Test: Can browse products
- [ ] Test: Can login/register
- [ ] Test: Can checkout
- [ ] Test: Emails are sent
- [ ] Test: Admin panel works

Done! 🎉
