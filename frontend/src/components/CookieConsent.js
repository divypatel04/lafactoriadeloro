import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../pages/LegalPages.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    // Enable analytics and marketing cookies
    enableCookies('all');
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
    // Only essential cookies
    enableCookies('essential');
  };

  const handleCustomize = () => {
    // TODO: Open cookie preferences modal
    alert('Cookie customization modal will be implemented here');
  };

  const enableCookies = (type) => {
    // Store cookie preferences
    localStorage.setItem('cookiePreferences', JSON.stringify({
      essential: true,
      analytics: type === 'all',
      marketing: type === 'all',
      preferences: type === 'all'
    }));

    // Initialize analytics if accepted
    if (type === 'all') {
      initializeAnalytics();
    }
  };

  const initializeAnalytics = () => {
    // TODO: Initialize Google Analytics, Facebook Pixel, etc.
    console.log('Analytics initialized');
    
    // Example: Google Analytics
    // if (window.gtag) {
    //   window.gtag('consent', 'update', {
    //     'analytics_storage': 'granted',
    //     'ad_storage': 'granted'
    //   });
    // }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <div className="cookie-text">
          <p>
            <strong>🍪 We use cookies</strong>
          </p>
          <p>
            We use cookies and similar technologies to improve your browsing experience, 
            analyze site traffic, and personalize content. By clicking "Accept All", you 
            consent to our use of cookies. You can manage your preferences or reject 
            non-essential cookies.{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>
          </p>
        </div>
        <div className="cookie-actions">
          <button className="btn-accept" onClick={handleAccept}>
            Accept All
          </button>
          <button className="btn-reject" onClick={handleReject}>
            Reject Non-Essential
          </button>
          <button className="btn-customize" onClick={handleCustomize}>
            Customize
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
