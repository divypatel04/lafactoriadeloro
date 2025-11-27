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
    } catch (error) {
      console.error('Login error:', error);
      
      // Display appropriate error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMessage = error.response.data?.message || 'Invalid email or password';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          // Validation errors
          errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
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
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
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
