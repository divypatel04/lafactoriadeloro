import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { newsletterService } from '../../services';
import './Newsletter.css';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  const [emailData, setEmailData] = useState({
    subject: '',
    htmlContent: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    loadSubscribers();
  }, [filter, search, pagination.page]);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 50
      };
      
      if (filter) params.status = filter;
      if (search) params.search = search;

      const response = await newsletterService.getAllSubscribers(params);
      setSubscribers(response.data);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load subscribers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      await newsletterService.deleteSubscriber(id);
      toast.success('Subscriber deleted successfully');
      loadSubscribers();
    } catch (error) {
      toast.error('Failed to delete subscriber');
      console.error(error);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    
    if (!emailData.subject || !emailData.htmlContent) {
      toast.error('Please fill in subject and content');
      return;
    }

    if (!window.confirm(`Send newsletter to ${stats.active} active subscribers?`)) {
      return;
    }

    setSending(true);
    try {
      const response = await newsletterService.sendNewsletter(emailData);
      toast.success(response.message);
      setShowEmailForm(false);
      setEmailData({ subject: '', htmlContent: '' });
    } catch (error) {
      toast.error('Failed to send newsletter');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await newsletterService.exportSubscribers(filter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${filter || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Subscribers exported successfully');
    } catch (error) {
      toast.error('Failed to export subscribers');
      console.error(error);
    }
  };

  return (
    <div className="admin-newsletter-page">
      <div className="admin-header">
        <h1>Newsletter Management</h1>
        <div className="admin-actions">
          <button className="btn btn-primary" onClick={() => setShowEmailForm(true)}>
            📧 Send Newsletter
          </button>
          <button className="btn btn-outline" onClick={handleExport}>
            📥 Export Subscribers
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Subscribers</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Subscribers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.unsubscribed}</h3>
            <p>Unsubscribed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === '' ? 'active' : ''}`}
            onClick={() => setFilter('')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'unsubscribed' ? 'active' : ''}`}
            onClick={() => setFilter('unsubscribed')}
          >
            Unsubscribed
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading subscribers...</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="subscribers-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Subscribed At</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length > 0 ? (
                  subscribers.map(subscriber => (
                    <tr key={subscriber._id}>
                      <td>{subscriber.email}</td>
                      <td>
                        <span className={`status-badge ${subscriber.status}`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td>{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                      <td>{subscriber.source || 'N/A'}</td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(subscriber._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No subscribers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="modal-overlay" onClick={() => setShowEmailForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Newsletter</h2>
              <button className="btn-close" onClick={() => setShowEmailForm(false)}>×</button>
            </div>
            <form onSubmit={handleSendNewsletter}>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Enter email subject"
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Content (HTML) *</label>
                <textarea
                  value={emailData.htmlContent}
                  onChange={(e) => setEmailData({ ...emailData, htmlContent: e.target.value })}
                  placeholder="Enter HTML content..."
                  required
                  rows="15"
                  className="form-control"
                />
                <small className="form-text">
                  You can use HTML tags. An unsubscribe link will be automatically added.
                </small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEmailForm(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : `Send to ${stats.active} subscribers`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
