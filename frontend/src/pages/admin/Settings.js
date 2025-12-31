import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/admin/all');
      setSettings(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'contact', label: 'Contact & Address', icon: '📍' },
    { id: 'payment', label: 'Payment & Tax', icon: '💳' },
    { id: 'shipping', label: 'Shipping', icon: '📦' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'seo', label: 'SEO & Analytics', icon: '📊' },
    { id: 'store', label: 'Store Settings', icon: '🏪' },
    { id: 'social', label: 'Social Media', icon: '🌐' }
  ];

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="settings-error">Failed to load settings</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Site Settings</h1>
        <button 
          className="btn-save-settings"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  value={settings.siteDescription || ''}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="text"
                  value={settings.logo || ''}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label>Favicon URL</label>
                <input
                  type="text"
                  value={settings.favicon || ''}
                  onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={settings.legal?.companyName || ''}
                  onChange={(e) => handleInputChange('legal', 'companyName', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    value={settings.legal?.registrationNumber || ''}
                    onChange={(e) => handleInputChange('legal', 'registrationNumber', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>VAT Number</label>
                  <input
                    type="text"
                    value={settings.legal?.vatNumber || ''}
                    onChange={(e) => handleInputChange('legal', 'vatNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="settings-section">
              <h2>Contact & Address Information</h2>
              
              <div className="info-banner" style={{
                background: '#e3f2fd',
                border: '1px solid #2196F3',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>ℹ️</span>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px', color: '#1976D2' }}>
                    Global Contact Information
                  </strong>
                  <p style={{ margin: 0, color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
                    The contact information you enter here will be automatically displayed throughout your website, 
                    including the footer, contact page, and about page. Update these fields to change contact details 
                    across all pages at once.
                  </p>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="info@yourbusiness.com"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    This email will be displayed on your website and used for customer inquiries
                  </small>
                </div>
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input
                    type="tel"
                    value={settings.contactPhone || ''}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Include country code for international customers
                  </small>
                </div>
              </div>

              <h3>Business Address</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                This address will be displayed on your contact page and footer
              </p>
              
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={settings.address?.street || ''}
                  onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={settings.address?.city || ''}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={settings.address?.state || ''}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    value={settings.address?.zipCode || ''}
                    onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={settings.address?.country || ''}
                    onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment & Tax Tab */}
          {activeTab === 'payment' && (
            <div className="settings-section">
              <h2>Payment & Tax Settings</h2>
              
              <h3>Payment Methods</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.payment?.stripeEnabled || false}
                    onChange={(e) => handleInputChange('payment', 'stripeEnabled', e.target.checked)}
                  />
                  <span>Enable Stripe Payments</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.payment?.paypalEnabled || false}
                    onChange={(e) => handleInputChange('payment', 'paypalEnabled', e.target.checked)}
                  />
                  <span>Enable PayPal</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.payment?.codEnabled || false}
                    onChange={(e) => handleInputChange('payment', 'codEnabled', e.target.checked)}
                  />
                  <span>Enable Cash on Delivery</span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={settings.payment?.currency || 'USD'}
                    onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.payment?.currencySymbol || '$'}
                    onChange={(e) => handleInputChange('payment', 'currencySymbol', e.target.value)}
                  />
                </div>
              </div>

              <h3>Tax Configuration</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.tax?.enabled || false}
                    onChange={(e) => handleInputChange('tax', 'enabled', e.target.checked)}
                  />
                  <span>Enable Tax Calculation</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.tax?.includedInPrice || false}
                    onChange={(e) => handleInputChange('tax', 'includedInPrice', e.target.checked)}
                  />
                  <span>Tax Included in Product Price</span>
                </label>
              </div>

              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.tax?.rate || 0}
                  onChange={(e) => handleInputChange('tax', 'rate', parseFloat(e.target.value))}
                />
                <small>Enter the tax rate as a percentage (e.g., 8.5 for 8.5%)</small>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="settings-section">
              <h2>Shipping Settings</h2>
              
              <div className="form-group">
                <label>Free Shipping Threshold</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.shipping?.freeShippingThreshold || 0}
                  onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                />
                <small>Set to 0 to disable free shipping. Orders above this amount get free shipping.</small>
              </div>

              <div className="form-group">
                <label>Flat Rate Shipping Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.shipping?.flatRate || 0}
                  onChange={(e) => handleInputChange('shipping', 'flatRate', parseFloat(e.target.value))}
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.shipping?.internationalShipping || false}
                    onChange={(e) => handleInputChange('shipping', 'internationalShipping', e.target.checked)}
                  />
                  <span>Enable International Shipping</span>
                </label>
              </div>

              <h3>Estimated Delivery Times</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Domestic Min (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.shipping?.estimatedDeliveryDays?.domestic?.min || ''}
                    onChange={(e) => handleNestedInputChange('shipping', 'estimatedDeliveryDays', 'domestic', { 
                      ...settings.shipping?.estimatedDeliveryDays?.domestic,
                      min: parseInt(e.target.value) 
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Domestic Max (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.shipping?.estimatedDeliveryDays?.domestic?.max || ''}
                    onChange={(e) => handleNestedInputChange('shipping', 'estimatedDeliveryDays', 'domestic', { 
                      ...settings.shipping?.estimatedDeliveryDays?.domestic,
                      max: parseInt(e.target.value) 
                    })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>International Min (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.shipping?.estimatedDeliveryDays?.international?.min || ''}
                    onChange={(e) => handleNestedInputChange('shipping', 'estimatedDeliveryDays', 'international', { 
                      ...settings.shipping?.estimatedDeliveryDays?.international,
                      min: parseInt(e.target.value) 
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>International Max (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.shipping?.estimatedDeliveryDays?.international?.max || ''}
                    onChange={(e) => handleNestedInputChange('shipping', 'estimatedDeliveryDays', 'international', { 
                      ...settings.shipping?.estimatedDeliveryDays?.international,
                      max: parseInt(e.target.value) 
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <h2>Email Settings</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>From Name</label>
                  <input
                    type="text"
                    value={settings.email?.fromName || ''}
                    onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>From Email</label>
                  <input
                    type="email"
                    value={settings.email?.fromEmail || ''}
                    onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Order Notification Email</label>
                <input
                  type="email"
                  value={settings.email?.orderNotificationEmail || ''}
                  onChange={(e) => handleInputChange('email', 'orderNotificationEmail', e.target.value)}
                  placeholder="admin@example.com"
                />
                <small>Email address to receive new order notifications</small>
              </div>

              <div className="form-group">
                <label>Contact Form Notification Email</label>
                <input
                  type="email"
                  value={settings.email?.contactNotificationEmail || ''}
                  onChange={(e) => handleInputChange('email', 'contactNotificationEmail', e.target.value)}
                  placeholder="support@example.com"
                />
                <small>Email address to receive contact form submissions</small>
              </div>

              <h3>Email Notifications</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications?.emailOnNewOrder || false}
                    onChange={(e) => handleInputChange('notifications', 'emailOnNewOrder', e.target.checked)}
                  />
                  <span>Send email on new order</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications?.emailOnLowStock || false}
                    onChange={(e) => handleInputChange('notifications', 'emailOnLowStock', e.target.checked)}
                  />
                  <span>Send email on low stock</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications?.emailOnNewContact || false}
                    onChange={(e) => handleInputChange('notifications', 'emailOnNewContact', e.target.checked)}
                  />
                  <span>Send email on new contact submission</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications?.emailOnNewReview || false}
                    onChange={(e) => handleInputChange('notifications', 'emailOnNewReview', e.target.checked)}
                  />
                  <span>Send email on new product review</span>
                </label>
              </div>
            </div>
          )}

          {/* SEO & Analytics Tab */}
          {activeTab === 'seo' && (
            <div className="settings-section">
              <h2>SEO & Analytics</h2>
              
              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  value={settings.seo?.metaTitle || ''}
                  onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                  maxLength="60"
                />
                <small>Recommended length: 50-60 characters</small>
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={settings.seo?.metaDescription || ''}
                  onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                  rows="3"
                  maxLength="160"
                />
                <small>Recommended length: 150-160 characters</small>
              </div>

              <div className="form-group">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  value={settings.seo?.metaKeywords || ''}
                  onChange={(e) => handleInputChange('seo', 'metaKeywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <small>Separate keywords with commas</small>
              </div>

              <h3>Analytics & Tracking</h3>
              <div className="form-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.seo?.googleAnalyticsId || ''}
                  onChange={(e) => handleInputChange('seo', 'googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                />
              </div>

              <div className="form-group">
                <label>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.seo?.facebookPixelId || ''}
                  onChange={(e) => handleInputChange('seo', 'facebookPixelId', e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
              </div>
            </div>
          )}

          {/* Store Settings Tab */}
          {activeTab === 'store' && (
            <div className="settings-section">
              <h2>Store Settings</h2>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.store?.maintenanceMode || false}
                    onChange={(e) => handleInputChange('store', 'maintenanceMode', e.target.checked)}
                  />
                  <span>Enable Maintenance Mode</span>
                </label>
              </div>

              {settings.store?.maintenanceMode && (
                <div className="form-group">
                  <label>Maintenance Message</label>
                  <textarea
                    value={settings.store?.maintenanceMessage || ''}
                    onChange={(e) => handleInputChange('store', 'maintenanceMessage', e.target.value)}
                    rows="3"
                  />
                </div>
              )}

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.store?.allowGuestCheckout || false}
                    onChange={(e) => handleInputChange('store', 'allowGuestCheckout', e.target.checked)}
                  />
                  <span>Allow Guest Checkout</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.store?.requireEmailVerification || false}
                    onChange={(e) => handleInputChange('store', 'requireEmailVerification', e.target.checked)}
                  />
                  <span>Require Email Verification</span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Order Quantity per Product</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.store?.maxOrderQuantity || 10}
                    onChange={(e) => handleInputChange('store', 'maxOrderQuantity', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={settings.store?.lowStockThreshold || 5}
                    onChange={(e) => handleInputChange('store', 'lowStockThreshold', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="settings-section">
              <h2>Social Media Links</h2>
              
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  value={settings.socialMedia?.facebook || ''}
                  onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="url"
                  value={settings.socialMedia?.instagram || ''}
                  onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                />
              </div>

              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="url"
                  value={settings.socialMedia?.twitter || ''}
                  onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/yourpage"
                />
              </div>

              <div className="form-group">
                <label>Pinterest</label>
                <input
                  type="url"
                  value={settings.socialMedia?.pinterest || ''}
                  onChange={(e) => handleInputChange('socialMedia', 'pinterest', e.target.value)}
                  placeholder="https://pinterest.com/yourpage"
                />
              </div>

              <div className="form-group">
                <label>YouTube</label>
                <input
                  type="url"
                  value={settings.socialMedia?.youtube || ''}
                  onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)}
                  placeholder="https://youtube.com/c/yourchannel"
                />
              </div>

              <div className="form-group">
                <label>TikTok</label>
                <input
                  type="url"
                  value={settings.socialMedia?.tiktok || ''}
                  onChange={(e) => handleInputChange('socialMedia', 'tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@yourpage"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-footer">
        <button 
          className="btn-save-settings primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
