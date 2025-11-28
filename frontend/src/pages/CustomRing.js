import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './CustomRing.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function CustomRing() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ringType: '',
    metal: '',
    purity: '',
    stoneType: '',
    stoneSize: '',
    ringSize: '',
    engraving: '',
    budget: '',
    designPreference: '',
    additionalDetails: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const ringTypes = ['Engagement Ring', 'Wedding Band', 'Fashion Ring', 'Eternity Ring', 'Promise Ring', 'Other'];
  const metals = ['Gold', 'White Gold', 'Rose Gold', 'Platinum', 'Silver'];
  const purities = ['10K', '14K', '18K', '22K', '24K', '925 Silver', '950 Platinum'];
  const stoneTypes = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Moissanite', 'No Stone', 'Other'];
  const stoneSizes = ['0.5 Carat', '1 Carat', '1.5 Carat', '2 Carat', '2.5+ Carat', 'Not Sure'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Limit to 5 images
    if (uploadedImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
    }

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data.url;
      });

      const imageUrls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...imageUrls]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Send to backend API with images
      await axios.post(`${API_URL}/custom-ring-request`, {
        ...formData,
        images: uploadedImages
      });
      
      toast.success('Your custom ring request has been submitted! We will contact you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        ringType: '',
        metal: '',
        purity: '',
        stoneType: '',
        stoneSize: '',
        ringSize: '',
        engraving: '',
        budget: '',
        designPreference: '',
        additionalDetails: ''
      });
      setUploadedImages([]);
    } catch (error) {
      console.error('Error submitting custom ring request:', error);
      toast.error('Failed to submit request. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-ring-page">
      <div className="page-header">
        <div className="container">
          <h1>Customize Your Own Ring</h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <span>Custom Ring</span>
          </div>
        </div>
      </div>

      <div className="custom-ring-content pt-60 pb-80">
        <div className="container">
          <div className="custom-ring-layout">
            {/* Information Section */}
            <aside className="custom-ring-info">
              <div className="info-card">
                <div className="info-icon">💍</div>
                <h3>Create Your Dream Ring</h3>
                <p>
                  Our expert artisans will work with you to create a unique, handcrafted ring 
                  that perfectly captures your vision and style.
                </p>
              </div>

              <div className="info-card">
                <div className="info-icon">⏱️</div>
                <h3>The Process</h3>
                <ol>
                  <li>Submit your design preferences</li>
                  <li>Receive a personalized quote</li>
                  <li>Approve the design and specifications</li>
                  <li>We craft your custom ring</li>
                  <li>Receive your unique piece</li>
                </ol>
              </div>

              <div className="info-card">
                <div className="info-icon">📞</div>
                <h3>Need Help?</h3>
                <p>Contact us directly:</p>
                <p>
                  <strong>Email:</strong><br />
                  <a href="mailto:samitom11jewelry@gmail.com">samitom11jewelry@gmail.com</a>
                </p>
                <p>
                  <strong>Phone:</strong><br />
                  +1 (646)-884-1771
                </p>
              </div>
            </aside>

            {/* Form Section */}
            <div className="custom-ring-form-container">
              <div className="form-intro">
                <h2>Tell Us About Your Dream Ring</h2>
                <p>Fill out the form below and our jewelry specialists will contact you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="custom-ring-form">
                {/* Personal Information */}
                <div className="form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                </div>

                {/* Ring Specifications */}
                <div className="form-section">
                  <h3>Ring Specifications</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="ringType">Ring Type</label>
                      <select
                        id="ringType"
                        name="ringType"
                        value={formData.ringType}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select ring type</option>
                        {ringTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="ringSize">Ring Size</label>
                      <input
                        type="text"
                        id="ringSize"
                        name="ringSize"
                        value={formData.ringSize}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., 6.5"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="metal">Metal Type</label>
                      <select
                        id="metal"
                        name="metal"
                        value={formData.metal}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select metal</option>
                        {metals.map(metal => (
                          <option key={metal} value={metal}>{metal}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="purity">Metal Purity</label>
                      <select
                        id="purity"
                        name="purity"
                        value={formData.purity}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select purity</option>
                        {purities.map(purity => (
                          <option key={purity} value={purity}>{purity}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stone Specifications */}
                <div className="form-section">
                  <h3>Stone Details</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="stoneType">Stone Type</label>
                      <select
                        id="stoneType"
                        name="stoneType"
                        value={formData.stoneType}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select stone type</option>
                        {stoneTypes.map(stone => (
                          <option key={stone} value={stone}>{stone}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="stoneSize">Stone Size</label>
                      <select
                        id="stoneSize"
                        name="stoneSize"
                        value={formData.stoneSize}
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select size</option>
                        {stoneSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="form-section">
                  <h3>Design & Budget</h3>

                  <div className="form-group">
                    <label htmlFor="budget">Budget Range</label>
                    <input
                      type="text"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., $2,000 - $5,000"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="engraving">Engraving (Optional)</label>
                    <input
                      type="text"
                      id="engraving"
                      name="engraving"
                      value={formData.engraving}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Text to engrave on the ring"
                      maxLength="50"
                    />
                    <small className="form-text">Maximum 50 characters</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="designPreference">Design Preference</label>
                    <textarea
                      id="designPreference"
                      name="designPreference"
                      value={formData.designPreference}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Describe your ideal ring design (e.g., vintage, modern, minimalist)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="additionalDetails">Additional Details</label>
                    <textarea
                      id="additionalDetails"
                      name="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={handleChange}
                      className="form-control"
                      rows="4"
                      placeholder="Any other information or special requests you'd like to share"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="form-group">
                    <label htmlFor="images">Upload Reference Images (Optional)</label>
                    <p className="form-helper-text">Upload up to 5 images to show design inspiration or specific requirements (max 5MB each)</p>
                    <div className="image-upload-container">
                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="file-input"
                        disabled={uploadingImages || uploadedImages.length >= 5}
                      />
                      <label htmlFor="images" className={`file-input-label ${uploadingImages || uploadedImages.length >= 5 ? 'disabled' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        {uploadingImages ? 'Uploading...' : uploadedImages.length >= 5 ? 'Maximum images reached' : 'Choose Images'}
                      </label>
                    </div>

                    {/* Image Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="uploaded-images-preview">
                        {uploadedImages.map((imageUrl, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={imageUrl} alt={`Upload ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <p className="form-note">
                    * Required fields. We'll respond within 24 hours.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
