import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cardioguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized and not already on auth page
      if (!window.location.pathname.includes('/auth') && window.location.pathname !== '/') {
        localStorage.removeItem('cardioguard_token');
        localStorage.removeItem('cardioguard_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

