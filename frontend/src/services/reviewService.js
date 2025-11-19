import axios from 'axios';

const API_URL = '/api/reviews';

// Submit a new review
export const submitReview = async (productId, reviewData) => {
  try {
    const response = await axios.post(API_URL, {
      product: productId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit review' };
  }
};

// Get reviews for a specific product
export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}?product=${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reviews' };
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axios.put(`${API_URL}/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update review' };
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(`${API_URL}/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete review' };
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  try {
    const response = await axios.post(`${API_URL}/${reviewId}/helpful`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark review as helpful' };
  }
};

export default {
  submitReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markReviewHelpful
};
