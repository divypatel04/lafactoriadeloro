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
const { protect, admin } = require('../middleware/auth.middleware');

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/subscribers', protect, admin, getAllSubscribers);
router.delete('/subscribers/:id', protect, admin, deleteSubscriber);
router.post('/send', protect, admin, sendNewsletter);
router.get('/export', protect, admin, exportSubscribers);

module.exports = router;
