const express = require('express');
const router = express.Router();
const pricingConfigController = require('../controllers/pricingConfig.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Get pricing configuration
router.get('/', pricingConfigController.getPricingConfig);

// Update entire pricing configuration
router.put('/', pricingConfigController.updatePricingConfig);

// Update specific sections
router.put('/compositions', pricingConfigController.updateCompositionRates);
router.put('/diamonds', pricingConfigController.updateDiamondPricing);
router.put('/ring-sizes', pricingConfigController.updateRingSizePricing);
router.put('/additional-costs', pricingConfigController.updateAdditionalCosts);

// Calculate price (for testing/preview)
router.post('/calculate', pricingConfigController.calculatePrice);

// Reset to defaults
router.post('/reset', pricingConfigController.resetPricingConfig);

module.exports = router;
