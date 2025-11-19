import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Coupons.css';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: 0,
    maxDiscount: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    usageLimit: '',
    usageLimitPerUser: 1,
    isActive: true,
    firstTimeUserOnly: false
  });

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, [filter, searchTerm]);

  const fetchCoupons = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/coupons', { params });
      setCoupons(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/coupons/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', formData);
        toast.success('Coupon created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchCoupons();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || '',
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      usageLimitPerUser: coupon.usageLimitPerUser,
      isActive: coupon.isActive,
      firstTimeUserOnly: coupon.firstTimeUserOnly
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: 0,
      maxDiscount: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      usageLimit: '',
      usageLimitPerUser: 1,
      isActive: true,
      firstTimeUserOnly: false
    });
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return 'inactive';
    if (new Date(coupon.expiryDate) < new Date()) return 'expired';
    if (new Date(coupon.startDate) > new Date()) return 'scheduled';
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'used-up';
    return 'active';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', class: 'badge-success' },
      expired: { text: 'Expired', class: 'badge-danger' },
      inactive: { text: 'Inactive', class: 'badge-secondary' },
      scheduled: { text: 'Scheduled', class: 'badge-info' },
      'used-up': { text: 'Used Up', class: 'badge-warning' }
    };
    const badge = badges[status] || badges.inactive;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.type === 'percentage') return `${coupon.value}%`;
    if (coupon.type === 'fixed') return `$${coupon.value}`;
    if (coupon.type === 'free_shipping') return 'Free Shipping';
    return coupon.value;
  };

  if (loading) {
    return <div className="loading">Loading coupons...</div>;
  }

  return (
    <div className="coupons-page">
      <div className="coupons-header">
        <h1>Coupon Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Create Coupon
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalCoupons}</div>
              <div className="stat-label">Total Coupons</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.activeCoupons}</div>
              <div className="stat-label">Active Coupons</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <div className="stat-value">{stats.expiredCoupons}</div>
              <div className="stat-label">Expired Coupons</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">${stats.totalSavings.toFixed(2)}</div>
              <div className="stat-label">Total Savings</div>
            </div>
          </div>
        </div>
      )}

      <div className="coupons-filters">
        <div className="filter-group">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === 'expired' ? 'active' : ''} 
            onClick={() => setFilter('expired')}
          >
            Expired
          </button>
          <button 
            className={filter === 'inactive' ? 'active' : ''} 
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Used</th>
              <th>Valid Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No coupons found</td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="coupon-code">{coupon.code}</td>
                  <td>{coupon.description}</td>
                  <td>
                    <span className="type-badge">{coupon.type.replace('_', ' ')}</span>
                  </td>
                  <td className="discount-value">{getDiscountDisplay(coupon)}</td>
                  <td>
                    {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                  </td>
                  <td className="date-range">
                    {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td>{getStatusBadge(getCouponStatus(coupon))}</td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(coupon)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(coupon._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    maxLength="20"
                    placeholder="e.g., SUMMER25"
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="2"
                  placeholder="Describe this coupon..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    step="0.01"
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div className="form-group">
                    <label>Max Discount ($)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Order Amount ($)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                  <small>Total times this coupon can be used across all users</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Usage Limit Per User *</label>
                  <input
                    type="number"
                    value={formData.usageLimitPerUser}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                    min="1"
                    required
                  />
                  <small>How many times each user can use this coupon</small>
                </div>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                    min={formData.startDate}
                  />
                </div>
              </div>

              <div className="form-checks">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.firstTimeUserOnly}
                    onChange={(e) => setFormData({ ...formData, firstTimeUserOnly: e.target.checked })}
                  />
                  <span>First Time Users Only</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
