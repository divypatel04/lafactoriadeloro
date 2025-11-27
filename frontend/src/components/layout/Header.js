import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { authService, categoryService, cartService } from '../../services';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, setUser, cart, setCart, setCategories } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setLocalCategories] = useState([]);

  useEffect(() => {
    // Fetch categories
    categoryService.getAllCategories()
      .then(res => {
        setLocalCategories(res.data);
        setCategories(res.data);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        // Don't fail silently, but don't crash either
        setLocalCategories([]);
      });

    // Fetch user and cart if authenticated
    if (isAuthenticated) {
      authService.getMe()
        .then(res => setUser(res.data, localStorage.getItem('token')))
        .catch(err => {
          console.error('Error fetching user:', err);
          // If 401 or 403, user is not authenticated anymore
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        });

      cartService.getCart()
        .then(res => setCart(res.data.data))
        .catch(err => {
          console.error('Error fetching cart:', err);
          // Set empty cart if fetch fails
          setCart({ items: [], totalItems: 0, totalPrice: 0 });
        });
    }
  }, [isAuthenticated, setUser, setCart, setCategories, logout]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue logout even if API call fails
    } finally {
      // Clear state regardless of API response
      logout();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      navigate('/', { replace: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="topbar">
        <div className="container">
          <div className="topbar-content">
            <div className="topbar-left">
              <span>Free Shipping on Orders Over $500</span>
            </div>
            <div className="topbar-right">
              {isAuthenticated ? (
                <>
                  <Link to="/account">My Account</Link>
                  {user?.role === 'admin' && (
                    <>
                      <span className="separator">|</span>
                      <Link to="/admin" className="admin-link">Admin</Link>
                    </>
                  )}
                  <span className="separator">|</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout-link">Logout</a>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <span className="separator">|</span>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link to="/">
                <h1>La Factoria Del Oro</h1>
              </Link>
            </div>

            <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              {categories.slice(0, 4).map(cat => (
                <Link 
                  key={cat._id} 
                  to={`/shop?category=${cat._id}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </nav>

            <div className="header-actions">
              {/* <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </form> */}

              {isAuthenticated && (
                <Link to="/account/wishlist" className="icon-btn" title="Wishlist">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </Link>
              )}

              <Link to="/cart" className="cart-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 2L7 6M17 2l2 4M3 6h18v2l-1.5 10a2 2 0 01-2 1.5H6.5a2 2 0 01-2-1.5L3 8V6zM10 11v4M14 11v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {cart?.totalItems > 0 && (
                  <span className="cart-count">{cart.totalItems}</span>
                )}
              </Link>

              <button 
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
