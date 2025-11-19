const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/address', userController.addAddress);
router.put('/address/:addressId', userController.updateAddress);
router.delete('/address/:addressId', userController.deleteAddress);

module.exports = router;
