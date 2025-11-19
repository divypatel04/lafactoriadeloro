const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get Stripe publishable key (public)
router.get('/config', paymentController.getConfig);

// Create payment intent (protected)
router.post('/create-intent', protect, paymentController.createPaymentIntent);

// Confirm payment (protected)
router.post('/confirm', protect, paymentController.confirmPayment);

// Get payment intent details (protected)
router.get('/intent/:id', protect, paymentController.getPaymentIntent);

// Stripe webhook (public - verified by Stripe signature)
// Note: This endpoint needs raw body, configured differently in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
