const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer routes
router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin routes
router.get('/', authorize('admin'), orderController.getAllOrders);
router.put('/:id/status', authorize('admin'), orderController.updateOrderStatus);
router.put('/:id/tracking', authorize('admin'), orderController.updateTrackingInfo);

module.exports = router;
