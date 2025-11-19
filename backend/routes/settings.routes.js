const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', settingsController.getSettings);
router.get('/:section', settingsController.getSettingSection);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), settingsController.getAllSettings);
router.put('/', protect, authorize('admin'), settingsController.updateSettings);
router.patch('/:section', protect, authorize('admin'), settingsController.updateSettingSection);
router.post('/reset', protect, authorize('admin'), settingsController.resetSettings);

module.exports = router;
