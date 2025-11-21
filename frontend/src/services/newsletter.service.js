import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const newsletterService = {
  // Subscribe to newsletter
  subscribe: async (email, source = 'website-footer') => {
    const response = await axios.post(`${API_URL}/newsletter/subscribe`, { email, source });
    return response.data;
  },

  // Unsubscribe from newsletter
  unsubscribe: async (emailOrId) => {
    const payload = emailOrId.includes('@') 
      ? { email: emailOrId } 
      : { subscriberId: emailOrId };
    const response = await axios.post(`${API_URL}/newsletter/unsubscribe`, payload);
    return response.data;
  },

  // Get all subscribers (Admin)
  getAllSubscribers: async (params = {}) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/newsletter/subscribers`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },

  // Delete subscriber (Admin)
  deleteSubscriber: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/newsletter/subscribers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Send newsletter (Admin)
  sendNewsletter: async (newsletterData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/newsletter/send`, newsletterData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Export subscribers (Admin)
  exportSubscribers: async (status = '') => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/newsletter/export`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { status },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default newsletterService;
