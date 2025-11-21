const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const emailService = require('../services/emailService');

// @desc    Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, couponCode } = req.body;

    // Validate items and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Support both formats: item.product or item.productId
      const productId = item.product || item.productId;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Use provided price (already calculated with modifiers on frontend)
      const price = item.price || product.basePrice;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        selectedOptions: item.selectedOptions || {},
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal
      });
    }

    // Calculate tax and shipping (simplified - you can make this more complex)
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const shipping = subtotal > 500 ? 0 : 15; // Free shipping over $500
    
    // Apply coupon if provided
    let discount = 0;
    let appliedCouponCode = null;
    if (req.body.couponCode) {
      try {
        const Coupon = require('../models/Coupon.model');
        const coupon = await Coupon.findValidCoupon(req.body.couponCode);
        
        // Validate coupon conditions
        if (coupon.minOrderAmount > subtotal) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`
          });
        }
        
        if (!coupon.canUserUse(req.user.id)) {
          return res.status(400).json({
            success: false,
            message: 'You have already used this coupon the maximum number of times'
          });
        }
        
        // Calculate discount
        discount = coupon.calculateDiscount(subtotal, shipping);
        appliedCouponCode = coupon.code;
        
        // Apply coupon (increment usage)
        await coupon.applyCoupon(req.user.id, null); // Order ID will be updated after creation
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message || 'Invalid coupon code'
        });
      }
    }
    
    const total = subtotal + tax + shipping - discount;

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      pricing: {
        subtotal,
        tax,
        shipping,
        discount,
        total
      },
      couponCode: appliedCouponCode,
      paymentInfo: {
        method: 'cod' // Default to COD for now
      }
    });

    // Save order (this will trigger the pre-save hook to generate orderNumber)
    await order.save();

    // Update product stock for each item (using updateOne to avoid validation issues)
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity, totalStock: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    // Populate order for response
    await order.populate('items.product');

    // Send order confirmation email (only if not paid via Stripe webhook)
    if (!order.isPaid) {
      const user = await User.findById(req.user.id);
      emailService.sendOrderConfirmation(order, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }).catch(err => 
        console.error('Order confirmation email error:', err)
      );
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit
      }
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.orderStatus = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user.id,
      timestamp: Date.now()
    });

    // Update payment status if order is confirmed
    if (status === 'confirmed' && order.paymentInfo.method === 'cod') {
      order.paymentStatus = 'pending';
    }

    // Update delivered date
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'paid'; // Assume payment received on delivery for COD
      order.paymentInfo.paidAt = Date.now();
    }

    await order.save();

    // Send status update email
    const user = await User.findById(order.user);
    if (user) {
      emailService.sendOrderStatusUpdate(order, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }, status).catch(err =>
        console.error('Status update email error:', err)
      );
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Update tracking info (Admin)
exports.updateTrackingInfo = async (req, res) => {
  try {
    const { carrier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.trackingInfo = {
      carrier,
      trackingNumber,
      trackingUrl,
      shippedAt: Date.now(),
      estimatedDelivery
    };

    // Update order status to shipped if not already
    if (order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered') {
      order.orderStatus = 'shipped';
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update tracking info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tracking info',
      error: error.message
    });
  }
};
