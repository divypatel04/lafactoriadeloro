const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route - submit contact form
router.post('/', contactController.submitContact);

// Admin routes
router.get('/', protect, authorize('admin'), contactController.getAllContacts);
router.get('/:id', protect, authorize('admin'), contactController.getContact);
router.put('/:id', protect, authorize('admin'), contactController.updateContactStatus);
router.post('/:id/reply', protect, authorize('admin'), contactController.replyToContact);
router.delete('/:id', protect, authorize('admin'), contactController.deleteContact);

module.exports = router;
