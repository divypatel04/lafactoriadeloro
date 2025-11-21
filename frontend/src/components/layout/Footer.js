import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { newsletterService } from '../../services';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await newsletterService.subscribe(email);
      toast.success('Successfully subscribed to newsletter! Check your email.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>About Us</h3>
              <p>La Factoria Del Oro is your premier destination for exquisite jewelry and engagement rings. We offer a curated selection of high-quality pieces crafted with precision and care.</p>
              <div className="social-links">
                
                <a href="https://www.instagram.com/lafactoria_deloro/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4zm4.5-3.5a1 1 0 110 2 1 1 0 010-2z"/></svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3>Customer Service</h3>
              <ul>
                <li><Link to="/account">My Account</Link></li>
                <li><Link to="/account/orders">Order Tracking</Link></li>
                <li><Link to="/account/wishlist">Wishlist</Link></li>
                <li><Link to="/shipping">Shipping Info</Link></li>
                <li><Link to="/returns">Returns</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3>Newsletter</h3>
              <p>Subscribe to receive updates, offers, and more.</p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <button type="submit" className="newsletter-btn" disabled={loading}>
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              <div className="contact-info">
                <p><strong>Email:</strong> samitom11jewelry@gmail.com</p>
                <p><strong>Phone:</strong> +1 (646)-884-1771</p>
                <p><strong>Address:</strong> 7021 Washington SQ. South New York, NY 10012</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} La Factoria Del Oro. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span className="separator">|</span>
              <Link to="/terms-conditions">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
