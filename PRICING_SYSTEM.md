# 💰 Weight-Based Dynamic Pricing System

## Overview

The pricing system has been completely redesigned to use a **centralized, weight-based configuration** instead of per-product fixed prices. This allows the admin to update pricing globally without editing each product individually.

---

## 🎯 How It Works

### Old System ❌
- Each product had a fixed `basePrice`
- Each product had individual `priceModifiers` for materials, purities, sizes, diamonds
- Changing gold prices required updating every single product manually
- Inconsistent pricing across similar products

### New System ✅
- Products only store their **weight in grams** and **available options**
- All pricing is calculated from a **central pricing configuration**
- Price formula: `(Weight × Composition Rate × Material Multiplier) + Diamond Cost + Size Adjustment + Labor Costs + Profit Margin`
- Update prices once in config, all products reflect changes immediately

---

## 📊 Pricing Formula

```
Base Price = Weight (grams) × Composition Rate ($/gram) × Material Multiplier

+ Diamond Price (Fixed or Per Carat)
+ Ring Size Adjustment
+ Fixed Labor Cost
+ (Weight × Labor Cost Per Gram)
× (1 + Profit Margin %)
= Final Price (minimum: Minimum Product Price)
```

### Example Calculation

**Product Specifications:**
- Weight: 5 grams
- Composition: 14K Gold
- Material: White Gold
- Diamond: Lab-Grown
- Ring Size: 8

**Pricing Configuration:**
- 14K Gold: $35/gram
- White Gold Multiplier: 1.1×
- Lab-Grown Diamond: +$300
- Ring Size 8 (1 size above base 7): +$20
- Fixed Labor: $50
- Labor Per Gram: $5
- Profit Margin: 30%

**Calculation:**
```
Base = 5g × $35 × 1.1 = $192.50
+ Diamond = $300
+ Size Adjustment = $20
+ Fixed Labor = $50
+ Variable Labor = 5g × $5 = $25
= Subtotal = $587.50
× Profit Margin = $587.50 × 1.30 = $763.75
= Final Price = $763.75
```

---

## 🗂️ File Structure

### Backend

```
backend/
├── models/
│   ├── Product.model.js              # Updated product schema
│   └── PricingConfig.model.js        # NEW: Central pricing configuration
├── controllers/
│   └── pricingConfig.controller.js   # NEW: Pricing config CRUD
├── routes/
│   └── pricingConfig.routes.js       # NEW: Pricing config routes
└── scripts/
    └── migrate-to-weight-pricing.js  # Migration script
```

### Frontend

```
frontend/
└── src/
    └── pages/
        └── admin/
            ├── PricingConfig.js      # NEW: Pricing configuration UI
            └── PricingConfig.css     # Styling
```

---

## 🔄 Migration

### Step 1: Run Migration Script

```bash
cd backend
node scripts/migrate-to-weight-pricing.js
```

This script will:
1. Initialize default pricing configuration
2. Convert all existing products from `basePrice` + `priceModifiers` to `weight` + `availableOptions`
3. Remove deprecated fields
4. Verify migration success

### Step 2: Restart Backend Server

```bash
npm run dev
```

### Step 3: Configure Pricing

1. Login as admin
2. Navigate to **Admin → Pricing Config**
3. Review and adjust default pricing rates
4. Save configuration

---

## 📝 Product Model Changes

### Removed Fields
- ❌ `basePrice` - Fixed base price
- ❌ `priceModifiers` - Individual price adjustments
  - `priceModifiers.materials`
  - `priceModifiers.purities`
  - `priceModifiers.ringSizes`
  - `priceModifiers.diamondTypes`

### Added Fields
- ✅ `weight` (Number, required) - Product weight in grams
- ✅ `availableOptions` (Object) - Available options for this product
  - `availableOptions.compositions` - Array of available compositions (e.g., ['14K', '18K'])
  - `availableOptions.materials` - Array of available materials (e.g., ['yellow-gold', 'white-gold'])
  - `availableOptions.ringSizes` - Array of available sizes (e.g., ['6', '7', '8'])
  - `availableOptions.diamondTypes` - Array of diamond options (e.g., ['natural', 'lab-grown', 'none'])
  - `availableOptions.diamondCarat` - Total diamond carat weight (if applicable)

