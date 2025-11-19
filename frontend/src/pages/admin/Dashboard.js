import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      // Handle different response structures
      const statsData = response.data?.stats || response.data || {
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
      };
      
      setStats(statsData);
      setRecentOrders(response.data?.recentOrders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
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
    };
    return statusClasses[status] || 'status-pending';
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to La Factoria Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <p className="stat-label">Total Products</p>
            <p className="stat-value">{stats?.totalProducts || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p className="stat-label">Total Customers</p>
            <p className="stat-value">{stats?.totalCustomers || 0}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <p className="stat-label">Pending Orders</p>
            <p className="stat-value">{stats?.pendingOrders || 0}</p>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <p className="stat-label">Low Stock Products</p>
            <p className="stat-value">{stats?.lowStockProducts || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/admin/products" className="action-btn">
          <span>📦</span> Manage Products
        </Link>
        <Link to="/admin/orders" className="action-btn">
          <span>📋</span> View Orders
        </Link>
        <Link to="/admin/customers" className="action-btn">
          <span>👥</span> View Customers
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="view-all-link">View All Orders</Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>No recent orders</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
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
                    <td>{order.user?.firstName} {order.user?.lastName}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>${order.totalPrice?.toFixed(2)}</td>
                    <td>
                      <span className={`order-status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders`} className="btn-view">
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
  );
};

export default AdminDashboard;
