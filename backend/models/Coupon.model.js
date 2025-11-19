const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageLimitPerUser: {
    type: Number,
    default: 1,
    min: [1, 'Usage limit per user must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  firstTimeUserOnly: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes (code index is automatically created by unique: true)
couponSchema.index({ isActive: 1, expiryDate: 1 });

// Virtual to check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Virtual to check if coupon has started
couponSchema.virtual('hasStarted').get(function() {
  return this.startDate <= new Date();
});

// Virtual to check if usage limit reached
couponSchema.virtual('isUsageLimitReached').get(function() {
  return this.usageLimit && this.usedCount >= this.usageLimit;
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.isExpired) return false;
  if (!this.hasStarted) return false;
  if (this.isUsageLimitReached) return false;
  return true;
};

// Method to check if user can use coupon
couponSchema.methods.canUserUse = function(userId) {
  if (!userId) return true; // Guest users
  
  const userUsage = this.usedBy.filter(usage => 
    usage.user && usage.user.toString() === userId.toString()
  );
  
  return userUsage.length < this.usageLimitPerUser;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount, shippingCost = 0) {
  let discount = 0;

  switch (this.type) {
    case 'percentage':
      discount = (orderAmount * this.value) / 100;
      if (this.maxDiscount && discount > this.maxDiscount) {
        discount = this.maxDiscount;
      }
      break;
    
    case 'fixed':
      discount = this.value;
      if (discount > orderAmount) {
        discount = orderAmount; // Can't discount more than order amount
      }
      break;
    
    case 'free_shipping':
      discount = shippingCost;
      break;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon
couponSchema.methods.applyCoupon = async function(userId, orderId) {
  this.usedCount += 1;
  this.usedBy.push({
    user: userId,
    orderId: orderId,
    usedAt: new Date()
  });
  await this.save();
};

// Static method to find valid coupon by code
couponSchema.statics.findValidCoupon = async function(code) {
  const coupon = await this.findOne({ 
    code: code.toUpperCase(),
    isActive: true
  });
  
  if (!coupon) {
    throw new Error('Invalid coupon code');
  }
  
  if (!coupon.isValid()) {
    if (coupon.isExpired) {
      throw new Error('Coupon has expired');
    }
    if (!coupon.hasStarted) {
      throw new Error('Coupon is not yet active');
    }
    if (coupon.isUsageLimitReached) {
      throw new Error('Coupon usage limit has been reached');
    }
    throw new Error('Coupon is not valid');
  }
  
  return coupon;
};

// Pre-save hook to convert code to uppercase
couponSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase().replace(/\s+/g, '');
  }
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
