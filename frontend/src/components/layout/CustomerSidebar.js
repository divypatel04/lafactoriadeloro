import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import './CustomerSidebar.css';

const CustomerSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const menuItems = [
    {
      path: '/account',
      icon: '📊',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/account/orders',
      icon: '📦',
      label: 'My Orders',
      exact: false
    },
    {
      path: '/account/wishlist',
      icon: '❤️',
      label: 'Wishlist',
      exact: false
    },
    {
      path: '/account/addresses',
      icon: '📍',
      label: 'Addresses',
      exact: false
    },
    {
      path: '/account/profile',
      icon: '👤',
      label: 'Profile',
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
    <div className={`customer-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="customer-sidebar-header">
        <div className="customer-info">
          <div className="customer-avatar">
            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="customer-details">
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
      
      <nav className="customer-sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={isActive(item) ? 'active' : ''}>
              <Link to={item.path} onClick={handleLinkClick}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="customer-sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="menu-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;
