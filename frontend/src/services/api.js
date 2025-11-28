import axios from 'axios';

// Smart API URL detection
let API_URL = process.env.REACT_APP_API_URL;

// If no API URL is set, detect environment
if (!API_URL && typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app') || hostname === 'www.lafactoriadeloro.com' || hostname === 'lafactoriadeloro.com') {
    // Production: use backend Vercel URL
    API_URL = 'https://lafactoriadeloro-hh6h.vercel.app/api';
  } else {
    // Local development
    API_URL = 'http://localhost:5000/api';
  }
}

// Fallback to localhost if still not set
if (!API_URL) {
  API_URL = 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we have a token but it's invalid/expired
    // Don't redirect during login/register attempts (they naturally have 401)
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register page or during authentication
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
