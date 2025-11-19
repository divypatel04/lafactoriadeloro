const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'La Factoria Del Oro'
  },
  siteDescription: {
    type: String,
    default: 'Premium handcrafted jewelry'
  },
  logo: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  
  // Contact Information
  contactEmail: {
    type: String,
    default: 'info@lafactoriadeloro.com'
  },
  contactPhone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'USA' }
  },

  // Business Hours
  businessHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
  },

  // Social Media
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },

  // Payment Settings
  payment: {
    stripeEnabled: { type: Boolean, default: true },
    paypalEnabled: { type: Boolean, default: false },
    codEnabled: { type: Boolean, default: true },
    currency: { type: String, default: 'USD' },
    currencySymbol: { type: String, default: '$' }
  },

  // Tax Settings
  tax: {
    enabled: { type: Boolean, default: true },
    rate: { type: Number, default: 0 }, // Percentage (e.g., 8.5 for 8.5%)
    includedInPrice: { type: Boolean, default: false }
  },

  // Shipping Settings
  shipping: {
    freeShippingThreshold: { type: Number, default: 0 }, // 0 means disabled
    flatRate: { type: Number, default: 0 },
    internationalShipping: { type: Boolean, default: false },
    estimatedDeliveryDays: {
      domestic: { min: Number, max: Number },
      international: { min: Number, max: Number }
    }
  },

  // Email Settings
  email: {
    fromName: { type: String, default: 'La Factoria Del Oro' },
    fromEmail: { type: String, default: 'noreply@lafactoriadeloro.com' },
    orderNotificationEmail: { type: String, default: '' }, // Admin notification email
    contactNotificationEmail: { type: String, default: '' }
  },

  // SEO Settings
  seo: {
    metaTitle: { type: String, default: 'La Factoria Del Oro - Premium Jewelry' },
    metaDescription: { type: String, default: 'Discover our exclusive collection of handcrafted rings and jewelry' },
    metaKeywords: { type: String, default: 'jewelry, rings, gold, engagement rings, wedding bands' },
    googleAnalyticsId: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' }
  },

  // Store Settings
  store: {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently updating our store. Please check back soon!' },
    allowGuestCheckout: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
    maxOrderQuantity: { type: Number, default: 10 },
    lowStockThreshold: { type: Number, default: 5 }
  },

  // Notification Settings
  notifications: {
    emailOnNewOrder: { type: Boolean, default: true },
    emailOnLowStock: { type: Boolean, default: true },
    emailOnNewContact: { type: Boolean, default: true },
    emailOnNewReview: { type: Boolean, default: true }
  },

  // Legal
  legal: {
    companyName: { type: String, default: 'La Factoria Del Oro LLC' },
    registrationNumber: { type: String, default: '' },
    vatNumber: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists (singleton pattern)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.getSettings();
  Object.keys(updates).forEach(key => {
    if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
      settings[key] = { ...settings[key], ...updates[key] };
    } else {
      settings[key] = updates[key];
    }
  });
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
