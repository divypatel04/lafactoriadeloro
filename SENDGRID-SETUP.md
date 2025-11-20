# SendGrid Setup Guide for Railway

## ⚠️ Why SendGrid?

Railway (and most cloud platforms) **block SMTP ports 587 and 465** for security reasons. This causes email timeouts when using Gmail SMTP.

**Solution**: Use SendGrid's HTTP API instead - it works on all ports and is more reliable in production.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Free SendGrid Account

1. Go to [SendGrid Signup](https://signup.sendgrid.com/)
2. Sign up (free tier includes 100 emails/day - plenty for most sites)
3. Verify your email address

### Step 2: Create API Key

1. Log into SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `Railway Production`
5. Choose **Restricted Access**
6. Enable only: **Mail Send** → **Mail Send** (full access)
7. Click **Create & View**
8. **COPY THE API KEY NOW** (you can't see it again!)
   - Example: `SG.xxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

### Step 3: Verify Sender Email

SendGrid requires you to verify the email you'll send FROM:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name**: La Factoria Del Oro
   - **From Email Address**: samitom11jewelry@gmail.com
   - **Reply To**: samitom11jewelry@gmail.com (or support email)
   - Fill in other required fields (address, city, etc.)
4. Click **Create**
5. Check your email inbox (samitom11jewelry@gmail.com)
6. Click the verification link in the email from SendGrid
7. ✅ Sender verified!

### Step 4: Update Railway Environment Variables

Go to Railway dashboard and add/update these variables:

```bash
# ADD THESE:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
SENDGRID_FROM_EMAIL=samitom11jewelry@gmail.com

# KEEP THESE (for local development fallback):
EMAIL_USER=samitom11jewelry@gmail.com
EMAIL_PASSWORD=khtwhofyrkudmtmw
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Step 5: Deploy and Test

1. The code automatically uses SendGrid if `SENDGRID_API_KEY` is set
2. Railway will redeploy automatically after you save env vars
3. Check Railway logs - you should see:
   ```
   ✅ Using SendGrid for email service (Railway-compatible)
      - Sender: samitom11jewelry@gmail.com
   ```
4. Test password reset or contact form on your site

## 📊 How It Works

```javascript
// The code automatically chooses the best option:

if (SENDGRID_API_KEY exists) {
  → Use SendGrid HTTP API ✅ (works on Railway)
} else {
  → Use Gmail SMTP (works locally, blocked on Railway)
}
```

## 🔍 Troubleshooting

### "403 Forbidden" Error
- Your API key doesn't have Mail Send permission
- Create new API key with **Mail Send** enabled

### "Sender email not verified" Error
- Go to SendGrid dashboard → Settings → Sender Authentication
- Verify your sender email address

### Still getting SMTP timeout on Railway
- Make sure `SENDGRID_API_KEY` is set in Railway (not just .env locally)
- Check Railway logs to confirm it says "Using SendGrid"

### Emails not arriving
- Check SendGrid dashboard → Activity
- Look for bounce/block reports
- Verify sender email is verified (green checkmark)

## 💰 Pricing

- **Free Tier**: 100 emails/day forever
- **Essentials**: $19.95/mo for 50,000 emails/mo
- **Pro**: Custom pricing for higher volumes

For your jewelry store, the free tier should be more than enough!

## 🎯 Summary

1. ✅ Create SendGrid account (free)
2. ✅ Create API key with Mail Send permission
3. ✅ Verify sender email (samitom11jewelry@gmail.com)
4. ✅ Add `SENDGRID_API_KEY` to Railway
5. ✅ Add `SENDGRID_FROM_EMAIL` to Railway
6. ✅ Test on production site

Your emails will now work perfectly on Railway! 🎉
