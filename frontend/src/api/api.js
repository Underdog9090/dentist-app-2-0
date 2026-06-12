import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the token
      localStorage.removeItem('token');
      
      // Show a friendly message
      const message = 'Your session has expired. Please log in again to continue.';
      if (window.location.pathname !== '/login') {
        // Only redirect if we're not already on the login page
        window.location.href = `/login?message=${encodeURIComponent(message)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api; 