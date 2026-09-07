import api from './api';

export const storeService = {
  getStores: async (params = {}) => {
    const response = await api.get('/stores', { params });
    return response.data;
  },

  getStoreById: async (storeId) => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },
};
