const Settings = require('../models/Settings.model');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Return public settings only (hide sensitive info)
    const publicSettings = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      favicon: settings.favicon,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      businessHours: settings.businessHours,
      socialMedia: settings.socialMedia,
      payment: {
        stripeEnabled: settings.payment.stripeEnabled,
        paypalEnabled: settings.payment.paypalEnabled,
        codEnabled: settings.payment.codEnabled,
        currency: settings.payment.currency,
        currencySymbol: settings.payment.currencySymbol
      },
      shipping: settings.shipping,
      store: {
        maintenanceMode: settings.store.maintenanceMode,
        maintenanceMessage: settings.store.maintenanceMessage,
        allowGuestCheckout: settings.store.allowGuestCheckout
      },
      seo: {
        metaTitle: settings.seo.metaTitle,
        metaDescription: settings.seo.metaDescription,
        metaKeywords: settings.seo.metaKeywords
      }
    };

    res.status(200).json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// @desc    Get all settings (admin)
// @route   GET /api/settings/admin
// @access  Private/Admin
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;

    // Validate tax rate
    if (updates.tax && updates.tax.rate !== undefined) {
      if (updates.tax.rate < 0 || updates.tax.rate > 100) {
        return res.status(400).json({
          success: false,
          message: 'Tax rate must be between 0 and 100'
        });
      }
    }

    // Validate free shipping threshold
    if (updates.shipping && updates.shipping.freeShippingThreshold !== undefined) {
      if (updates.shipping.freeShippingThreshold < 0) {
        return res.status(400).json({
          success: false,
          message: 'Free shipping threshold cannot be negative'
        });
      }
    }

    const settings = await Settings.updateSettings(updates);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res) => {
  try {
    // Delete existing settings
    await Settings.deleteMany({});
    
    // Create new default settings
    const settings = await Settings.create({});

    res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings',
      error: error.message
    });
  }
};

// @desc    Update specific setting section
// @route   PATCH /api/settings/:section
// @access  Private/Admin
exports.updateSettingSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updates = req.body;

    const validSections = [
      'siteName', 'siteDescription', 'logo', 'favicon',
      'contactEmail', 'contactPhone', 'address', 'businessHours',
      'socialMedia', 'payment', 'tax', 'shipping', 'email',
      'seo', 'store', 'notifications', 'legal'
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section: ${section}`
      });
    }

    const settings = await Settings.getSettings();
    
    if (typeof settings[section] === 'object' && !Array.isArray(settings[section])) {
      settings[section] = { ...settings[section], ...updates };
    } else {
      settings[section] = updates;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: `${section} updated successfully`,
      data: settings[section]
    });
  } catch (error) {
    console.error('Update setting section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating setting section',
      error: error.message
    });
  }
};

// @desc    Get setting by section
// @route   GET /api/settings/:section
// @access  Public
exports.getSettingSection = async (req, res) => {
  try {
    const { section } = req.params;
    const settings = await Settings.getSettings();

    if (!settings[section]) {
      return res.status(404).json({
        success: false,
        message: `Section not found: ${section}`
      });
    }

    res.status(200).json({
      success: true,
      data: settings[section]
    });
  } catch (error) {
    console.error('Get setting section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setting section',
      error: error.message
    });
  }
};
