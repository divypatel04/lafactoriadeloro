const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/slider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', sliderController.getAllSliders);

// Admin routes
router.get('/admin', protect, authorize('admin'), sliderController.getAdminSliders);
router.post('/', protect, authorize('admin'), sliderController.createSlider);
router.post('/reorder', protect, authorize('admin'), sliderController.reorderSliders);
router.get('/:id', protect, authorize('admin'), sliderController.getSliderById);
router.put('/:id', protect, authorize('admin'), sliderController.updateSlider);
router.delete('/:id', protect, authorize('admin'), sliderController.deleteSlider);

module.exports = router;
