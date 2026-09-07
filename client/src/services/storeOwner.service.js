import api from './api';

export const storeOwnerService = {
  getRatings: async () => {
    const response = await api.get('/store-owner/ratings');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/store-owner/stats');
    return response.data;
  },
};
