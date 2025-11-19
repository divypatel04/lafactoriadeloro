const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/sales-report', adminController.getSalesReport);

// Email configuration test
router.post('/test-email', adminController.testEmailConfiguration);

module.exports = router;
