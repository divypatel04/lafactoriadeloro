let nodemailer;
let sgMail; // SendGrid mail client

try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.error('❌ Failed to load nodemailer:', error.message);
}

try {
  sgMail = require('@sendgrid/mail');
} catch (error) {
  console.log('ℹ️  SendGrid not installed (optional for Railway)');
}

const emailTemplates = require('../utils/emailTemplates');

/**
 * Email Service
 * Handles all email sending functionality using SendGrid (preferred) or nodemailer
 * Railway blocks SMTP ports, so SendGrid HTTP API is more reliable in production
 */

// Create transporter
let transporter = null;
let useSendGrid = false;

const createTransporter = () => {
  if (transporter) return transporter;

  // Try SendGrid first (works on Railway)
  if (process.env.SENDGRID_API_KEY && sgMail) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      useSendGrid = true;
      console.log('✅ Using SendGrid for email service (Railway-compatible)');
      console.log(`  - Sender: ${process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL}`);
      return { sendGrid: true }; // Return dummy transporter
    } catch (error) {
      console.error('❌ SendGrid initialization failed:', error.message);
    }
  }

  // Fallback to SMTP (for local development)
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
    
    // Try port 465 with SSL if 587 fails (Railway may block both)
    const port = parseInt(process.env.EMAIL_PORT) || 587;
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
        rejectUnauthorized: false
      }
    };

    console.log(`📧 Using SMTP for email service (local dev)`);
    console.log(`  - Connecting to ${emailConfig.host}:${emailConfig.port} (secure: ${isSecure})`);

    // Use createTransport (correct method name)
    transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP verification failed:', error.message);
        console.error('💡 For Railway deployment, use SendGrid instead (SMTP ports blocked)');
        console.error('Check your email credentials:');
        console.error(`  - EMAIL_HOST: ${emailConfig.host}`);
        console.error(`  - EMAIL_PORT: ${emailConfig.port}`);
        console.error(`  - EMAIL_USER: ${process.env.EMAIL_USER}`);
        console.error(`  - EMAIL_PASSWORD: ${cleanPassword ? '***configured***' : 'NOT SET'}`);
      } else {
        console.log('✅ SMTP email service verified and ready to send emails');
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
 * Uses SendGrid if available (Railway), otherwise falls back to SMTP (local dev)
 */
const sendEmail = async (to, subject, html) => {
  const emailTransporter = createTransporter();
  
  if (!emailTransporter) {
    console.warn('Email not sent - service not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    // Use SendGrid if configured (Railway)
    if (useSendGrid && sgMail) {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
      
      const msg = {
        to: to,
        from: {
          email: fromEmail,
          name: 'La Factoria Del Oro'
        },
        subject: subject,
        html: html
      };

      const result = await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      return { success: true, messageId: result[0].headers['x-message-id'] };
    }

    // Use SMTP (nodemailer) for local dev
    const mailOptions = {
      from: `"La Factoria Del Oro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via SMTP');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error(`   To: ${to}`);
    console.error(`   Subject: ${subject}`);
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Error Response: ${error.response}`);
    
    // Provide helpful message for Railway users
    if (error.code === 'ETIMEDOUT') {
      console.error('💡 SMTP timeout detected. Railway blocks SMTP ports.');
      console.error('   Solution: Install SendGrid and set SENDGRID_API_KEY');
      console.error('   Run: npm install @sendgrid/mail');
    }
    
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
