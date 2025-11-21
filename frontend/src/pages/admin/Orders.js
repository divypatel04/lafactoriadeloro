import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services';
import { generateOrderReceipt } from '../../utils/pdfGenerator';
import './Orders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    carrier: '',
    trackingNumber: '',
    trackingUrl: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllOrders({});
      setOrders(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await adminService.updateOrderStatus(showStatusModal, { status: newStatus });
      setOrders(orders.map(o => 
        o._id === showStatusModal ? { ...o, orderStatus: newStatus } : o
      ));
      toast.success('Order status updated successfully');
      setShowStatusModal(null);
      setNewStatus('');
      fetchOrders(); // Refresh to get updated data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingInfo.carrier || !trackingInfo.trackingNumber) {
      toast.error('Please fill in carrier and tracking number');
      return;
    }

    try {
      await adminService.updateTrackingInfo(showTrackingModal, trackingInfo);
      toast.success('Tracking information updated successfully');
      setShowTrackingModal(null);
      setTrackingInfo({ carrier: '', trackingNumber: '', trackingUrl: '' });
      fetchOrders(); // Refresh to get updated data
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking information');
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return statusClasses[status] || 'status-pending';
  };

  const handleDownloadReceipt = (order, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      generateOrderReceipt(order);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.orderStatus === statusFilter);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="orders-container">
        <h1>Orders Management</h1>

        <div className="orders-stats">
          <div className="stat-card">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <h3>{orders.filter(o => o.orderStatus === 'pending').length}</h3>
            <p>Pending</p>
          </div>
          <div className="stat-card">
            <h3>{orders.filter(o => o.orderStatus === 'processing').length}</h3>
            <p>Processing</p>
          </div>
          <div className="stat-card">
            <h3>${orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0).toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filters">
          <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
            All ({orders.length})
          </button>
          <button className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}>
            Pending ({orders.filter(o => o.orderStatus === 'pending').length})
          </button>
          <button className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setStatusFilter('confirmed')}>
            Confirmed ({orders.filter(o => o.orderStatus === 'confirmed').length})
          </button>
          <button className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`} onClick={() => setStatusFilter('processing')}>
            Processing ({orders.filter(o => o.orderStatus === 'processing').length})
          </button>
          <button className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`} onClick={() => setStatusFilter('shipped')}>
            Shipped ({orders.filter(o => o.orderStatus === 'shipped').length})
          </button>
          <button className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`} onClick={() => setStatusFilter('delivered')}>
            Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})
          </button>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.orderNumber || '#' + order._id.slice(-6).toUpperCase()}</strong>
                    </td>
                    <td>
                      <div><strong>{order.user?.firstName} {order.user?.lastName}</strong></div>
                      <div className="order-email">{order.user?.email}</div>
                    </td>
                    <td>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="order-time">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>{order.items?.length || 0} items</td>
                    <td><strong>${(order.pricing?.total || 0).toFixed(2)}</strong></td>
                    <td>
                      <span className={`payment-status status-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`order-status ${getStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => handleViewOrder(order)}
                          title="View Details"
                        >
                          👁️ View
                        </button>
                        <button 
                          className="btn-download-admin"
                          onClick={(e) => handleDownloadReceipt(order, e)}
                          title="Download Receipt"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </button>
                        <button 
                          className="btn-update-status"
                          onClick={() => {
                            setShowStatusModal(order._id);
                            setNewStatus(order.orderStatus);
                          }}
                          title="Update Status"
                        >
                          🔄 Status
                        </button>
                        <button 
                          className="btn-tracking"
                          onClick={() => {
                            setShowTrackingModal(order._id);
                            setTrackingInfo(order.trackingInfo || { carrier: '', trackingNumber: '', trackingUrl: '' });
                          }}
                          title="Add Tracking"
                        >
                          📦 Track
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Update Order Status</h3>
              <div className="form-group">
                <label>Select New Status:</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowStatusModal(null)}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handleUpdateStatus}>
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Info Modal */}
        {showTrackingModal && (
          <div className="modal-overlay" onClick={() => setShowTrackingModal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Update Tracking Information</h3>
              <div className="form-group">
                <label>Carrier:</label>
                <input
                  type="text"
                  placeholder="e.g., FedEx, UPS, DHL"
                  value={trackingInfo.carrier}
                  onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tracking Number:</label>
                <input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingInfo.trackingNumber}
                  onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tracking URL (Optional):</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={trackingInfo.trackingUrl}
                  onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingUrl: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowTrackingModal(null)}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handleUpdateTracking}>
                  Update Tracking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Order Details - {selectedOrder.orderNumber}</h3>
                <div className="modal-header-actions">
                  <button 
                    className="btn-download-modal" 
                    onClick={(e) => handleDownloadReceipt(selectedOrder, e)}
                    title="Download Receipt"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Receipt
                  </button>
                  <button className="btn-close" onClick={() => setSelectedOrder(null)}>×</button>
                </div>
              </div>
              
              <div className="order-details-content">
                <div className="details-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                </div>

                <div className="details-section">
                  <h4>Shipping Address</h4>
                  <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>

                <div className="details-section">
                  <h4>Order Items</h4>
                  <div className="order-items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item-row">
                        <div className="item-image">
                          <img 
                            src={item.product?.images?.[0]?.url || '/placeholder.jpg'} 
                            alt={item.product?.name || 'Product'} 
                            onError={(e) => {
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <p className="item-name"><strong>{item.product?.name || 'Product'}</strong></p>
                          {item.selectedOptions && (
                            <div className="item-options">
                              {item.selectedOptions.composition && (
                                <span className="option-badge">{item.selectedOptions.composition}</span>
                              )}
                              {item.selectedOptions.material && (
                                <span className="option-badge">{item.selectedOptions.material}</span>
                              )}
                              {item.selectedOptions.ringSize && (
                                <span className="option-badge">Size: {item.selectedOptions.ringSize}</span>
                              )}
                              {item.selectedOptions.diamondType && item.selectedOptions.diamondType !== 'none' && (
                                <span className="option-badge">{item.selectedOptions.diamondType}</span>
                              )}
                            </div>
                          )}
                          {item.variant?.sku && <p className="item-sku">SKU: {item.variant.sku}</p>}
                          <p className="item-price">Qty: {item.quantity} × ${(item.price || 0).toFixed(2)} = <strong>${(item.subtotal || 0).toFixed(2)}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Order Summary</h4>
                  <div className="order-summary-details">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${(selectedOrder.pricing?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>${(selectedOrder.pricing?.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>${(selectedOrder.pricing?.shipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span><strong>Total:</strong></span>
                      <span><strong>${(selectedOrder.pricing?.total || 0).toFixed(2)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Payment & Status</h4>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentInfo?.method || 'N/A'}</p>
                  <p><strong>Payment Status:</strong> <span className={`status-badge status-${selectedOrder.paymentStatus}`}>{selectedOrder.paymentStatus}</span></p>
                  <p><strong>Order Status:</strong> <span className={`status-badge status-${selectedOrder.orderStatus}`}>{selectedOrder.orderStatus}</span></p>
                  {selectedOrder.trackingInfo?.trackingNumber && (
                    <div>
                      <p><strong>Carrier:</strong> {selectedOrder.trackingInfo.carrier}</p>
                      <p><strong>Tracking #:</strong> {selectedOrder.trackingInfo.trackingNumber}</p>
                      {selectedOrder.trackingInfo.trackingUrl && (
                        <p><a href={selectedOrder.trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">Track Package</a></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
