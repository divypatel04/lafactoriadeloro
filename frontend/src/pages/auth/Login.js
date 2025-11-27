import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services';
import useStore from '../../store/useStore';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser, isAuthenticated, user } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      // Store user data in Zustand store and wait for state update
      setUser(response.user, response.token);
      
      // Add a small delay to ensure store is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Display appropriate error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          errorMessage = err.response.data?.message || 'Invalid email or password';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors) {
          // Validation errors
          errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-box">
            <h1>Login</h1>
            <p className="auth-subtitle">Welcome back! Please login to your account.</p>

            {error && (
              <div className="alert alert-error" style={{
                background: '#fee',
                border: '1px solid #fcc',
                color: '#c33',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#333'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="btn btn-block" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-switch">
              <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
