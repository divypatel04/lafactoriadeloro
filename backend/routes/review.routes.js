const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected customer routes
router.use(protect);

router.post('/', reviewController.createReview);
router.get('/my-reviews', reviewController.getMyReviews);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markHelpful);

// Admin routes
router.get('/admin/all', authorize('admin'), reviewController.getAllReviews);
router.put('/admin/:id/status', authorize('admin'), reviewController.updateReviewStatus);
router.post('/admin/:id/reply', authorize('admin'), reviewController.replyToReview);
router.delete('/admin/:id', authorize('admin'), reviewController.deleteReviewAdmin);

module.exports = router;