### New Methods
- `calculatePrice(selectedOptions)` - Calculate price for specific option selection
- `calculatePriceRange()` - Get min and max price based on all available options
- `getDisplayPrice()` - Get base display price (minimum price)

---

## 🎛️ Pricing Configuration Model

### Composition Rates

Configure base price per gram for each metal composition:

```javascript
{
  composition: '14K',           // 10K, 12K, 14K, 18K, 22K, 24K, 925-silver, platinum
  label: '14 Karat Gold',
  pricePerGram: 35,             // Base price per gram
  materialTypes: [
    {
      material: 'yellow-gold',
      label: 'Yellow Gold',
      priceMultiplier: 1.0      // 1× = same price
    },
    {
      material: 'white-gold',
      label: 'White Gold',
      priceMultiplier: 1.1      // 1.1× = 10% more expensive
    },
    {
      material: 'rose-gold',
      label: 'Rose Gold',
      priceMultiplier: 1.05     // 1.05× = 5% more expensive
    }
  ],
  enabled: true
}
```

### Diamond Pricing

Configure diamond pricing (fixed or per carat):

```javascript
{
  type: 'natural',              // natural, lab-grown, none
  label: 'Natural Diamond',
  fixedPrice: 500,              // Fixed price addition
  pricePerCarat: 0,             // Or use per-carat pricing
  enabled: true
}
```

### Ring Size Pricing

Configure size-based adjustments:

```javascript
{
  enabled: true,
  baseSize: '7',                // Reference size with no adjustment
  pricePerSizeUnit: 10,         // Price per 0.5 size difference
  sizeAdjustments: []           // Or use specific adjustments per size
}
```

### Additional Costs

```javascript
{
  laborCost: 50,                     // Fixed labor cost per product
  laborCostPerGram: 5,               // Labor cost multiplied by weight
  profitMarginPercentage: 30,        // 30% profit margin
  minimumPrice: 100                  // No product below $100
}
```

---

## 🔌 API Endpoints

### Get Pricing Configuration
```
GET /api/pricing-config
Authorization: Bearer <admin-token>
```

### Update Entire Configuration
```
PUT /api/pricing-config
Authorization: Bearer <admin-token>
Body: { compositionRates, diamondPricing, ringSizePricing, additionalCosts }
```

### Update Composition Rates Only
```
PUT /api/pricing-config/compositions
Authorization: Bearer <admin-token>
Body: { compositionRates: [...] }
```

### Update Diamond Pricing Only
```
PUT /api/pricing-config/diamonds
Authorization: Bearer <admin-token>
Body: { diamondPricing: [...] }
```

### Update Ring Size Pricing
```
PUT /api/pricing-config/ring-sizes
Authorization: Bearer <admin-token>
Body: { ringSizePricing: {...} }
```

### Update Additional Costs
```
PUT /api/pricing-config/additional-costs
Authorization: Bearer <admin-token>
Body: { additionalCosts: {...} }
```

### Calculate Price (Test/Preview)
```
POST /api/pricing-config/calculate
Authorization: Bearer <admin-token>
Body: { weight, composition, material, diamondType, diamondCarat, ringSize }
```

### Reset to Defaults
```
POST /api/pricing-config/reset
Authorization: Bearer <admin-token>
```

---

## 🎨 Admin UI Features

### 5 Main Tabs

1. **🔷 Compositions**
   - Configure price per gram for each composition (10K, 14K, 18K, etc.)
   - Set material multipliers (Yellow, White, Rose Gold)
   - Enable/disable compositions
   - Live calculation examples

2. **💎 Diamonds**
   - Configure natural vs lab-grown diamond pricing
   - Set fixed price or per-carat pricing
   - Enable/disable diamond options

3. **💍 Ring Sizes**
   - Set base ring size
   - Configure price per size unit (0.5 increments)
   - Or set individual size adjustments

4. **💵 Additional Costs**
   - Fixed labor cost
   - Labor cost per gram
   - Profit margin percentage
   - Minimum product price
   - Visual formula display

