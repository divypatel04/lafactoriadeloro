# 🚀 QUICK START - SendGrid Setup for Railway

## Why This Is Needed
Railway blocks SMTP ports → Gmail SMTP fails with ETIMEDOUT → SendGrid uses HTTP API (not blocked)

---

## ⏱️ 5-Minute Setup Checklist

### ☐ 1. Create SendGrid Account (2 min)
- Go to: https://signup.sendgrid.com/
- Sign up (FREE - 100 emails/day)
- Verify your email

### ☐ 2. Get API Key (1 min)
- Login → Settings → API Keys
- Create API Key → Name: "Railway"
- Permission: **Mail Send** only
- Copy the key: `SG.xxxxxxxxxxxxxxxx...`

### ☐ 3. Verify Sender (2 min)
- Settings → Sender Authentication
- Verify Single Sender
- Email: **samitom11jewelry@gmail.com**
- Fill form → Submit
- Check email → Click verification link

### ☐ 4. Update Railway (30 sec)
Add these 2 variables to Railway dashboard:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx...
SENDGRID_FROM_EMAIL=samitom11jewelry@gmail.com
```

### ☐ 5. Verify It Works
- Railway will auto-redeploy
- Check logs for: `✅ Using SendGrid for email service`
- Test password reset on site

---

## 📋 Railway Environment Variables (COMPLETE LIST)

```bash
# SendGrid (NEW - Required for Railway)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
SENDGRID_FROM_EMAIL=samitom11jewelry@gmail.com

# Gmail SMTP (Keep for local dev)
EMAIL_USER=samitom11jewelry@gmail.com
EMAIL_PASSWORD=khtwhofyrkudmtmw
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Other (existing)
MONGODB_URI=mongodb+srv://divy:divy0406@cluster0.h6aaprs.mongodb.net/lafactoria-ecommerce
FRONTEND_URL=https://lafactoriadeloro.vercel.app
JWT_SECRET=(your secret)
```

---

## ✅ Expected Railway Logs

**Before (SMTP - FAILS):**
```
📧 Attempting to connect to smtp.gmail.com:465
❌ Error Code: ETIMEDOUT
```

**After (SendGrid - WORKS):**
```
✅ Using SendGrid for email service (Railway-compatible)
   - Sender: samitom11jewelry@gmail.com
✅ Email sent successfully via SendGrid
```

---

## 🔗 Quick Links

- SendGrid Signup: https://signup.sendgrid.com/
- API Keys Page: https://app.sendgrid.com/settings/api_keys
- Sender Verification: https://app.sendgrid.com/settings/sender_auth
- Activity Dashboard: https://app.sendgrid.com/email_activity

---

## 💡 How It Works

```
Code checks:
  Is SENDGRID_API_KEY set?
    YES → Use SendGrid HTTP API ✅ (Railway)
    NO  → Use Gmail SMTP (local dev only)
```

Your local development still uses Gmail SMTP (no changes needed).
Railway automatically uses SendGrid when you add the API key.

---

## ❓ Troubleshooting

| Error | Solution |
|-------|----------|
| Still getting ETIMEDOUT | Make sure SENDGRID_API_KEY is in Railway dashboard |
| 403 Forbidden | API key needs Mail Send permission |
| Sender not verified | Verify sender email in SendGrid dashboard |
| Emails not arriving | Check SendGrid Activity dashboard for blocks |

---

**That's it! Your emails will work on Railway. 🎉**

Full guide: See `SENDGRID-SETUP.md`
