const Contact = require('../models/Contact.model');
const { sendEmail } = require('../utils/email.utils');

/**
 * Submit contact form
 * @route POST /api/contact
 * @access Public
 */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Create contact inquiry
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      ipAddress,
      userAgent
    });

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.BUSINESS_EMAIL || 'contact@lafactoriadeloro.com',
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
          <p><small>IP Address: ${ipAddress}</small></p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message - La Factoria Del Oro',
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Best regards,<br>La Factoria Del Oro Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send auto-reply email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will respond shortly.',
      data: {
        id: contact._id
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.',
      error: error.message
    });
  }
};

/**
 * Get all contact inquiries (Admin)
 * @route GET /api/contact
 * @access Private/Admin
 */
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contacts',
      error: error.message
    });
  }
};

/**
 * Get single contact inquiry (Admin)
 * @route GET /api/contact/:id
 * @access Private/Admin
 */
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    // Mark as read if it's new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact',
      error: error.message
    });
  }
};

/**
 * Update contact status (Admin)
 * @route PUT /api/contact/:id
 * @access Private/Admin
 */
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact status updated',
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message
    });
  }
};

/**
 * Reply to contact inquiry (Admin)
 * @route POST /api/contact/:id/reply
 * @access Private/Admin
 */
exports.replyToContact = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    // Update contact with response
    contact.response = {
      message,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };
    contact.status = 'replied';
    await contact.save();

    // Send reply email
    try {
      await sendEmail({
        to: contact.email,
        subject: `Re: ${contact.subject}`,
        html: `
          <p>Dear ${contact.name},</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><strong>Your original message:</strong></p>
          <p>${contact.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Best regards,<br>La Factoria Del Oro Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Reply saved but failed to send email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: contact
    });
  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
};

/**
 * Delete contact inquiry (Admin)
 * @route DELETE /api/contact/:id
 * @access Private/Admin
 */
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact inquiry deleted'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: error.message
    });
  }
};
