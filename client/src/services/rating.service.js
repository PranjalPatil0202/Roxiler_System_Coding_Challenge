import api from './api';

export const ratingService = {
  submitRating: async (store_id, rating) => {
    const response = await api.post('/ratings', { store_id, rating });
    return response.data;
  },

  updateRating: async (storeId, rating) => {
    const response = await api.put(`/ratings/${storeId}`, { rating });
    return response.data;
  },
};
