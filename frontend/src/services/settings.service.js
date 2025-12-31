import api from './api';

export const settingsService = {
  // Get public settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Get specific settings section
  getSettingSection: async (section) => {
    const response = await api.get(`/settings/${section}`);
    return response.data;
  },

  // Get all settings (admin)
  getAllSettings: async () => {
    const response = await api.get('/settings/admin/all');
    return response.data;
  },

  // Update settings (admin)
  updateSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Update settings section (admin)
  updateSettingSection: async (section, data) => {
    const response = await api.patch(`/settings/${section}`, data);
    return response.data;
  },

  // Reset settings to defaults (admin)
  resetSettings: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  }
};

export default settingsService;
