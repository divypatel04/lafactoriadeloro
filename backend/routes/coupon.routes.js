const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route - validate coupon
router.post('/validate', couponController.validateCoupon);

// Admin routes
router.use(protect, authorize('admin'));

router.get('/stats', couponController.getCouponStats);
router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.get('/:id', couponController.getCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
