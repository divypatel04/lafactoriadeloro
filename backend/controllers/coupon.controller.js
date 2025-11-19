const Coupon = require('../models/Coupon.model');
const Order = require('../models/Order.model');

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      usageLimit,
      usageLimitPerUser,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      firstTimeUserOnly
    } = req.body;

    // Validate expiry date
    if (new Date(expiryDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after start date'
      });
    }

    // Validate value based on type
    if (type === 'percentage' && value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    const coupon = await Coupon.create({
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      usageLimit,
      usageLimitPerUser,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      firstTimeUserOnly
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating coupon',
      error: error.message
    });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Filter by status
    if (req.query.status === 'active') {
      filter.isActive = true;
      filter.expiryDate = { $gt: new Date() };
    } else if (req.query.status === 'expired') {
      filter.expiryDate = { $lte: new Date() };
    } else if (req.query.status === 'inactive') {
      filter.isActive = false;
    }

    // Search by code
    if (req.query.search) {
      filter.code = { $regex: req.query.search, $options: 'i' };
    }

    const coupons = await Coupon.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('applicableProducts', 'name')
      .populate('excludedProducts', 'name');

    const total = await Coupon.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: error.message
    });
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableProducts', 'name slug')
      .populate('excludedProducts', 'name slug')
      .populate('usedBy.user', 'firstName lastName email')
      .populate('usedBy.orderId', 'orderNumber');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon',
      error: error.message
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Validate expiry date if being updated
    if (req.body.expiryDate && req.body.startDate) {
      if (new Date(req.body.expiryDate) <= new Date(req.body.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be after start date'
        });
      }
    }

    // Validate percentage value
    if (req.body.type === 'percentage' && req.body.value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coupon',
      error: error.message
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: error.message
    });
  }
};

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId, cartItems } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    // Find and validate coupon
    const coupon = await Coupon.findValidCoupon(code);

    // Check minimum order amount
    if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minOrderAmount} required`
      });
    }

    // Check if user can use coupon
    if (userId && !coupon.canUserUse(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon the maximum number of times'
      });
    }

    // Check if first time user only
    if (coupon.firstTimeUserOnly && userId) {
      const orderCount = await Order.countDocuments({ 
        user: userId,
        orderStatus: { $ne: 'cancelled' }
      });
      
      if (orderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only valid for first-time customers'
        });
      }
    }

    // Check applicable products
    if (coupon.applicableProducts.length > 0 && cartItems) {
      const hasApplicableProduct = cartItems.some(item =>
        coupon.applicableProducts.includes(item.product)
      );
      
      if (!hasApplicableProduct) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to items in your cart'
        });
      }
    }

    // Check excluded products
    if (coupon.excludedProducts.length > 0 && cartItems) {
      const hasExcludedProduct = cartItems.some(item =>
        coupon.excludedProducts.includes(item.product)
      );
      
      if (hasExcludedProduct) {
        return res.status(400).json({
          success: false,
          message: 'This coupon cannot be applied to some items in your cart'
        });
      }
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(orderAmount);

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: discount,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid coupon code'
    });
  }
};

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
exports.getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    const expiredCoupons = await Coupon.countDocuments({ 
      expiryDate: { $lte: new Date() }
    });

    // Most used coupons
    const mostUsed = await Coupon.find()
      .sort('-usedCount')
      .limit(5)
      .select('code description usedCount type value');

    // Calculate total savings
    const couponsWithUsage = await Coupon.find({ usedCount: { $gt: 0 } });
    let totalSavings = 0;
    
    for (const coupon of couponsWithUsage) {
      // This is an approximation - actual savings would need order data
      if (coupon.type === 'fixed') {
        totalSavings += coupon.value * coupon.usedCount;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        mostUsed,
        totalSavings: Math.round(totalSavings * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon statistics',
      error: error.message
    });
  }
};
