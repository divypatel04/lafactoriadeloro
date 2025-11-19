# Product Schema Migration Guide
## From Variants to Price Modifiers

This guide explains the migration from variant-based pricing to price modifier system.

## What Changed

### Old System (Variants)
- Each product had multiple variants with unique SKUs
- Each variant had its own price, stock, and attributes
- Complex inventory management
- Example: Ring with 3 materials × 3 purities × 5 sizes = 45 variants

### New System (Price Modifiers)
- Single product with base price
- Options add/subtract from base price
- Single stock count
- Single SKU
- Example: Ring + Material (+$50) + Purity (+$100) + Size (+$20) = Final Price

## Migration Steps

### 1. Run the Migration Script

```bash
cd backend
node scripts/migrateProducts.js
```

This script will:
- Convert existing variants to price modifiers
- Calculate price adjustments based on variant prices
- Consolidate stock from all variants
- Preserve product data
- Generate SKUs for products without them

### 2. Update Admin Product Form (Manual)

The admin ProductForm needs to be updated to manage price modifiers instead of variants.

**Key Changes Needed in `frontend/src/pages/admin/ProductForm.js`:**

Replace the variants section with price modifiers:

```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  basePrice: '',
  stock: 0,
  sku: '',
  priceModifiers: {
    materials: [
      { name: 'yellow-gold', label: 'Yellow Gold', priceAdjustment: 0, available: true },
      { name: 'white-gold', label: 'White Gold', priceAdjustment: 50, available: true },
      { name: 'rose-gold', label: 'Rose Gold', priceAdjustment: 50, available: true }
    ],
    purities: [
      { name: '14K', label: '14 Karat', priceAdjustment: 0, available: true },
      { name: '18K', label: '18 Karat', priceAdjustment: 150, available: true }
    ],
    ringSizes: [
      { size: '6', priceAdjustment: 0, available: true },
      { size: '7', priceAdjustment: 0, available: true },
      { size: '8', priceAdjustment: 0, available: true },
      { size: '9', priceAdjustment: 20, available: true },
      { size: '10', priceAdjustment: 25, available: true }
    ],
    diamondTypes: [
      { name: 'none', label: 'No Diamond', priceAdjustment: 0, available: true },
      { name: 'lab-grown', label: 'Lab Grown', priceAdjustment: 200, available: true },
      { name: 'natural', label: 'Natural', priceAdjustment: 500, available: true }
    ]
  }
});
```

### 3. Verify Changes

After migration, verify:

1. ✅ Products display correctly on shop page
2. ✅ Product detail page shows price modifiers
3. ✅ Price updates when selecting options
4. ✅ Add to cart works with selected options
5. ✅ Cart displays selected options
6. ✅ Checkout creates orders with correct pricing
7. ✅ Orders display in customer dashboard
8. ✅ Admin can view orders

## Files Updated

### Backend
- ✅ `models/Product.model.js` - New schema with priceModifiers
- ✅ `models/Cart.model.js` - Changed variant to selectedOptions
- ✅ `models/Order.model.js` - Changed variant to selectedOptions
- ✅ `controllers/cart.controller.js` - Updated to use selectedOptions
- ✅ `controllers/order.controller.js` - Updated to use selectedOptions and calculate stock

### Frontend
- ✅ `pages/ProductDetail.js` - Complete refactor for price modifiers
- ✅ `pages/Cart.js` - Display selectedOptions instead of variant
- ✅ `pages/Checkout.js` - Send selectedOptions to backend
- ⏳ `pages/admin/ProductForm.js` - **NEEDS MANUAL UPDATE**

### Scripts
- ✅ `backend/scripts/migrateProducts.js` - Migration script

## Example Product Structure

### Before (Variants):
```javascript
{
  name: "Diamond Ring",
  basePrice: 500,
  variants: [
    {
      sku: "RING-YG-14K-7",
      material: "yellow-gold",
      purity: "14K",
      ringSize: "7",
      price: 500,
      stock: 5
    },
    {
      sku: "RING-WG-14K-7",
      material: "white-gold",
      purity: "14K",
      ringSize: "7",
      price: 600,
      stock: 3
    }
    // ... 43 more variants
  ]
}
```

### After (Price Modifiers):
```javascript
{
  name: "Diamond Ring",
  basePrice: 500,
  sku: "RING-001",
  stock: 8, // Total of all variants
  priceModifiers: {
    materials: [
      { name: 'yellow-gold', label: 'Yellow Gold', priceAdjustment: 0, available: true },
      { name: 'white-gold', label: 'White Gold', priceAdjustment: 100, available: true }
    ],
    purities: [
      { name: '14K', label: '14 Karat', priceAdjustment: 0, available: true }
    ],
    ringSizes: [
      { size: '7', priceAdjustment: 0, available: true }
    ],
    diamondTypes: []
  }
}
```

## Price Calculation Example

**Base Ring Price:** $500

**User Selections:**
- Material: White Gold (+$100)
- Purity: 18K (+$150)
- Size: 10 (+$25)
- Diamond: Natural (+$500)

**Final Price:** $500 + $100 + $150 + $25 + $500 = **$1,275**

## Benefits

✅ **Simpler Inventory** - One stock count instead of per-variant  
✅ **Flexible Pricing** - Easy to adjust option prices  
✅ **Better UX** - Real-time price updates  
✅ **Easier Management** - No complex variant combinations  
✅ **Transparent** - Users see what each option costs  
✅ **Scalable** - Can add/remove options easily  

## Troubleshooting

### Products not showing after migration
- Check MongoDB connection
- Verify products have `stock` and `sku` fields
- Check console for errors

### Prices incorrect
- Verify priceModifiers were created correctly
- Check that basePrice is set to lowest variant price
- Ensure priceAdjustment values are correct

### Cart/Orders failing
- Clear existing carts (they have old variant structure)
- Verify selectedOptions format in cart items
- Check order creation endpoint logs

## Need Help?

If you encounter issues, check:
1. MongoDB logs
2. Backend console logs
3. Browser console for frontend errors
4. Network tab for API responses
