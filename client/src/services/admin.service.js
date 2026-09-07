import api from './api';
import { downloadCSVFromAPI } from '../utils/csvExport';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getRatings: async (params = {}) => {
    const response = await api.get('/admin/ratings', { params });
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  bulkUpdateUserRole: async (userIds, role) => {
    const response = await api.patch('/admin/users/bulk-role', { userIds, role });
    return response.data;
  },

  bulkDeleteUsers: async (userIds) => {
    const response = await api.delete('/admin/users/bulk', { data: { userIds } });
    return response.data;
  },

  getStores: async (params = {}) => {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  createStore: async (storeData) => {
    const response = await api.post('/admin/stores', storeData);
    return response.data;
  },

  deleteStore: async (storeId) => {
    const response = await api.delete(`/admin/stores/${storeId}`);
    return response.data;
  },

  bulkDeleteStores: async (storeIds) => {
    const response = await api.delete('/admin/stores/bulk', { data: { storeIds } });
    return response.data;
  },

  exportUsersCSV: async (token, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return downloadCSVFromAPI(`/api/admin/export/users${qs}`, 'users-export.csv', token);
  },

  exportStoresCSV: async (token, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return downloadCSVFromAPI(`/api/admin/export/stores${qs}`, 'stores-export.csv', token);
  },
};


