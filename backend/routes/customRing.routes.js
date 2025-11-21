const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // Use SendGrid
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Fallback to Gmail or other SMTP
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

// @route   POST /api/custom-ring-request
// @desc    Submit custom ring request
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      ringType,
      metal,
      purity,
      stoneType,
      stoneSize,
      ringSize,
      engraving,
      budget,
      designPreference,
      additionalDetails
    } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone number'
      });
    }

    // Create email content
    const emailContent = `
      <h2>New Custom Ring Request</h2>
      <p>A new custom ring request has been submitted on La Factoria del Oro.</p>
      
      <h3>Customer Information</h3>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
      </ul>

      <h3>Ring Specifications</h3>
      <ul>
        ${ringType ? `<li><strong>Ring Type:</strong> ${ringType}</li>` : ''}
        ${metal ? `<li><strong>Metal:</strong> ${metal}</li>` : ''}
        ${purity ? `<li><strong>Purity:</strong> ${purity}</li>` : ''}
        ${stoneType ? `<li><strong>Stone Type:</strong> ${stoneType}</li>` : ''}
        ${stoneSize ? `<li><strong>Stone Size:</strong> ${stoneSize}</li>` : ''}
        ${ringSize ? `<li><strong>Ring Size:</strong> ${ringSize}</li>` : ''}
        ${engraving ? `<li><strong>Engraving:</strong> ${engraving}</li>` : ''}
        ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ''}
      </ul>

      ${designPreference ? `
      <h3>Design Preference</h3>
      <p>${designPreference}</p>
      ` : ''}

      ${additionalDetails ? `
      <h3>Additional Details</h3>
      <p>${additionalDetails}</p>
      ` : ''}

      <hr>
      <p><em>This request was submitted on ${new Date().toLocaleString()}</em></p>
    `;

    // Create plain text version
    const textContent = `
New Custom Ring Request

Customer Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

Ring Specifications:
${ringType ? `- Ring Type: ${ringType}` : ''}
${metal ? `- Metal: ${metal}` : ''}
${purity ? `- Purity: ${purity}` : ''}
${stoneType ? `- Stone Type: ${stoneType}` : ''}
${stoneSize ? `- Stone Size: ${stoneSize}` : ''}
${ringSize ? `- Ring Size: ${ringSize}` : ''}
${engraving ? `- Engraving: ${engraving}` : ''}
${budget ? `- Budget: ${budget}` : ''}

${designPreference ? `Design Preference:\n${designPreference}\n` : ''}
${additionalDetails ? `Additional Details:\n${additionalDetails}\n` : ''}

Submitted on: ${new Date().toLocaleString()}
    `.trim();

    // Send email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lafactoriadeloro.com',
      to: 'samitom11jewelry@gmail.com',
      subject: `Custom Ring Request from ${name}`,
      text: textContent,
      html: emailContent,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    // Send confirmation email to customer
    const confirmationEmail = {
      from: process.env.EMAIL_FROM || 'noreply@lafactoriadeloro.com',
      to: email,
      subject: 'We Received Your Custom Ring Request!',
      html: `
        <h2>Thank you for your custom ring request!</h2>
        <p>Dear ${name},</p>
        <p>We have received your custom ring request and one of our jewelry specialists will contact you within 24 hours to discuss your design.</p>
        
        <h3>Your Request Details:</h3>
        <ul>
          ${ringType ? `<li><strong>Ring Type:</strong> ${ringType}</li>` : ''}
          ${metal ? `<li><strong>Metal:</strong> ${metal}</li>` : ''}
          ${purity ? `<li><strong>Purity:</strong> ${purity}</li>` : ''}
          ${stoneType ? `<li><strong>Stone Type:</strong> ${stoneType}</li>` : ''}
          ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ''}
        </ul>

        <p>If you have any immediate questions, feel free to contact us at samitom11jewelry@gmail.com</p>
        
        <p>Best regards,<br>La Factoria del Oro Team</p>
      `,
      text: `
Thank you for your custom ring request!

Dear ${name},

We have received your custom ring request and one of our jewelry specialists will contact you within 24 hours to discuss your design.

If you have any immediate questions, feel free to contact us at samitom11jewelry@gmail.com

Best regards,
La Factoria del Oro Team
      `
    };

    try {
      await transporter.sendMail(confirmationEmail);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't fail the request if confirmation email fails
    }

    res.status(200).json({
      success: true,
      message: 'Custom ring request submitted successfully'
    });

  } catch (error) {
    console.error('Error processing custom ring request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process custom ring request',
      error: error.message
    });
  }
});

module.exports = router;
