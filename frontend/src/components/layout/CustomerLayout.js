import React, { useState } from 'react';
import CustomerSidebar from './CustomerSidebar';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="customer-layout">
      <CustomerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Mobile overlay */}
      <div 
        className={`customer-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>
      
      <div className="customer-content">
        {/* Mobile header */}
        <div className="customer-mobile-header">
          <button 
            className="customer-mobile-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h1 className="customer-mobile-title">My Account</h1>
        </div>
        
        <div className="customer-content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
