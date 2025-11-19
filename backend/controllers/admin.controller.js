const User = require('../models/User.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

// @desc    Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total orders
    const totalOrders = await Order.countDocuments();
    
    // Total revenue
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' }
        }
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total products
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name')
      .sort('-createdAt')
      .limit(10);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$totalStock', '$lowStockThreshold'] }
    }).select('name totalStock lowStockThreshold');

    // Sales this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const monthlyRevenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$pricing.total' }
        }
      }
    ]);
    const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].revenue : 0;

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalProducts,
          pendingOrders,
          lowStockProducts: lowStockProducts.length,
          monthlyOrders,
          monthlyRevenue
        },
        recentOrders,
        ordersByStatus,
        lowStockItems: lowStockProducts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deactivating admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate admin users'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling user status',
      error: error.message
    });
  }
};

// @desc    Get sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupByFormat;
    switch (groupBy) {
      case 'month':
        groupByFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        break;
      case 'week':
        groupByFormat = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        break;
      case 'day':
      default:
        groupByFormat = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByFormat,
          totalSales: { $sum: '$pricing.total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        salesData,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales report',
      error: error.message
    });
  }
};

// @desc    Test email configuration
exports.testEmailConfiguration = async (req, res) => {
  try {
    const { testEmailConfig, sendEmail } = require('../utils/email.utils');
    
    // First verify the configuration
    const configTest = await testEmailConfig();
    
    if (!configTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Email configuration is invalid',
        error: configTest.message
      });
    }

    // Send a test email to the admin
    const testEmail = req.body.testEmail || req.user.email;
    
    await sendEmail({
      to: testEmail,
      subject: 'Test Email - La Factoria Del Oro',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #222;">Email Configuration Test</h1>
            <p>This is a test email from La Factoria Del Oro e-commerce platform.</p>
            <p>If you received this email, your email configuration is working correctly!</p>
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Email Service:</strong> ${process.env.EMAIL_SERVICE || 'SMTP'}</p>
              <p><strong>From Address:</strong> ${process.env.EMAIL_FROM}</p>
              <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Best regards,<br>La Factoria Del Oro Team</p>
          </div>
        </body>
        </html>
      `
    });

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      config: {
        service: process.env.EMAIL_SERVICE || 'SMTP',
        from: process.env.EMAIL_FROM
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};
