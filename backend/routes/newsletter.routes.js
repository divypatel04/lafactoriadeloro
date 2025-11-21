const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  sendNewsletter,
  exportSubscribers
} = require('../controllers/newsletter.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/subscribers', protect, authorize('admin'), getAllSubscribers);
router.delete('/subscribers/:id', protect, authorize('admin'), deleteSubscriber);
router.post('/send', protect, authorize('admin'), sendNewsletter);
router.get('/export', protect, authorize('admin'), exportSubscribers);

module.exports = router;
