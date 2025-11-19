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
    
    if (!weight || !composition) {
      return res.status(400).json({
        success: false,
        message: 'Weight and composition are required'
      });
    }
    
    const config = await PricingConfig.getConfig();
    
    const price = config.calculateProductPrice({
      weight,
      composition,
      material,
      diamondType,
      diamondCarat,
      ringSize
    });
    
    res.status(200).json({
      success: true,
      data: {
        price,
        specifications: {
          weight,
          composition,
          material,
          diamondType,
          diamondCarat,
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
