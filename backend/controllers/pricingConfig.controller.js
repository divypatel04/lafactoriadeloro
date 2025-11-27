const PricingConfig = require('../models/PricingConfig.model');

/**
 * Get pricing configuration
 * @route GET /api/pricing-config
 * @access Private (Admin only)
 */
exports.getPricingConfig = async (req, res) => {
  try {
    const config = await PricingConfig.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get pricing config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pricing configuration',
      error: error.message
    });
  }
};

/**
 * Update pricing configuration
 * @route PUT /api/pricing-config
 * @access Private (Admin only)
 */
exports.updatePricingConfig = async (req, res) => {
  try {
    const updates = req.body;
    
    // Add user who updated
    updates.lastUpdatedBy = req.user._id;
    
    const config = await PricingConfig.findByIdAndUpdate(
      'pricing-config',
      updates,
      { new: true, runValidators: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Pricing configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Update pricing config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing configuration',
      error: error.message
    });
  }
};

/**
 * Update composition rates
 * @route PUT /api/pricing-config/compositions
 * @access Private (Admin only)
 */
exports.updateCompositionRates = async (req, res) => {
  try {
    const { compositionRates } = req.body;
    
    const config = await PricingConfig.findByIdAndUpdate(
      'pricing-config',
      { 
        compositionRates,
        lastUpdatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Composition rates updated successfully',
      data: config.compositionRates
    });
  } catch (error) {
    console.error('Update composition rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update composition rates',
      error: error.message
    });
  }
};

/**
 * Update diamond pricing
 * @route PUT /api/pricing-config/diamonds
 * @access Private (Admin only)
 */
exports.updateDiamondPricing = async (req, res) => {
  try {
    const { diamondPricing } = req.body;
    
    const config = await PricingConfig.findByIdAndUpdate(
      'pricing-config',
      { 
        diamondPricing,
        lastUpdatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Diamond pricing updated successfully',
      data: config.diamondPricing
    });
  } catch (error) {
    console.error('Update diamond pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diamond pricing',
      error: error.message
    });
  }
};

/**
 * Update ring size pricing
 * @route PUT /api/pricing-config/ring-sizes
 * @access Private (Admin only)
 */
exports.updateRingSizePricing = async (req, res) => {
  try {
    const { ringSizePricing } = req.body;
    
    const config = await PricingConfig.findByIdAndUpdate(
      'pricing-config',
      { 
        ringSizePricing,
        lastUpdatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Ring size pricing updated successfully',
      data: config.ringSizePricing
    });
  } catch (error) {
    console.error('Update ring size pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ring size pricing',
      error: error.message
    });
  }
};

/**
 * Update additional costs (labor, margin, etc.)
 * @route PUT /api/pricing-config/additional-costs
 * @access Private (Admin only)
 */
exports.updateAdditionalCosts = async (req, res) => {
  try {
    const { additionalCosts } = req.body;
    
    const config = await PricingConfig.findByIdAndUpdate(
      'pricing-config',
      { 
        additionalCosts,
        lastUpdatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Additional costs updated successfully',
      data: config.additionalCosts
    });
  } catch (error) {
    console.error('Update additional costs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update additional costs',
      error: error.message
    });
  }
};

/**
 * Calculate price for given specifications (preview/test)
 * @route POST /api/pricing-config/calculate
 * @access Private (Admin only)
 */
