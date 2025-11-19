const nodemailer = require('nodemailer');

// Create reusable transporter based on configured email service
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'smtp';

  switch (emailService.toLowerCase()) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    case 'sendgrid':
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });

    case 'ses':
      const aws = require('@aws-sdk/client-ses');
      const { defaultProvider } = require('@aws-sdk/credential-provider-node');
      
      const ses = new aws.SES({
        apiVersion: '2010-12-01',
        region: process.env.AWS_REGION || 'us-east-1',
        credentialDefaultProvider: defaultProvider()
      });

      return nodemailer.createTransport({
        SES: { ses, aws }
      });

    case 'smtp':
    default:
      // Generic SMTP configuration
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
  }
};

let transporter;

// Initialize transporter
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Test email configuration
exports.testEmailConfig = async () => {
  try {
    const testTransporter = getTransporter();
    await testTransporter.verify();
    console.log('✓ Email configuration is valid and ready to send emails');
    return { success: true, message: 'Email configuration verified' };
  } catch (error) {
    console.error('✗ Email configuration error:', error.message);
    return { success: false, message: error.message };
  }
};

// Send email function
exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_NAME 
      ? `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`
      : process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  try {
    const emailTransporter = getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✓ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('✗ Email error:', error.message);
    
    // Log more helpful error messages
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed. Check EMAIL_HOST and EMAIL_PORT');
    }
    
    throw error;
  }
};

// Email templates
exports.sendOrderConfirmation = async (order, user) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #222;">Order Confirmation</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Thank you for your order! Your order has been confirmed and will be processed shortly.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Order Status:</strong> ${order.orderStatus}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #222; color: white;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin: 20px 0;">
          <p><strong>Subtotal:</strong> $${order.pricing.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${order.pricing.tax.toFixed(2)}</p>
          <p><strong>Shipping:</strong> $${order.pricing.shipping.toFixed(2)}</p>
          ${order.pricing.discount > 0 ? `<p><strong>Discount:</strong> -$${order.pricing.discount.toFixed(2)}</p>` : ''}
          <p style="font-size: 20px; color: #222;"><strong>Total:</strong> $${order.pricing.total.toFixed(2)}</p>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Shipping Address</h3>
          <p>
            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
            ${order.shippingAddress.addressLine1}<br>
            ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>

        <p>You can track your order status in your account dashboard.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>La Factoria Del Oro Team</p>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html
  });
};

exports.sendOrderStatusUpdate = async (order, user, newStatus) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #222;">Order Status Update</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your order status has been updated.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>New Status:</strong> <span style="color: #222; font-weight: bold; text-transform: uppercase;">${newStatus}</span></p>
          ${order.trackingInfo && order.trackingInfo.trackingNumber ? `
            <p><strong>Tracking Number:</strong> ${order.trackingInfo.trackingNumber}</p>
            ${order.trackingInfo.trackingUrl ? `<p><a href="${order.trackingInfo.trackingUrl}" style="color: #222;">Track Your Package</a></p>` : ''}
          ` : ''}
        </div>

        <p>You can view full order details in your account dashboard.</p>
        
        <p>Best regards,<br>La Factoria Del Oro Team</p>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    to: user.email,
    subject: `Order Status Update - ${order.orderNumber}`,
    html
  });
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to La Factoria Del Oro</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #222;">Welcome to La Factoria Del Oro!</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Thank you for creating an account with us. We're excited to have you as part of our jewelry community.</p>
        
        <p>With your account, you can:</p>
        <ul>
          <li>Browse our exclusive collection of rings</li>
          <li>Track your orders in real-time</li>
          <li>Save items to your wishlist</li>
          <li>Manage your addresses for faster checkout</li>
          <li>Receive exclusive offers and updates</li>
        </ul>

        <p>Start exploring our collection and find the perfect piece for you or your loved ones.</p>
        
        <p>Best regards,<br>La Factoria Del Oro Team</p>
      </div>
    </body>
    </html>
  `;

  await this.sendEmail({
    to: user.email,
    subject: 'Welcome to La Factoria Del Oro',
    html
  });
};
