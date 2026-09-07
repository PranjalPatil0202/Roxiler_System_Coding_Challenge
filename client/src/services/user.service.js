import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updatePassword: async (oldPassword, newPassword) => {
    const response = await api.patch('/users/update-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};