exports.calculatePrice = async (req, res) => {
  try {
    const { weight, composition, material, diamondType, diamondCarat, ringSize } = req.body;
    
    console.log('Calculate request received:', { weight, composition, material, diamondType, diamondCarat, ringSize });
    
    if (!weight || !composition) {
      return res.status(400).json({
        success: false,
        message: 'Weight and composition are required'
      });
    }
    
    const config = await PricingConfig.getConfig();
    
    console.log('Config loaded, compositions:', config.compositionRates?.length);
    console.log('All compositions:', JSON.stringify(config.compositionRates?.map(c => ({
      composition: c.composition,
      label: c.label,
      enabled: c.enabled,
      pricePerGram: c.pricePerGram
    })), null, 2));
    
    // Calculate price with detailed breakdown
    const weightNum = parseFloat(weight);
    const diamondCaratNum = parseFloat(diamondCarat) || 0;
    
    // 1. Calculate metal cost
    const compositionConfig = config.compositionRates.find(c => 
      c.composition === composition && c.enabled !== false
    );
    
    if (!compositionConfig) {
      const availableComps = config.compositionRates.map(c => c.composition).join(', ');
      console.error('Composition not found. Looking for:', composition, 'Available:', availableComps);
      throw new Error(`Composition ${composition} not found or not enabled. Available: ${availableComps}`);
    }
    
    let metalCost = weightNum * compositionConfig.pricePerGram;
    
    // Apply material multiplier
    if (material) {
      const materialConfig = compositionConfig.materialTypes?.find(m => m.material === material);
      if (materialConfig) {
        metalCost *= materialConfig.priceMultiplier;
      }
    }
    
    // 2. Calculate diamond cost
    let diamondCost = 0;
    if (diamondType && diamondType !== 'none') {
      const diamondConfig = config.diamondPricing?.find(d => 
        d.type === diamondType && d.enabled !== false
      );
      
      if (diamondConfig) {
        if (diamondConfig.pricePerCarat > 0 && diamondCaratNum > 0) {
          diamondCost = diamondConfig.pricePerCarat * diamondCaratNum;
        } else if (diamondConfig.fixedPrice > 0) {
          diamondCost = diamondConfig.fixedPrice;
        }
      }
    }
    
    // 3. Calculate labor cost
    let laborCost = 0;
    if (config.additionalCosts?.laborCost > 0) {
      laborCost += config.additionalCosts.laborCost;
    }
    if (config.additionalCosts?.laborCostPerGram > 0) {
      laborCost += weightNum * config.additionalCosts.laborCostPerGram;
    }
    
    // 4. Making charges
    let makingCharges = 0;
    if (config.additionalCosts?.makingCharges > 0) {
      makingCharges = config.additionalCosts.makingCharges;
    }
    
    // 5. Ring size adjustment
    let ringSizeAdjustment = 0;
    if (ringSize) {
      const sizeAdjustment = config.ringSizePricing?.sizeAdjustments?.find(s => s.size === ringSize);
      if (sizeAdjustment && sizeAdjustment.percentageAdjustment) {
        const baseForSizeCalc = metalCost + diamondCost + laborCost + makingCharges;
        ringSizeAdjustment = (baseForSizeCalc * sizeAdjustment.percentageAdjustment) / 100;
      }
    }
    
    // Calculate subtotal
    const subtotal = metalCost + diamondCost + laborCost + makingCharges + ringSizeAdjustment;
    
    // 6. Apply profit margin
    let profitAmount = 0;
    if (config.additionalCosts?.profitMarginPercentage > 0) {
      profitAmount = (subtotal * config.additionalCosts.profitMarginPercentage) / 100;
    }
    
    // Calculate final price
    let finalPrice = subtotal + profitAmount;
    
    // 7. Apply minimum price
    if (config.additionalCosts?.minimumPrice > 0) {
      finalPrice = Math.max(finalPrice, config.additionalCosts.minimumPrice);
    }
    
    // 8. Add tax if included in price
    if (config.tax?.enabled && config.tax?.includedInPrice && config.tax?.percentage > 0) {
      finalPrice *= (1 + config.tax.percentage / 100);
    }
    
    // Round all values
    const breakdown = {
      metalCost: Math.round(metalCost * 100) / 100,
      diamondCost: Math.round(diamondCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      makingCharges: Math.round(makingCharges * 100) / 100,
      ringSizeAdjustment: Math.round(ringSizeAdjustment * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      profitAmount: Math.round(profitAmount * 100) / 100
    };
    
    const price = Math.round(finalPrice * 100) / 100;
    
    res.status(200).json({
      success: true,
      data: {
        price,
        breakdown,
        specifications: {
          weight: weightNum,
          composition,
          material,
          diamondType,
          diamondCarat: diamondCaratNum,
          ringSize
        }
      }
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to calculate price',
      error: error.message
    });
  }
};

/**
 * Reset pricing configuration to defaults
 * @route POST /api/pricing-config/reset
 * @access Private (Admin only)
 */
exports.resetPricingConfig = async (req, res) => {
  try {
    // Delete existing config
    await PricingConfig.findByIdAndDelete('pricing-config');
    
    // Get config will create a new default one
    const config = await PricingConfig.getConfig();
    
    // Update lastUpdatedBy
    config.lastUpdatedBy = req.user._id;
    await config.save();
    
    res.status(200).json({
      success: true,
      message: 'Pricing configuration reset to defaults',
      data: config
    });
  } catch (error) {
    console.error('Reset pricing config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset pricing configuration',
      error: error.message
    });
  }
};
