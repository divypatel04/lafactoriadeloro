import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService, productService, categoryService } from '../../services';
import uploadService from '../../services/upload.service';
import './ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // All available options from pricing config
  const availableCompositions = ['10K', '12K', '14K', '18K', '22K', '24K', '925-silver', 'platinum'];
  const availableMaterials = ['yellow-gold', 'white-gold', 'rose-gold', 'silver', 'platinum'];
  const availableRingSizes = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  const availableDiamondTypes = ['none', 'natural', 'lab-grown'];

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    weight: 5, // Default 5 grams
    stock: 100,
    sku: '',
    images: [{ url: '', material: null }],
    tags: '',
    isFeatured: false,
    isNewProduct: false,
    onSale: false,
    isActive: true,
    availableOptions: {
      compositions: ['14K', '18K'],
      materials: ['yellow-gold', 'white-gold', 'rose-gold'],
      ringSizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9'],
      diamondTypes: ['none'],
      diamondCarat: 0
    }
  });

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductBySlug(id);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category?._id || '',
        weight: product.weight || 5,
        stock: product.stock || 100,
        sku: product.sku || '',
        images: product.images?.length > 0 
          ? product.images.map(img => ({
              url: typeof img === 'string' ? img : img.url,
              material: typeof img === 'string' ? null : (img.material || null)
            }))
          : [{ url: '', material: null }],
        tags: product.tags?.join(', ') || '',
        isFeatured: product.isFeatured || false,
        isNewProduct: product.isNewProduct || product.isNew || false,
        onSale: product.onSale || false,
        isActive: product.isActive !== false,
        availableOptions: product.availableOptions || {
          compositions: ['14K', '18K'],
          materials: ['yellow-gold', 'white-gold', 'rose-gold'],
          ringSizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9'],
          diamondTypes: ['none'],
          diamondCarat: 0
        }
      });
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from name
    if (name === 'name' && !isEditMode) {
      const slug = value.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleOptionToggle = (optionType, value) => {
    setFormData(prev => {
      const currentOptions = prev.availableOptions[optionType] || [];
      const newOptions = currentOptions.includes(value)
        ? currentOptions.filter(v => v !== value)
        : [...currentOptions, value];
      
      return {
        ...prev,
        availableOptions: {
          ...prev.availableOptions,
          [optionType]: newOptions
        }
      };
    });
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const material = formData.images[index].material;
      const result = await uploadService.uploadProductImage(file, material);
      
      if (result.success) {
        const newImages = [...formData.images];
        newImages[index] = {
          url: result.image.url,
          material: result.image.material
        };
        setFormData(prev => ({ ...prev, images: newImages }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, { url: '', material: null }] }));
  };

  const removeImage = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const generateSKU = () => {
    const namePrefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    return `${namePrefix}-${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.slug || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      toast.error('Please enter a valid product weight in grams');
      return;
    }

    try {
      setLoading(true);

      // Auto-generate SKU if not provided
      const productSku = formData.sku || generateSKU();

      // Prepare data
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        weight: parseFloat(formData.weight),
        stock: parseInt(formData.stock) || 0,
        sku: productSku,
        images: formData.images
          .filter(img => img.url && img.url.trim())
          .map((img, index) => ({
            url: img.url,
            material: img.material || null,
            alt: formData.name,
            isDefault: index === 0
          })),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        isFeatured: formData.isFeatured,
        isNewProduct: formData.isNewProduct,
        onSale: formData.onSale,
        isActive: formData.isActive,
        availableOptions: formData.availableOptions
      };

      if (isEditMode) {
        // Get product ID from the loaded product
        const response = await productService.getProductBySlug(id);
        await adminService.updateProduct(response.data._id, productData);
        toast.success('✅ Product updated successfully!');
      } else {
        await adminService.createProduct(productData);
        toast.success('✅ Product created successfully!');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="admin-loading">Loading product...</div>;
  }

  return (
    <div className="product-form-page">
      <div className="form-container">
        <div className="form-header">
          <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          <button onClick={() => navigate('/admin/products')} className="btn-back">
            ← Back to Products
          </button>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="product-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label className="required">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Diamond Engagement Ring"
                required
              />
            </div>

            <div className="form-group">
              <label className="required">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="diamond-engagement-ring"
                required
              />
              <small>URL-friendly version of the name</small>
            </div>

            <div className="form-group">
              <label className="required">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description for product cards"
              />
            </div>

            <div className="form-group">
              <label>Full Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                placeholder="Detailed product description"
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="engagement, diamond, luxury"
              />
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h2>Product Images</h2>
            <p className="section-description">Upload images and optionally associate them with specific materials/colors</p>
            {formData.images.map((image, index) => (
              <div key={index} className="image-input-group">
                <div className="image-preview-wrapper">
                  {image.url && (
                    <img 
                      src={image.url.startsWith('http') ? image.url : uploadService.getImageUrl(image.url)} 
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                  )}
                </div>
                
                <div className="image-inputs">
                  <div className="file-upload-section">
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files[0])}
                        disabled={uploadingImage}
                      />
                      <span>{uploadingImage ? '⏳ Uploading...' : '📁 Choose File'}</span>
                    </label>
                    <span className="upload-hint">or enter URL below</span>
                  </div>
                  
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="image-url-input"
                  />
                  
                  <select
                    value={image.material || ''}
                    onChange={(e) => handleImageChange(index, 'material', e.target.value || null)}
                    className="material-select"
                  >
                    <option value="">All Materials</option>
                    <option value="yellow-gold">Yellow Gold</option>
                    <option value="white-gold">White Gold</option>
                    <option value="rose-gold">Rose Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                  </select>
                  
                  {image.material && (
                    <span className="material-badge">{image.material.replace('-', ' ')}</span>
                  )}
                </div>
                
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="btn-remove"
                    disabled={uploadingImage}
                  >
                    <span>✕</span>
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addImage} 
              className="btn-add"
              disabled={uploadingImage}
            >
              + Add Image
            </button>
          </div>

          {/* Product Specifications - NEW PRICING MODEL */}
          <div className="form-section">
            <h2>Product Specifications</h2>
            <p className="section-description">
              💡 <strong>New Pricing System:</strong> Prices are calculated automatically based on your Pricing Config settings. 
              Just specify the weight and which options are available for this product.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label className="required">Weight (grams)</label>
                <input
                  type="number"
                  step="0.01"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="5.0"
                  required
                />
                <small>⚖️ Actual weight used for price calculation</small>
              </div>

              <div className="form-group">
                <label>Diamond Carat Weight</label>
                <input
                  type="number"
                  step="0.01"
                  name="diamondCarat"
                  value={formData.availableOptions.diamondCarat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availableOptions: {
                      ...prev.availableOptions,
                      diamondCarat: parseFloat(e.target.value) || 0
                    }
                  }))}
                  placeholder="0.50"
                />
                <small>💎 Total carat weight (if applicable)</small>
              </div>

              <div className="form-group">
                <label className="required">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Auto-generated if left empty"
                />
                <small>Unique product identifier</small>
              </div>

              <div className="form-group">
                <label className="required">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="100"
                  required
                />
                <small>Total available inventory</small>
              </div>
            </div>
          </div>

          {/* Available Options - NEW SYSTEM */}
          <div className="form-section">
            <h2>Available Options</h2>
            <p className="section-description">
              ✨ Select which options customers can choose for this product. Prices are calculated automatically from your Pricing Config.
            </p>
            
            {/* Compositions/Purities */}
            <div className="options-section">
              <h3>Gold Compositions / Purities</h3>
              <div className="options-grid">
                {availableCompositions.map(comp => (
                  <label key={comp} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableOptions.compositions.includes(comp)}
                      onChange={() => handleOptionToggle('compositions', comp)}
                    />
                    <span className="option-label">{comp}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="options-section">
              <h3>Materials / Colors</h3>
              <div className="options-grid">
                {availableMaterials.map(mat => (
                  <label key={mat} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableOptions.materials.includes(mat)}
                      onChange={() => handleOptionToggle('materials', mat)}
                    />
                    <span className="option-label">{mat.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ring Sizes */}
            <div className="options-section">
              <h3>Ring Sizes</h3>
              <div className="options-grid">
                {availableRingSizes.map(size => (
                  <label key={size} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableOptions.ringSizes.includes(size)}
                      onChange={() => handleOptionToggle('ringSizes', size)}
                    />
                    <span className="option-label">Size {size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Diamond Types */}
            <div className="options-section">
              <h3>Diamond Types</h3>
              <div className="options-grid">
                {availableDiamondTypes.map(diamond => (
                  <label key={diamond} className="option-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableOptions.diamondTypes.includes(diamond)}
                      onChange={() => handleOptionToggle('diamondTypes', diamond)}
                    />
                    <span className="option-label">{diamond === 'none' ? 'No Diamond' : diamond.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Info Box */}
          <div className="form-section pricing-info">
            <div className="info-box">
              <h3>ℹ️ About Pricing</h3>
              <p>
                This product doesn't have a fixed price. Instead, prices are calculated in real-time based on:
              </p>
              <ul>
                <li>✅ Product weight ({formData.weight || 0}g)</li>
                <li>✅ Selected composition/purity (from your Pricing Config)</li>
                <li>✅ Selected material/color (from your Pricing Config)</li>
                <li>✅ Diamond carat weight ({formData.availableOptions.diamondCarat || 0}ct)</li>
                <li>✅ Selected ring size (if applicable)</li>
                <li>✅ Your labor costs, making charges, and profit margin</li>
              </ul>
              <p>
                <strong>To change pricing rates, go to:</strong> Admin Dashboard → <a href="/admin/pricing-config">Pricing Configuration</a>
              </p>
            </div>
          </div>
        </form>

        {/* Sidebar Actions */}
        <div className="form-sidebar">
          <div className="sidebar-section">
            <h3>Actions</h3>
            <div className="sidebar-actions">
              <button
                type="submit"
                form="product-form"
                className="btn-save"
                disabled={loading || uploadingImage}
              >
                {loading ? '⏳ Saving...' : (isEditMode ? '💾 Update Product' : '✅ Create Product')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="btn-cancel"
              >
                ❌ Cancel
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Product Settings</h3>
            <div className="sidebar-toggles">
              <div className="toggle-group">
                <label>Featured Product</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <label>New Arrival</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="isNewProduct"
                    checked={formData.isNewProduct}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <label>On Sale</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={formData.onSale}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <label>Active</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="sidebar-section summary-section">
            <h3>📊 Product Summary</h3>
            <div className="summary-info">
              <div className="summary-item">
                <span className="label">Weight:</span>
                <span className="value">{formData.weight || 0}g</span>
              </div>
              <div className="summary-item">
                <span className="label">Compositions:</span>
                <span className="value">{formData.availableOptions.compositions.length} options</span>
              </div>
              <div className="summary-item">
                <span className="label">Materials:</span>
                <span className="value">{formData.availableOptions.materials.length} options</span>
              </div>
              <div className="summary-item">
                <span className="label">Ring Sizes:</span>
                <span className="value">{formData.availableOptions.ringSizes.length} sizes</span>
              </div>
              <div className="summary-item">
                <span className="label">Diamond Types:</span>
                <span className="value">{formData.availableOptions.diamondTypes.length} types</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
