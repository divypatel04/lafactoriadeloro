let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.error('❌ Failed to load nodemailer:', error.message);
}

const emailTemplates = require('../utils/emailTemplates');

/**
 * Email Service
 * Handles all email sending functionality using nodemailer
 */

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  // Check if nodemailer is available
  if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
    console.error('❌ Nodemailer not properly loaded or createTransport is not a function');
    return null;
  }

  // Check if email configuration is set
  if (!process.env.EMAIL_USER || 
      !process.env.EMAIL_PASSWORD || 
      process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.warn('⚠️  Email service not configured. Emails will not be sent.');
    return null;
  }

  try {
    // Remove spaces from password (Gmail App Password format)
    const cleanPassword = process.env.EMAIL_PASSWORD.replace(/\s+/g, '');
    
    // Try port 465 with SSL if 587 fails (Railway may block 587)
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const isSecure = port === 465;
    
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: port,
      secure: isSecure, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    };

    console.log(`📧 Attempting to connect to ${emailConfig.host}:${emailConfig.port} (secure: ${isSecure})`);

    // Use createTransport (correct method name)
    transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service verification failed:', error.message);
        console.error('Check your email credentials:');
        console.error(`  - EMAIL_HOST: ${emailConfig.host}`);
        console.error(`  - EMAIL_PORT: ${emailConfig.port}`);
        console.error(`  - EMAIL_USER: ${process.env.EMAIL_USER}`);
        console.error(`  - EMAIL_PASSWORD: ${cleanPassword ? '***configured***' : 'NOT SET'}`);
      } else {
        console.log('✅ Email service verified and ready to send emails');
        console.log(`  - Using: ${process.env.EMAIL_USER}`);
        console.log(`  - Host: ${emailConfig.host}:${emailConfig.port}`);
      }
    });

    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

/**
 * Send email helper function
 */
const sendEmail = async (to, subject, html) => {
  const emailTransporter = createTransporter();
  
  if (!emailTransporter) {
    console.warn('Email not sent - service not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"La Factoria Del Oro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error(`   To: ${to}`);
    console.error(`   Subject: ${subject}`);
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Error Response: ${error.response}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email
 */
exports.sendOrderConfirmation = async (order, customer) => {
  try {
    const html = emailTemplates.orderConfirmationTemplate(order, customer);
    const result = await sendEmail(
      customer.email,
      `Order Confirmation - ${order.orderNumber}`,
      html
    );
    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update email
 */
exports.sendOrderStatusUpdate = async (order, customer, newStatus) => {
  try {
    const html = emailTemplates.orderStatusUpdateTemplate(order, customer, newStatus);
    const statusTitles = {
      processing: 'Order Processing',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled'
    };
    
    const result = await sendEmail(
      customer.email,
      `${statusTitles[newStatus] || 'Order Update'} - ${order.orderNumber}`,
      html
    );
    return result;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment failed notification
 */
exports.sendPaymentFailed = async (order, customer, errorMessage) => {
  try {
    const html = emailTemplates.paymentFailedTemplate(order, customer, errorMessage);
    const result = await sendEmail(
      customer.email,
      `Payment Failed - Action Required - ${order.orderNumber}`,
      html
    );
    return result;
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new users
 */
exports.sendWelcomeEmail = async (user) => {
  try {
    const html = emailTemplates.welcomeEmailTemplate(user);
    const result = await sendEmail(
      user.email,
      'Welcome to La Factoria Del Oro ✨',
      html
    );
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordReset = async (user, resetToken) => {
  try {
    const html = emailTemplates.passwordResetTemplate(user, resetToken);
    const result = await sendEmail(
      user.email,
      'Password Reset Request - La Factoria Del Oro',
      html
    );
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify email connection (for testing)
 */
exports.verifyConnection = async () => {
  const emailTransporter = createTransporter();
  
  if (!emailTransporter) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    await emailTransporter.verify();
    console.log('✅ Email server connection verified');
    return { success: true, message: 'Email server ready' };
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return { success: false, error: error.message };
  }
};
