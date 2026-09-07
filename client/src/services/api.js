import axios from 'axios';

// In-memory token storage closure (strictly React in-memory, no localStorage/sessionStorage/cookies)
let inMemoryToken = null;
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach in-memory JWT token
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
