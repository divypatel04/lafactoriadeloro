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

  // Get image URL - converts relative paths to absolute URLs
  getImageUrl: (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    
    // If already an absolute URL, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Convert relative path to absolute URL using backend URL
    let apiUrl = process.env.REACT_APP_API_URL;
    
    // If no API URL is set and we're in production (on Vercel), use the backend Vercel URL
    if (!apiUrl && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('vercel.app') || hostname === 'www.lafactoriadeloro.com' || hostname === 'lafactoriadeloro.com') {
        // Production: use backend Vercel URL
        apiUrl = 'https://lafactoriadeloro-hh6h.vercel.app/api';
      } else {
        // Local development
        apiUrl = 'http://localhost:5000/api';
      }
    }
    
    // Fallback to localhost if still not set
    if (!apiUrl) {
      apiUrl = 'http://localhost:5000/api';
    }
    
    // Remove /api from the end if present, since uploads are served from root
    const baseUrl = apiUrl.replace(/\/api$/, '');
    
    // Ensure the path starts with /
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
    return `${baseUrl}${path}`;
  },
};

export default uploadService;
