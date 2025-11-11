import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/v1',
});

// Handle all configuration of request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const language = localStorage.getItem('i18nextLng') || 'uz';
    config.headers['Accept-Language'] = language;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors of all responses
api.interceptors.response.use(
  (response) => response.data,
  (err) => {
    if (err?.message === 'Network Error') {
      return Promise.reject({
        message:
          'Network Error: Unable to connect to server. Please check your internet connection.',
        statusCode: 0,
        data: null,
      });
    }
    
    // Handle 401 unauthorized - redirect to login
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('storeId');
      if (window.location.pathname !== '/signin') {
        window.location.replace('/signin');
      }
    }
    
    return Promise.reject(
      err.response?.data || {
        message: err?.message || 'An error occurred',
        statusCode: err?.response?.status || 500,
        data: null,
      }
    );
  }
);

export default api;

