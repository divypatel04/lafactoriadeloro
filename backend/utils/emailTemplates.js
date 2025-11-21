/**
 * Email Templates for La Factoria Del Oro
 * HTML email templates with inline styles for maximum compatibility
 */

// Base styles for all emails
const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: #f4f4f4;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
    padding: 30px 20px;
    text-align: center;
  }
  .header h1 {
    margin: 0;
    color: #2c3e50;
    font-size: 28px;
    font-weight: 600;
  }
  .content {
    padding: 40px 30px;
    color: #333333;
    line-height: 1.6;
  }
  .button {
    display: inline-block;
    padding: 12px 30px;
    background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
    color: #2c3e50 !important;
    text-decoration: none;
    border-radius: 5px;
    font-weight: 600;
    margin: 20px 0;
  }
  .footer {
    background-color: #2c3e50;
    color: #ffffff;
    padding: 30px;
    text-align: center;
    font-size: 14px;
  }
  .order-details {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .order-item {
    border-bottom: 1px solid #e0e0e0;
    padding: 15px 0;
  }
  .order-item:last-child {
    border-bottom: none;
  }
  .total-row {
    font-weight: 600;
    font-size: 18px;
    color: #D4AF37;
    padding-top: 15px;
    border-top: 2px solid #D4AF37;
  }
`;

/**
 * Order Confirmation Email Template
 */
exports.orderConfirmationTemplate = (order, customer) => {
  const itemsHtml = order.items.map(item => `
    <div class="order-item">
      <strong>${item.productName || item.name || 'Product'}</strong><br>
      <span style="color: #666;">
        ${item.selectedOptions?.material || ''} ${item.selectedOptions?.purity || ''} 
        ${item.selectedOptions?.ringSize ? `- Size ${item.selectedOptions.ringSize}` : ''}
      </span><br>
      <span style="color: #666;">Quantity: ${item.quantity}</span>
      <span style="float: right; font-weight: 600;">$${(item.price || 0).toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✨ La Factoria Del Oro</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #D4AF37; margin-top: 0;">Thank You for Your Order! 🎉</h2>
          
          <p>Dear ${customer.firstName} ${customer.lastName},</p>
          
          <p>We're delighted to confirm your order. Your exquisite jewelry will be carefully crafted and shipped to you soon.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #2c3e50;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Payment Status:</strong> <span style="color: #27ae60;">Paid</span></p>
            
            <h4 style="margin-top: 25px; margin-bottom: 15px;">Items:</h4>
            ${itemsHtml}
            
            <div style="margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Subtotal:</span>
                <span>$${(order.pricing?.subtotal || order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Tax:</span>
                <span>$${(order.pricing?.tax || order.tax || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Shipping:</span>
                <span>$${(order.pricing?.shipping || order.shippingCost || 0).toFixed(2)}</span>
              </div>
              ${(order.pricing?.discount || order.discount) ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #27ae60;">
                <span>Discount (${order.couponCode || 'Coupon'}):</span>
                <span>-$${(order.pricing?.discount || order.discount || 0).toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-row" style="display: flex; justify-content: space-between; margin-top: 15px;">
                <span>Total:</span>
                <span>$${(order.pricing?.total || order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="order-details" style="margin-top: 30px;">
            <h4 style="margin-top: 0;">Shipping Address</h4>
            <p style="margin: 5px 0;">
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          
          <p style="margin-top: 30px;">
            <strong>Estimated Delivery:</strong> 5-7 business days<br>
            You'll receive a shipping confirmation email with tracking information once your order ships.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">
              Track Your Order
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions about your order, please don't hesitate to contact us at 
            <a href="mailto:support@lafactoriadeloro.com" style="color: #D4AF37;">support@lafactoriadeloro.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #D4AF37;">✨ La Factoria Del Oro</p>
          <p style="margin: 5px 0; font-size: 13px;">Exquisite Fine Jewelry</p>
          <p style="margin: 5px 0; font-size: 12px; color: #bbb;">
            This email was sent to ${customer.email}<br>
            © ${new Date().getFullYear()} La Factoria Del Oro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Order Status Update Email Template
 */
exports.orderStatusUpdateTemplate = (order, customer, newStatus) => {
  const statusMessages = {
    processing: {
      title: 'Order is Being Processed',
      message: 'Your order is currently being prepared with care.',
      icon: '📦'
    },
    shipped: {
      title: 'Order Has Been Shipped!',
      message: 'Your order is on its way to you!',
      icon: '🚚'
    },
    delivered: {
      title: 'Order Delivered',
      message: 'Your order has been successfully delivered!',
      icon: '✅'
    },
    cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled as requested.',
      icon: '❌'
    }
  };

  const statusInfo = statusMessages[newStatus] || statusMessages.processing;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✨ La Factoria Del Oro</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #D4AF37; margin-top: 0;">${statusInfo.icon} ${statusInfo.title}</h2>
          
          <p>Dear ${customer.firstName} ${customer.lastName},</p>
          
          <p>${statusInfo.message}</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Information</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Status:</strong> <span style="color: #D4AF37; text-transform: capitalize;">${newStatus}</span></p>
            ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
            ${order.trackingUrl ? `
              <p style="margin-top: 15px;">
                <a href="${order.trackingUrl}" class="button" style="display: inline-block;">
                  Track Your Package
                </a>
              </p>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" class="button">
              View Order Details
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Questions? Contact us at 
            <a href="mailto:support@lafactoriadeloro.com" style="color: #D4AF37;">support@lafactoriadeloro.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #D4AF37;">✨ La Factoria Del Oro</p>
          <p style="margin: 5px 0; font-size: 12px; color: #bbb;">
            © ${new Date().getFullYear()} La Factoria Del Oro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Payment Failed Email Template
 */
exports.paymentFailedTemplate = (order, customer, errorMessage) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✨ La Factoria Del Oro</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #e74c3c; margin-top: 0;">⚠️ Payment Could Not Be Processed</h2>
          
          <p>Dear ${customer.firstName} ${customer.lastName},</p>
          
          <p>We encountered an issue processing your payment for order <strong>${order.orderNumber}</strong>.</p>
          
          <div class="order-details" style="background-color: #fff3cd; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Error:</strong> ${errorMessage || 'Payment declined by your bank'}</p>
          </div>
          
          <h3 style="color: #2c3e50;">What to do next:</h3>
          <ul style="line-height: 1.8;">
            <li>Verify your card details are correct</li>
            <li>Ensure you have sufficient funds</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
          
          <p>Your order is being held for 24 hours. Please complete the payment to avoid cancellation.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}/retry-payment" class="button">
              Retry Payment
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Need help? Contact our support team at 
            <a href="mailto:support@lafactoriadeloro.com" style="color: #D4AF37;">support@lafactoriadeloro.com</a>
            or call us at (XXX) XXX-XXXX
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #D4AF37;">✨ La Factoria Del Oro</p>
          <p style="margin: 5px 0; font-size: 12px; color: #bbb;">
            © ${new Date().getFullYear()} La Factoria Del Oro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Welcome Email Template
 */
exports.welcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to La Factoria Del Oro</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✨ La Factoria Del Oro</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #D4AF37; margin-top: 0;">Welcome to Our Family! 🎉</h2>
          
          <p>Dear ${user.firstName} ${user.lastName},</p>
          
          <p>Thank you for joining La Factoria Del Oro! We're thrilled to have you as part of our community of fine jewelry enthusiasts.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Your Account Benefits:</h3>
            <ul style="line-height: 1.8; padding-left: 20px;">
              <li>✨ Track your orders in real-time</li>
              <li>💝 Save items to your wishlist</li>
              <li>🎯 Get personalized recommendations</li>
              <li>🔔 Receive exclusive offers and updates</li>
              <li>⚡ Faster checkout experience</li>
            </ul>
          </div>
          
          <p>Explore our exquisite collection of handcrafted jewelry, from stunning engagement rings to elegant necklaces and bracelets.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop" class="button">
              Start Shopping
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <strong>💡 Tip:</strong> Subscribe to our newsletter to receive 10% off your first purchase!
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Questions? We're here to help! Contact us at 
            <a href="mailto:support@lafactoriadeloro.com" style="color: #D4AF37;">support@lafactoriadeloro.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #D4AF37;">✨ La Factoria Del Oro</p>
          <p style="margin: 5px 0; font-size: 13px;">Exquisite Fine Jewelry</p>
          <p style="margin: 5px 0; font-size: 12px; color: #bbb;">
            © ${new Date().getFullYear()} La Factoria Del Oro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Password Reset Email Template
 */
exports.passwordResetTemplate = (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>✨ La Factoria Del Oro</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #D4AF37; margin-top: 0;">🔒 Password Reset Request</h2>
          
          <p>Dear ${user.firstName} ${user.lastName},</p>
          
          <p>We received a request to reset the password for your La Factoria Del Oro account.</p>
          
          <div class="order-details" style="background-color: #e3f2fd; border-left: 4px solid #2196f3;">
            <p style="margin: 0;"><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
          </div>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" class="button">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #D4AF37; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div class="order-details" style="background-color: #fff3cd; border-left: 4px solid #ffc107; margin-top: 30px;">
            <p style="margin: 0;"><strong>⚠️ Security Tip:</strong> If you didn't request this password reset, please ignore this email or contact us immediately if you suspect unauthorized access to your account.</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Need help? Contact us at 
            <a href="mailto:support@lafactoriadeloro.com" style="color: #D4AF37;">support@lafactoriadeloro.com</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #D4AF37;">✨ La Factoria Del Oro</p>
          <p style="margin: 5px 0; font-size: 12px; color: #bbb;">
            © ${new Date().getFullYear()} La Factoria Del Oro. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
