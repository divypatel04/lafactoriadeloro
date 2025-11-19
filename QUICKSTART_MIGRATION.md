# 🚀 Quick Start: Migrating to Weight-Based Pricing

## Prerequisites
- ✅ Backend server accessible
- ✅ MongoDB connection working
- ✅ Admin access credentials
- ✅ Backup of current database (recommended)

---

## Step-by-Step Migration Guide

### Step 1: Backup Database (Important! ⚠️)
```bash
# Create backup before migration
mongodump --uri="your_mongodb_uri" --out=./backup-$(date +%Y%m%d)
```

### Step 2: Run Migration Script
```bash
# Navigate to backend directory
cd backend

# Run the migration script
node scripts/migrate-to-weight-pricing.js
```

**Expected Output:**
```
🔄 Starting product pricing migration...
✅ Connected to MongoDB
📊 Initializing pricing configuration...
✅ Pricing configuration initialized
📦 Found 96 products to migrate

✅ Migrated: Product Name 1 (SKU-001)
   Weight: 5g, Options: 14K, 18K
✅ Migrated: Product Name 2 (SKU-002)
   Weight: 5g, Options: 14K, 18K
...

============================================================
📊 Migration Summary:
   Total Products: 96
   ✅ Successfully Migrated: 96
   ❌ Errors: 0
============================================================

🔍 Verifying migration...
   Products with weight: 96/96
   Products with availableOptions: 96/96
   Products still with old fields: 0

✅ Migration completed successfully!

💰 Sample Price Calculation:
   Product: Sample Ring
   Weight: 5g
   Options: {"composition":"14K","material":"yellow-gold","diamondType":"none"}
   Calculated Price: $337.50

👋 Disconnected from MongoDB
```

### Step 3: Review Migration Results

Check the output for:
- ✅ All products successfully migrated
- ✅ No errors reported
- ✅ Sample price calculation works
- ✅ Products have weight and availableOptions

If you see errors:
1. Note the product SKU/name
2. Check the error message
3. Fix the product manually if needed
4. Re-run migration

### Step 4: Restart Backend Server
```bash
# Stop current server (Ctrl+C if running)

# Start server
npm run dev
```

### Step 5: Configure Pricing in Admin Panel

1. **Login to Admin Panel** → `http://localhost:3000/admin`
2. **Navigate to Pricing Config** → Click "💰 Pricing Config" in sidebar
3. **Review Default Configuration**
4. **Adjust Rates** based on current market prices
5. **Test with Calculator** tab
6. **Save Configuration**

### Step 6: Verify Products

1. Check product listing
2. View/edit products
3. Test frontend display
4. Verify price calculation

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Migration script runs without errors
- [ ] All products have weight > 0
- [ ] Pricing config exists in database
- [ ] GET /api/pricing-config returns data
- [ ] Sample price calculation works

### Admin Panel Tests
- [ ] Can access /admin/pricing
- [ ] All tabs load correctly
- [ ] Calculator works
- [ ] Save configuration succeeds

### Frontend Tests
- [ ] Products display on shop page
- [ ] Price updates when selecting options
- [ ] Can add to cart
- [ ] Checkout shows correct price

---

## ✅ Success Criteria

Migration is successful when:
- ✅ All products have weight > 0
- ✅ Pricing config initialized
- ✅ Sample calculations work
- ✅ Admin can update config
- ✅ Frontend shows prices correctly
- ✅ Orders complete successfully

---

**Estimated Time:** 15-30 minutes
