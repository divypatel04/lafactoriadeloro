import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      path: '/admin',
      icon: '📊',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/products',
      icon: '💍',
      label: 'Products',
      exact: false
    },
    {
      path: '/admin/pricing',
      icon: '💰',
      label: 'Pricing Config',
      exact: false
    },
    {
      path: '/admin/sliders',
      icon: '🖼️',
      label: 'Sliders',
      exact: false
    },
    {
      path: '/admin/orders',
      icon: '📦',
      label: 'Orders',
      exact: false
    },
    {
      path: '/admin/customers',
      icon: '👥',
      label: 'Customers',
      exact: false
    },
    {
      path: '/admin/coupons',
      icon: '🎫',
      label: 'Coupons',
      exact: false
    },
    {
      path: '/admin/settings',
      icon: '⚙️',
      label: 'Settings',
      exact: false
    },
    {
      path: '/admin/email-settings',
      icon: '📧',
      label: 'Email Settings',
      exact: false
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>La Factoria Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={isActive(item) ? 'active' : ''}>
              <Link to={item.path}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {user && <p className="admin-email">{user.email}</p>}
        <button onClick={handleLogout} className="logout-btn">
          <span className="menu-icon">🚪</span>
          <span>Logout</span>
        </button>
        <p className="copyright">© 2024 La Factoria</p>
      </div>
    </div>
  );
};

export default AdminSidebar;
