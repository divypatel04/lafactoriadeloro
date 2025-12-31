import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { settingsService } from '../../services';
import './ContactInfo.css';

const ContactInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      const settings = response.data;
      
      setContactInfo({
        contactEmail: settings.contactEmail || '',
        contactPhone: settings.contactPhone || '',
        address: {
          street: settings.address?.street || '',
          city: settings.address?.city || '',
          state: settings.address?.state || '',
          postalCode: settings.address?.postalCode || '',
          country: settings.address?.country || ''
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast.error('Failed to load contact information');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!contactInfo.contactEmail || !contactInfo.contactPhone) {
      toast.error('Please fill in email and phone number');
      return;
    }

    setSaving(true);
    try {
      await settingsService.updateSettings(contactInfo);
      toast.success('Contact information updated successfully!');
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="contact-info-loading">
          <div className="spinner"></div>
          <p>Loading contact information...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="contact-info-page">
        <div className="contact-info-header">
          <div>
            <h1>Contact & Email Information</h1>
            <p>Manage contact details displayed across your website</p>
          </div>
          <button 
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="contact-info-content">
          {/* Info Banner */}
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <div>
              <strong>Global Contact Information</strong>
              <p>
                The contact information you enter here will be automatically displayed throughout your website, 
                including the footer, contact page, and about page. Update these fields to change contact details 
                across all pages at once.
              </p>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="form-section">
            <h2>📧 Contact Details</h2>
            <p className="section-description">
              Primary contact information for customer inquiries
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Contact Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={contactInfo.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="info@yourbusiness.com"
                  required
                />
                <small>This email will be displayed on your website and used for customer inquiries</small>
              </div>

              <div className="form-group">
                <label>Contact Phone <span className="required">*</span></label>
                <input
                  type="tel"
                  value={contactInfo.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
                <small>Include country code for international customers</small>
              </div>
            </div>
          </div>

          {/* Business Address Section */}
          <div className="form-section">
            <h2>📍 Business Address</h2>
            <p className="section-description">
              This address will be displayed on your contact page and footer
            </p>

            <div className="form-group full-width">
              <label>Street Address <span className="required">*</span></label>
              <input
                type="text"
                value={contactInfo.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={contactInfo.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  value={contactInfo.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Postal/ZIP Code</label>
                <input
                  type="text"
                  value={contactInfo.address.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  placeholder="10001"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={contactInfo.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="preview-section">
            <h2>👁️ Preview</h2>
            <p className="section-description">
              This is how your contact information will appear on your website
            </p>
            
            <div className="preview-box">
              <div className="preview-item">
                <span className="preview-icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>{contactInfo.contactEmail || 'Not set'}</p>
                </div>
              </div>
              
              <div className="preview-item">
                <span className="preview-icon">📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>{contactInfo.contactPhone || 'Not set'}</p>
                </div>
              </div>
              
              <div className="preview-item">
                <span className="preview-icon">📍</span>
                <div>
                  <strong>Address</strong>
                  <p>
                    {contactInfo.address.street && <>{contactInfo.address.street}<br /></>}
                    {contactInfo.address.city && `${contactInfo.address.city}, `}
                    {contactInfo.address.state && `${contactInfo.address.state} `}
                    {contactInfo.address.postalCode && contactInfo.address.postalCode}
                    {contactInfo.address.city && <br />}
                    {contactInfo.address.country || 'Address not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button 
              className="btn-save primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContactInfo;
