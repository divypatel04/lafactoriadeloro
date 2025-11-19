const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Customer only, must have purchased)
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      'items.product': productId
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'You can only review products you have purchased'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating,
      title,
      comment,
      images: images || [],
      verifiedPurchase: true
    });

    await review.populate('user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'recent'; // recent, helpful, rating-high, rating-low

    let sort = {};
    switch (sortBy) {
      case 'helpful':
        sort = { helpful: -1 };
        break;
      case 'rating-high':
        sort = { rating: -1 };
        break;
      case 'rating-low':
        sort = { rating: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find({
      product: productId,
      status: 'approved'
    })
      .populate('user', 'firstName lastName')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({
      product: productId,
      status: 'approved'
    });

    // Get rating statistics
    const stats = await Review.calculateAverageRating(productId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name slug images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reviews',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    
    // Reset to pending if modified
    review.status = 'pending';

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully. It will be reviewed by admin.',
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner only)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Mark review as helpful/not helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const { helpful } = req.body; // true or false
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Remove from both arrays first
    review.helpfulBy = review.helpfulBy.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    review.notHelpfulBy = review.notHelpfulBy.filter(
      userId => userId.toString() !== req.user._id.toString()
    );

    // Add to appropriate array
    if (helpful) {
      review.helpfulBy.push(req.user._id);
    } else {
      review.notHelpfulBy.push(req.user._id);
    }

    review.helpful = review.helpfulBy.length;
    review.notHelpful = review.notHelpfulBy.length;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: {
        helpful: review.helpful,
        notHelpful: review.notHelpful
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording feedback',
      error: error.message
    });
  }
};

// ===== ADMIN ROUTES =====

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // pending, approved, rejected

    const query = {};
    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get status counts
    const statusCounts = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        counts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Update review status (admin)
// @route   PUT /api/reviews/admin/:id/status
// @access  Private/Admin
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      data: review
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review status',
      error: error.message
    });
  }
};

// @desc    Reply to review (admin)
// @route   POST /api/reviews/admin/:id/reply
// @access  Private/Admin
exports.replyToReview = async (req, res) => {
  try {
    const { message } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.adminReply = {
      message,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };

    await review.save();
    await review.populate('adminReply.repliedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: review
    });
  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message
    });
  }
};

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
exports.deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};
