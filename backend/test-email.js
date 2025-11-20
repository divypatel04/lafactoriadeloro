const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'samitom11jewelry@gmail.com',
    pass: 'khtwhofyrkudmtmw'
  },
  tls: {
    rejectUnauthorized: false
  }
};

console.log('📧 Testing Email Service...');
console.log('Config:', {
  host: emailConfig.host,
  port: emailConfig.port,
  user: emailConfig.auth.user
});

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Server is ready to send emails');
    
    // Send test email
    const mailOptions = {
      from: '"La Factoria Del Oro" <samitom11jewelry@gmail.com>',
      to: 'pdivy2002@gmail.com',
      subject: 'Test Email - La Factoria Del Oro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d4af37;">La Factoria Del Oro</h1>
          <h2>Email Service Test</h2>
          <p>This is a test email to verify that the email service is working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: smtp.gmail.com</li>
            <li>Port: 587</li>
            <li>From: samitom11jewelry@gmail.com</li>
          </ul>
          <p style="color: #28a745; font-weight: bold;">✅ If you receive this email, the email service is working!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}<br>
            Test Email - La Factoria Del Oro E-commerce
          </p>
        </div>
      `
    };

    console.log('\n📤 Sending test email...');
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Failed to send email:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        console.log('📬 Check your inbox at: pdivy2002@gmail.com');
        console.log('\n🎉 Email service is working correctly!');
        process.exit(0);
      }
    });
  }
});
