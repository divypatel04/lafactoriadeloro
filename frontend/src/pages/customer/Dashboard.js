import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../../store/useStore';
import { orderService, wishlistService } from '../../services';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await orderService.getMyOrders();
      console.log('Orders response:', ordersRes);
      const orders = ordersRes.data || [];
      
      // Fetch wishlist
      const wishlistRes = await wishlistService.getWishlist();
      console.log('Wishlist response:', wishlistRes);
      const wishlistItems = wishlistRes.data || [];
      
      // Calculate stats
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => {
          const status = o.orderStatus || o.status;
          return status === 'pending' || status === 'processing';
        }).length,
        completedOrders: orders.filter(o => {
          const status = o.orderStatus || o.status;
          return status === 'delivered' || status === 'completed';
        }).length,
        wishlistItems: Array.isArray(wishlistItems) ? wishlistItems.length : 0,
      });
      
      // Get recent 5 orders
      setRecentOrders(orders.slice(0, 5));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
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
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Account</h1>
          <p>Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>{stats.completedOrders}</h3>
              <p>Completed Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{stats.wishlistItems}</h3>
              <p>Wishlist Items</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="dashboard-quick-links">
          <Link to="/account/orders" className="quick-link">
            <span className="link-icon">📦</span>
            <span className="link-text">My Orders</span>
          </Link>
          <Link to="/account/profile" className="quick-link">
            <span className="link-icon">👤</span>
            <span className="link-text">Profile</span>
          </Link>
          <Link to="/account/addresses" className="quick-link">
            <span className="link-icon">📍</span>
            <span className="link-text">Addresses</span>
          </Link>
          <Link to="/account/wishlist" className="quick-link">
            <span className="link-icon">❤️</span>
            <span className="link-text">Wishlist</span>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/account/orders" className="view-all-link">View All</Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet</p>
              <Link to="/shop" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>${(order.pricing?.total || order.totalPrice || 0).toFixed(2)}</td>
                      <td>
                        <span className={`order-status ${getStatusClass(order.orderStatus || order.status)}`}>
                          {order.orderStatus || order.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/account/orders/${order._id}`} className="btn-view">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
