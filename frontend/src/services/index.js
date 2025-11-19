import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updatePassword: async (passwords) => {
    const response = await api.put('/auth/update-password', passwords);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
};

export const productService = {
  getAllProducts: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  }
};

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  }
};

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (item) => {
    const response = await api.post('/cart/add', item);
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/update/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (params) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post(`/wishlist/add/${productId}`);
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/remove/${productId}`);
    return response.data;
  }
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  addAddress: async (address) => {
    const response = await api.post('/users/address', address);
    return response.data;
  },

  updateAddress: async (addressId, address) => {
    const response = await api.put(`/users/address/${addressId}`, address);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/address/${addressId}`);
    return response.data;
  }
};

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  getAllOrders: async (params) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (orderId, data) => {
    const response = await api.put(`/orders/${orderId}/status`, data);
    return response.data;
  },

  updateTrackingInfo: async (orderId, data) => {
    const response = await api.put(`/orders/${orderId}/tracking`, data);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  getSalesReport: async (params) => {
    const response = await api.get('/admin/sales-report', { params });
    return response.data;
  }
};

export const sliderService = {
  getAllSliders: async () => {
    const response = await api.get('/sliders');
    return response.data;
  },

  getAdminSliders: async () => {
    const response = await api.get('/sliders/admin');
    return response.data;
  },

  getSliderById: async (id) => {
    const response = await api.get(`/sliders/${id}`);
    return response.data;
  },

  createSlider: async (data) => {
    const response = await api.post('/sliders', data);
    return response.data;
  },

  updateSlider: async (id, data) => {
    const response = await api.put(`/sliders/${id}`, data);
    return response.data;
  },

  deleteSlider: async (id) => {
    const response = await api.delete(`/sliders/${id}`);
    return response.data;
  },

  reorderSliders: async (sliders) => {
    const response = await api.post('/sliders/reorder', { sliders });
    return response.data;
  }
};

export { default as uploadService } from './upload.service';
export { default as reviewService } from './reviewService';
export { default as couponService } from './couponService';
