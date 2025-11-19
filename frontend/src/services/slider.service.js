import api from './api';

const sliderService = {
  // Public - Get active sliders
  getAllSliders: () => api.get('/sliders'),

  // Admin - Get all sliders
  getAdminSliders: () => api.get('/sliders/admin'),

  // Admin - Get slider by ID
  getSliderById: (id) => api.get(`/sliders/${id}`),

  // Admin - Create slider
  createSlider: (data) => api.post('/sliders', data),

  // Admin - Update slider
  updateSlider: (id, data) => api.put(`/sliders/${id}`, data),

  // Admin - Delete slider
  deleteSlider: (id) => api.delete(`/sliders/${id}`),

  // Admin - Reorder sliders
  reorderSliders: (sliders) => api.post('/sliders/reorder', { sliders })
};

export default sliderService;