5. **🧮 Price Calculator**
   - Test pricing before saving
   - Input: weight, composition, material, diamond, size
   - Output: Calculated final price
   - Useful for verifying configuration

### Features
- ✅ Live calculation examples in each tab
- ✅ Visual formula breakdown
- ✅ Price calculator for testing
- ✅ Enable/disable individual options
- ✅ Responsive design
- ✅ Save all changes with one button

---

## 📱 Product Editing Workflow

### Before (Old System)
1. Add product with base price: $500
2. Add material price modifiers: +$100, +$150, +$75
3. Add purity modifiers: +$200, +$300
4. Add size modifiers: +$10, +$20, +$30
5. Total: 20+ fields to configure per product

### After (New System)
1. Add product weight: 5 grams
2. Select available options:
   - Compositions: 14K, 18K ✓
   - Materials: Yellow, White, Rose ✓
   - Sizes: 6, 7, 8, 9 ✓
   - Diamonds: Natural, Lab-Grown, None ✓
3. Price calculated automatically from central config
4. Done! ✨

---

## 🔍 Frontend Price Display

Products now show:
- **Price Range**: "From $500 - $800" (based on cheapest to most expensive option combo)
- **Dynamic Updates**: Price updates as user selects options
- **Calculation**: Happens in real-time via product.calculatePrice()

---

## ⚙️ Configuration Best Practices

### 1. Set Realistic Composition Rates
- Monitor actual gold market prices
- Update rates monthly or as needed
- Consider your supplier costs

### 2. Material Multipliers
- White Gold typically 5-10% more (rhodium plating cost)
- Rose Gold similar to Yellow Gold
- Platinum significantly more expensive

### 3. Diamond Pricing
- Use fixed pricing for consistency
- Or use per-carat for variable diamond sizes
- Natural diamonds 50-100% more than lab-grown

### 4. Labor Costs
- Fixed labor covers base crafting time
- Per-gram labor scales with product complexity
- Adjust based on actual production costs

### 5. Profit Margin
- 20-40% typical for jewelry retail
- Consider competition and positioning
- Account for operating expenses

### 6. Minimum Price
- Ensures profitability on small items
- Prevents unreasonably low prices
- Covers baseline costs

---

## 🚨 Important Notes

### Breaking Changes
- ⚠️ **Products without weight**: Will fail price calculation
- ⚠️ **Old price references**: Any hardcoded `basePrice` references must be updated
- ⚠️ **API responses**: Product objects no longer include `basePrice` or `priceModifiers`

### Backwards Compatibility
- Migration script handles conversion automatically
- Old products get default weight of 5 grams (adjust as needed)
- All available options extracted from old priceModifiers

### Performance
- Price calculation is async (uses database query)
- Consider caching calculated prices for high-traffic pages
- Use `getDisplayPrice()` for product listings (single calculation)

---

## 🐛 Troubleshooting

### "Product weight is required for price calculation"
- Solution: Ensure all products have a `weight` value > 0
- Check: Run migration script if upgrading from old system

### "Composition X not found in pricing configuration"
- Solution: Ensure the composition exists and is enabled in pricing config
- Check: Admin → Pricing Config → Compositions tab

### Prices showing as $0
- Solution: Verify pricing configuration is initialized
- Check: GET /api/pricing-config returns valid rates
- Fix: Run migration script or visit Pricing Config page

### Price calculation too slow
- Solution: Implement caching for product listings
- Use: `getDisplayPrice()` instead of `calculatePrice()` for listings
- Cache: Store calculated price ranges in product document

---

## 📈 Future Enhancements

- [ ] Currency conversion support
- [ ] Bulk import pricing from CSV
- [ ] Price history tracking
- [ ] Scheduled price updates
- [ ] Competitor price monitoring
- [ ] Dynamic pricing based on demand
- [ ] Volume discounts configuration
- [ ] Seasonal pricing rules

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review migration script output
3. Check browser console for errors
4. Verify API responses in Network tab
5. Contact development team

---

**Last Updated:** November 6, 2025  
**Version:** 2.0.0  
**Status:** Production Ready ✅
