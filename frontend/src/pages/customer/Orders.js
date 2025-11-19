import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../../services';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      console.log('Orders response:', response);
      setOrders(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => (order.orderStatus || order.status) === statusFilter));
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
      paid: 'status-processing',
    };
    return statusClasses[status] || 'status-pending';
  };

  if (loading) {
    return <div className="orders-loading">Loading your orders...</div>;
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({orders.length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({orders.filter(o => (o.orderStatus || o.status) === 'pending').length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`}
            onClick={() => setStatusFilter('processing')}
          >
            Processing ({orders.filter(o => (o.orderStatus || o.status) === 'processing').length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
            onClick={() => setStatusFilter('shipped')}
          >
            Shipped ({orders.filter(o => (o.orderStatus || o.status) === 'shipped').length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered ({orders.filter(o => (o.orderStatus || o.status) === 'delivered').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <p>No {statusFilter !== 'all' ? statusFilter : ''} orders found</p>
            <Link to="/shop" className="btn-shop">Continue Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h3>
                    <p className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="order-status-wrapper">
                    <span className={`order-status ${getStatusClass(order.orderStatus || order.status)}`}>
                      {order.orderStatus || order.status}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item-preview">
                      <img
                        src={item.product?.images?.[0]?.url || item.product?.images?.[0] || '/placeholder.jpg'}
                        alt={item.product?.name || 'Product'}
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                      <div className="item-info">
                        <p className="item-name">{item.product?.name || 'Product'}</p>
                        {item.variant && (
                          <p className="item-variant">
                            {item.variant.material} - {item.variant.purity} - {item.variant.weight}g
                          </p>
                        )}
                        <p className="item-quantity">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="more-items">+{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}</p>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">${(order.pricing?.total || order.totalPrice || 0).toFixed(2)}</span>
                  </div>
                  <Link to={`/account/orders/${order._id}`} className="btn-view-order">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
