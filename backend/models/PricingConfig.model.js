const mongoose = require('mongoose');

/**
 * Central Pricing Configuration Model
 * All product prices are calculated based on these rates
 */
const pricingConfigSchema = new mongoose.Schema({
  // Unique identifier (singleton pattern - only one config document)
  _id: {
    type: String,
    default: 'pricing-config'
  },

  // Base price per gram for each metal composition
  compositionRates: [{
    composition: {
      type: String,
      required: true,
      enum: ['10K', '12K', '14K', '18K', '22K', '24K', '925-silver', 'platinum'],
      unique: true
    },
    label: {
      type: String,
      required: true
    },
    pricePerGram: {
      type: Number,
      required: true,
      min: 0,
      description: 'Base price per gram for this composition'
    },
    materialTypes: [{
      material: {
        type: String,
        required: true,
        enum: ['yellow-gold', 'white-gold', 'rose-gold', 'silver', 'platinum']
      },
      label: String,
      priceMultiplier: {
        type: Number,
        default: 1,
        description: 'Multiplier for this material type (e.g., 1.1 for 10% increase)'
      }
    }],
    enabled: {
      type: Boolean,
      default: true
    }
  }],

  // Diamond pricing configuration
  diamondPricing: [{
    type: {
      type: String,
      required: true,
      enum: ['natural', 'lab-grown', 'none'],
      unique: true
    },
    label: {
      type: String,
      required: true
    },
    pricePerCarat: {
      type: Number,
      default: 0,
      description: 'Price per carat for this diamond type'
    },
    // Or fixed price adjustment
    fixedPrice: {
      type: Number,
      default: 0,
      description: 'Fixed price addition (alternative to per-carat pricing)'
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],

  // Ring size adjustments
  ringSizePricing: {
    sizeAdjustments: [{
      size: {
        type: String,
        enum: ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']
      },
      percentageAdjustment: {
        type: Number,
        default: 0,
        description: 'Percentage adjustment (e.g., 10 for +10%, -5 for -5%)'
      }
    }]
  },

  // Additional cost factors
  additionalCosts: {
    laborCost: {
      type: Number,
      default: 0,
      description: 'Fixed labor cost added to all products'
    },
    laborCostPerGram: {
      type: Number,
      default: 0,
      description: 'Labor cost multiplied by product weight'
    },
    profitMarginPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      description: 'Profit margin percentage (0-100)'
    },
    minimumPrice: {
      type: Number,
      default: 0,
      description: 'Minimum price for any product'
    }
  },

  // Tax configuration
  tax: {
    enabled: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      default: 0,
      description: 'Tax percentage (0-100)'
    },
    includedInPrice: {
      type: Boolean,
      default: false,
      description: 'Whether tax is already included in calculated price'
    }
  },

  // Currency
  currency: {
    code: {
      type: String,
      default: 'USD'
    },
    symbol: {
      type: String,
      default: '$'
    }
  },

  // Last updated info
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

/**
 * Calculate price for a product based on its specifications
 * @param {Object} productSpecs - Product specifications
 * @param {Number} productSpecs.weight - Product weight in grams
 * @param {String} productSpecs.composition - Composition (10K, 14K, etc.)
 * @param {String} productSpecs.material - Material type (yellow-gold, white-gold, etc.)
 * @param {String} productSpecs.diamondType - Diamond type (natural, lab-grown, none)
 * @param {Number} productSpecs.diamondCarat - Diamond weight in carats (optional)
 * @param {String} productSpecs.ringSize - Ring size (optional)
 * @returns {Number} - Calculated price
 */
pricingConfigSchema.methods.calculateProductPrice = function(productSpecs) {
  const { weight, composition, material, diamondType, diamondCarat = 0, ringSize } = productSpecs;

  if (!weight || weight <= 0) {
    throw new Error('Product weight is required and must be greater than 0');
  }

  if (!composition) {
    throw new Error('Product composition is required');
  }

  let totalPrice = 0;

  // 1. Calculate base price: weight × composition rate × material multiplier
  const compositionConfig = this.compositionRates.find(c => c.composition === composition && c.enabled);
  
  if (!compositionConfig) {
    throw new Error(`Composition ${composition} not found or not enabled in pricing configuration`);
  }

  let basePrice = weight * compositionConfig.pricePerGram;

  // Apply material multiplier if material is specified
  if (material) {
    const materialConfig = compositionConfig.materialTypes.find(m => m.material === material);
    if (materialConfig) {
      basePrice *= materialConfig.priceMultiplier;
    }
  }

  totalPrice += basePrice;

  // 2. Add diamond pricing
  if (diamondType && diamondType !== 'none') {
    const diamondConfig = this.diamondPricing.find(d => d.type === diamondType && d.enabled);
    
    if (diamondConfig) {
      if (diamondConfig.pricePerCarat > 0 && diamondCarat > 0) {
        totalPrice += diamondConfig.pricePerCarat * diamondCarat;
      } else if (diamondConfig.fixedPrice > 0) {
        totalPrice += diamondConfig.fixedPrice;
      }
    }
  }

  // 3. Add labor costs (before ring size percentage)
  let laborCost = 0;
  if (this.additionalCosts.laborCost > 0) {
    laborCost += this.additionalCosts.laborCost;
    totalPrice += this.additionalCosts.laborCost;
  }
  
  if (this.additionalCosts.laborCostPerGram > 0) {
    const laborPerGram = weight * this.additionalCosts.laborCostPerGram;
    laborCost += laborPerGram;
    totalPrice += laborPerGram;
  }

  // 4. Apply ring size percentage adjustment (on base price + labor)
  if (ringSize) {
    const sizeAdjustment = this.ringSizePricing.sizeAdjustments.find(s => s.size === ringSize);
    
    if (sizeAdjustment && sizeAdjustment.percentageAdjustment) {
      const percentageAmount = (totalPrice * sizeAdjustment.percentageAdjustment) / 100;
      totalPrice += percentageAmount;
    }
  }

  // 6. Apply profit margin
  if (this.additionalCosts.profitMarginPercentage > 0) {
    totalPrice *= (1 + this.additionalCosts.profitMarginPercentage / 100);
  }

  // 7. Apply minimum price
  if (this.additionalCosts.minimumPrice > 0) {
    totalPrice = Math.max(totalPrice, this.additionalCosts.minimumPrice);
  }

  // 7. Add tax if included in price
  if (this.tax.enabled && this.tax.includedInPrice && this.tax.percentage > 0) {
    totalPrice *= (1 + this.tax.percentage / 100);
  }

  // Round to 2 decimal places
  return Math.round(totalPrice * 100) / 100;
};

/**
 * Get default pricing configuration
 */
pricingConfigSchema.statics.getConfig = async function() {
  let config = await this.findById('pricing-config');
  
  if (!config) {
    // Create default configuration if it doesn't exist
    config = await this.create({
      _id: 'pricing-config',
      compositionRates: [
        {
          composition: '10K',
          label: '10 Karat Gold',
          pricePerGram: 25,
          materialTypes: [
            { material: 'yellow-gold', label: 'Yellow Gold', priceMultiplier: 1.0 },
            { material: 'white-gold', label: 'White Gold', priceMultiplier: 1.1 },
            { material: 'rose-gold', label: 'Rose Gold', priceMultiplier: 1.05 }
          ]
        },
        {
          composition: '14K',
          label: '14 Karat Gold',
          pricePerGram: 35,
          materialTypes: [
            { material: 'yellow-gold', label: 'Yellow Gold', priceMultiplier: 1.0 },
            { material: 'white-gold', label: 'White Gold', priceMultiplier: 1.1 },
            { material: 'rose-gold', label: 'Rose Gold', priceMultiplier: 1.05 }
          ]
        },
        {
          composition: '18K',
          label: '18 Karat Gold',
          pricePerGram: 45,
          materialTypes: [
            { material: 'yellow-gold', label: 'Yellow Gold', priceMultiplier: 1.0 },
            { material: 'white-gold', label: 'White Gold', priceMultiplier: 1.1 },
            { material: 'rose-gold', label: 'Rose Gold', priceMultiplier: 1.05 }
          ]
        },
        {
          composition: '925-silver',
          label: '925 Sterling Silver',
          pricePerGram: 2,
          materialTypes: [
            { material: 'silver', label: 'Silver', priceMultiplier: 1.0 }
          ]
        },
        {
          composition: 'platinum',
          label: 'Platinum',
          pricePerGram: 60,
          materialTypes: [
            { material: 'platinum', label: 'Platinum', priceMultiplier: 1.0 }
          ]
        }
      ],
      diamondPricing: [
        {
          type: 'natural',
          label: 'Natural Diamond',
          fixedPrice: 500
        },
        {
          type: 'lab-grown',
          label: 'Lab-Grown Diamond',
          fixedPrice: 300
        },
        {
          type: 'none',
          label: 'No Diamond',
          fixedPrice: 0
        }
      ],
      ringSizePricing: {
        sizeAdjustments: [
          { size: '4', percentageAdjustment: 0 },
          { size: '4.5', percentageAdjustment: 0 },
          { size: '5', percentageAdjustment: 0 },
          { size: '5.5', percentageAdjustment: 0 },
          { size: '6', percentageAdjustment: 0 },
          { size: '6.5', percentageAdjustment: 0 },
          { size: '7', percentageAdjustment: 0 },
          { size: '7.5', percentageAdjustment: 0 },
          { size: '8', percentageAdjustment: 0 },
          { size: '8.5', percentageAdjustment: 0 },
          { size: '9', percentageAdjustment: 0 },
          { size: '9.5', percentageAdjustment: 0 },
          { size: '10', percentageAdjustment: 0 },
          { size: '10.5', percentageAdjustment: 0 },
          { size: '11', percentageAdjustment: 0 },
          { size: '11.5', percentageAdjustment: 0 },
          { size: '12', percentageAdjustment: 0 }
        ]
      },
      additionalCosts: {
        laborCost: 50,
        laborCostPerGram: 5,
        profitMarginPercentage: 30,
        minimumPrice: 100
      },
      tax: {
        enabled: false,
        percentage: 0,
        includedInPrice: false
      },
      currency: {
        code: 'USD',
        symbol: '$'
      }
    });
  }
  
  return config;
};

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
