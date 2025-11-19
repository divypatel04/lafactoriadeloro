import React, { useState, useEffect } from 'react';
import { sliderService } from '../../services';
import './AdminSliders.css';
import { FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaTimes, FaCheck } from 'react-icons/fa';

const AdminSliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    order: 1,
    isActive: true
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      setLoading(true);
      const data = await sliderService.getAdminSliders();
      setSliders(data);
    } catch (error) {
      console.error('Failed to load sliders:', error);
      alert('Failed to load sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image) {
      alert('Title and Image are required');
      return;
    }

    try {
      if (editingSlider) {
        await sliderService.updateSlider(editingSlider._id, formData);
      } else {
        await sliderService.createSlider(formData);
      }
      
      setShowModal(false);
      setEditingSlider(null);
      resetForm();
      loadSliders();
    } catch (error) {
      console.error('Failed to save slider:', error);
      alert('Failed to save slider');
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle || '',
      description: slider.description || '',
      image: slider.image,
      buttonText: slider.buttonText || 'Shop Now',
      buttonLink: slider.buttonLink || '/shop',
      order: slider.order,
      isActive: slider.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await sliderService.deleteSlider(id);
      setDeleteConfirm(null);
      loadSliders();
    } catch (error) {
      console.error('Failed to delete slider:', error);
      alert('Failed to delete slider');
    }
  };

  const handleReorder = async (sliderId, direction) => {
    const currentIndex = sliders.findIndex(s => s._id === sliderId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sliders.length - 1)
    ) {
      return;
    }

    const newSliders = [...sliders];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap
    [newSliders[currentIndex], newSliders[targetIndex]] = 
    [newSliders[targetIndex], newSliders[currentIndex]];

    // Update order values
    const updates = newSliders.map((slider, index) => ({
      _id: slider._id,
      order: index + 1
    }));

    try {
      await sliderService.reorderSliders(updates);
      loadSliders();
    } catch (error) {
      console.error('Failed to reorder sliders:', error);
      alert('Failed to reorder sliders');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      order: sliders.length + 1,
      isActive: true
    });
  };

  const openAddModal = () => {
    setEditingSlider(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="admin-sliders-loading">Loading sliders...</div>;
  }

  return (
    <div className="admin-sliders">
      <div className="admin-sliders-header">
        <h1>Slider Management</h1>
        <button className="btn-add-slider" onClick={openAddModal}>
          <FaPlus /> Add New Slider
        </button>
      </div>

      <div className="sliders-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Image</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Button</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sliders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-sliders">
                  No sliders found. Create your first slider!
                </td>
              </tr>
            ) : (
              sliders.map((slider, index) => (
                <tr key={slider._id}>
                  <td>
                    <div className="order-controls">
                      <span className="order-number">{slider.order}</span>
                      <div className="order-buttons">
                        <button
                          onClick={() => handleReorder(slider._id, 'up')}
                          disabled={index === 0}
                          className="btn-order"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          onClick={() => handleReorder(slider._id, 'down')}
                          disabled={index === sliders.length - 1}
                          className="btn-order"
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <img 
                      src={slider.image} 
                      alt={slider.title}
                      className="slider-thumbnail"
                    />
                  </td>
                  <td>
                    <strong>{slider.title}</strong>
                  </td>
                  <td>{slider.subtitle || '-'}</td>
                  <td>
                    {slider.buttonText}
                    <br />
                    <small className="text-muted">{slider.buttonLink}</small>
                  </td>
                  <td>
                    <span className={`status-badge ${slider.isActive ? 'active' : 'inactive'}`}>
                      {slider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(slider)}
                        className="btn-edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(slider._id)}
                        className="btn-delete"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSlider ? 'Edit Slider' : 'Add New Slider'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="slider-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Exquisite Diamond Rings"
                  />
                </div>

                <div className="form-group">
                  <label>Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Timeless Elegance"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description for the slider"
                />
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                    placeholder="/shop"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Active (visible on homepage)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  <FaCheck /> {editingSlider ? 'Update' : 'Create'} Slider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="btn-close" onClick={() => setDeleteConfirm(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this slider? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={() => handleDelete(deleteConfirm)}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSliders;
