import axios from 'axios';

const API_URL = '/api/coupons';

// Validate a coupon code
export const validateCoupon = async (code, cartTotal, userId = null, cartItems = []) => {
  try {
    const response = await axios.post(`${API_URL}/validate`, {
      code,
      orderAmount: cartTotal,
      userId,
      cartItems
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to validate coupon' };
  }
};

// Get all coupons (admin only)
export const getAllCoupons = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch coupons' };
  }
};

// Create a new coupon (admin only)
export const createCoupon = async (couponData) => {
  try {
    const response = await axios.post(API_URL, couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create coupon' };
  }
};

// Update a coupon (admin only)
export const updateCoupon = async (couponId, couponData) => {
  try {
    const response = await axios.put(`${API_URL}/${couponId}`, couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update coupon' };
  }
};

// Delete a coupon (admin only)
export const deleteCoupon = async (couponId) => {
  try {
    const response = await axios.delete(`${API_URL}/${couponId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete coupon' };
  }
};

export default {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
