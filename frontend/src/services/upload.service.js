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

  // Get image URL - now simply returns the URL (Cloudinary URLs are already absolute)
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    
    // Cloudinary URLs are already absolute, just return them
    // Also handles any other absolute URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Legacy support: if somehow we get a relative path, convert it
    // This shouldn't happen with Cloudinary but keeping for backwards compatibility
    let apiUrl = process.env.REACT_APP_API_URL;
    
    if (!apiUrl && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('vercel.app') || hostname === 'www.lafactoriadeloro.com' || hostname === 'lafactoriadeloro.com') {
        apiUrl = 'https://lafactoriadeloro-hh6h.vercel.app/api';
      } else {
        apiUrl = 'http://localhost:5000/api';
      }
    }
    
    if (!apiUrl) {
      apiUrl = 'http://localhost:5000/api';
    }
    
    const baseUrl = apiUrl.replace(/\/api$/, '');
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
    return `${baseUrl}${path}`;
  },
};

export default uploadService;
