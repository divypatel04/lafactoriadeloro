const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    default: 'unisex'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    material: {
      type: String,
      enum: ['yellow-gold', 'white-gold', 'rose-gold', 'silver', 'platinum', null],
      default: null
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Product weight in grams (required for price calculation)
  weight: {
    type: Number,
    required: [true, 'Product weight is required for price calculation'],
    min: [0.01, 'Weight must be greater than 0'],
    description: 'Weight of the product in grams'
  },
  
  // Available options for this product
  availableOptions: {
    // Available compositions/purities for this product
    compositions: [{
      type: String,
      enum: ['10K', '12K', '14K', '18K', '22K', '24K', '925-silver', 'platinum']
    }],
    
    // Available materials/colors for this product
    materials: [{
      type: String,
      enum: ['yellow-gold', 'white-gold', 'rose-gold', 'silver', 'platinum']
    }],
    
    // Available ring sizes for this product
    ringSizes: [{
      type: String,
      enum: ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']
    }],
    
    // Available diamond types for this product
    diamondTypes: [{
      type: String,
      enum: ['natural', 'lab-grown', 'none']
    }],
    
    // Diamond carat weight (if product has diamonds)
    diamondCarat: {
      type: Number,
      min: 0,
      default: 0,
      description: 'Total diamond carat weight'
    }
  },
  
  // Inventory - single stock count
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  // Product dimensions
  dimensions: {
    length: Number, // in mm
    width: Number,
    height: Number
  },
  
  // SKU
  sku: {
    type: String,
    required: true,
    unique: true
  },
  
  specifications: [{
    key: String,
    value: String
  }],
  
  // SEO and metadata
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  
  // Product status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewProduct: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  salePrice: Number,
  saleStartDate: Date,
  saleEndDate: Date,
  
  // Ratings and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  
  // Inventory
  totalStock: {
    type: Number,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  
  // Product tags
  tags: [String],
  
  // Related products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

/**
 * Calculate final price based on selected options using central pricing configuration
 * @param {Object} selectedOptions - Selected product options
 * @param {String} selectedOptions.composition - Selected composition (10K, 14K, etc.)
 * @param {String} selectedOptions.material - Selected material (yellow-gold, white-gold, etc.)
 * @param {String} selectedOptions.diamondType - Selected diamond type (natural, lab-grown, none)
 * @param {String} selectedOptions.ringSize - Selected ring size (optional)
 * @returns {Promise<Number>} - Calculated price
 */
productSchema.methods.calculatePrice = async function(selectedOptions = {}) {
  const PricingConfig = require('./PricingConfig.model');
  
  try {
    // Get pricing configuration
    const pricingConfig = await PricingConfig.getConfig();
    
    // Prepare product specifications for price calculation
    const productSpecs = {
      weight: this.weight,
      composition: selectedOptions.composition || selectedOptions.purity, // Support both field names
      material: selectedOptions.material,
      diamondType: selectedOptions.diamondType,
      diamondCarat: this.availableOptions?.diamondCarat || 0,
      ringSize: selectedOptions.ringSize
    };
    
    // Calculate price using pricing configuration
    const calculatedPrice = pricingConfig.calculateProductPrice(productSpecs);
    
    return calculatedPrice;
  } catch (error) {
    console.error('Error calculating price:', error);
    // Return a default minimum price if calculation fails
    return 0;
  }
};

/**
 * Calculate price range for this product (min and max based on available options)
 * @returns {Promise<Object>} - { min: Number, max: Number }
 */
productSchema.methods.calculatePriceRange = async function() {
  const prices = [];
  
  // Get all possible combinations
  const compositions = this.availableOptions?.compositions || [];
  const materials = this.availableOptions?.materials || [];
  const diamondTypes = this.availableOptions?.diamondTypes || ['none'];
  const ringSizes = this.availableOptions?.ringSizes || ['7'];
  
  // Calculate prices for different combinations
  for (const composition of compositions) {
    for (const material of materials) {
      for (const diamondType of diamondTypes) {
        try {
          const price = await this.calculatePrice({
            composition,
            material,
            diamondType,
            ringSize: ringSizes[0] // Use first ring size as base
          });
          prices.push(price);
        } catch (error) {
          console.error('Error calculating price for combination:', error);
        }
      }
    }
  }
  
  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

/**
 * Get display price (base price with cheapest options)
 * @returns {Promise<Number>} - Display price
 */
productSchema.methods.getDisplayPrice = async function() {
  const priceRange = await this.calculatePriceRange();
  return priceRange.min;
};

// Generate slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  
  // Set totalStock from stock field
  this.totalStock = this.stock || 0;
  
  next();
});

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
