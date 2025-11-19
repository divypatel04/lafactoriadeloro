import api from './api';

const uploadService = {
  // Upload single product image
  uploadProductImage: async (file, material = null) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (material) {
        formData.append('material', material);
      }

      const response = await api.post('/upload/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Image upload failed' };
    }
  },

  // Upload multiple product images
  uploadProductImages: async (files, materials = []) => {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      if (materials.length > 0) {
        formData.append('materials', JSON.stringify(materials));
      }

      const response = await api.post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Images upload failed' };
    }
  },

  // Delete product image
  deleteProductImage: async (filename) => {
    try {
      const response = await api.delete(`/upload/product-image/${filename}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Image deletion failed' };
    }
  },

  // Get image URL
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
  },
};

export default uploadService;
