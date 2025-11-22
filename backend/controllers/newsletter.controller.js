const Newsletter = require('../models/Newsletter.model');
const emailService = require('../services/emailService');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        subscriber.status = 'active';
        subscriber.subscribedAt = Date.now();
        subscriber.unsubscribedAt = undefined;
        await subscriber.save();

        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        });
      }
    }

    // Create new subscriber
    subscriber = await Newsletter.create({
      email: email.toLowerCase(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      source: req.body.source || 'website-footer'
    });

    // Send welcome email
    try {
      const welcomeEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d4af37;">Welcome to La Factoria del Oro!</h2>
          <p>Thank you for subscribing to our newsletter!</p>
          <p>You'll now receive:</p>
          <ul>
            <li>✨ Exclusive jewelry collection previews</li>
            <li>💎 Special offers and discounts</li>
            <li>🎁 Early access to new arrivals</li>
            <li>📰 Jewelry care tips and trends</li>
          </ul>
          <p>We're excited to have you with us!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            If you wish to unsubscribe, click <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe/${subscriber._id}">here</a>.
          </p>
        </div>
      `;
      
      await emailService.sendEmail(
        email,
        'Welcome to La Factoria del Oro Newsletter! 💍',
        welcomeEmailHtml
      );
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed! Check your email for confirmation.',
      data: { email: subscriber.email }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again.',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email, subscriberId } = req.body;

    let subscriber;
    if (subscriberId) {
      subscriber = await Newsletter.findById(subscriberId);
    } else if (email) {
      subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    if (subscriber.status === 'unsubscribed') {
      return res.status(400).json({
        success: false,
        message: 'Already unsubscribed'
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error.message
    });
  }
};

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getAllSubscribers = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Newsletter.countDocuments(query);

    const stats = {
      total: await Newsletter.countDocuments(),
      active: await Newsletter.countDocuments({ status: 'active' }),
      unsubscribed: await Newsletter.countDocuments({ status: 'unsubscribed' })
    };

    res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message
    });
  }
};

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully'
    });

  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber',
      error: error.message
    });
  }
};

// @desc    Send newsletter email to all subscribers (Admin)
// @route   POST /api/newsletter/send
// @access  Private/Admin
exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, htmlContent, textContent } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ status: 'active' });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (subscriber) => {
        try {
          const unsubscribeLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/newsletter/unsubscribe/${subscriber._id}`;
          
          const newsletterHtml = `
            ${htmlContent}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
              You're receiving this because you subscribed to La Factoria del Oro newsletter.<br>
              <a href="${unsubscribeLink}">Unsubscribe</a>
            </p>
          `;
          
          await emailService.sendEmail(
            subscriber.email,
            subject,
            newsletterHtml
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
          failCount++;
        }
      }));

      // Wait between batches to avoid rate limiting
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.status(200).json({
      success: true,
      message: `Newsletter sent successfully to ${successCount} subscribers`,
      stats: {
        total: subscribers.length,
        sent: successCount,
        failed: failCount
      }
    });

  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message
    });
  }
};

// @desc    Export subscribers (Admin)
// @route   GET /api/newsletter/export
// @access  Private/Admin
exports.exportSubscribers = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const subscribers = await Newsletter.find(query)
      .select('email status subscribedAt unsubscribedAt')
      .sort({ subscribedAt: -1 });

    // Create CSV content
    let csv = 'Email,Status,Subscribed At,Unsubscribed At\n';
    subscribers.forEach(sub => {
      csv += `${sub.email},${sub.status},${sub.subscribedAt || ''},${sub.unsubscribedAt || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export subscribers',
      error: error.message
    });
  }
};
