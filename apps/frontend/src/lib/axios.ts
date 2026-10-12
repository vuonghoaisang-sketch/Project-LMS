import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (!error.response) {
      console.error('Network error: Backend may be offline.');

      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('lms:unauthorized'));
      }
    }

    if (status === 403) {
      console.error('Forbidden: You do not have permission.');
    }

    if (status === 404) {
      console.error('Resource not found.');
    }

    if (status === 409) {
      console.error('Conflict:', error.response.data?.message);
    }

    if (status >= 500) {
      console.error('Server error.');
    }

    return Promise.reject(error);
  },
);

export default api;
