import axios from 'axios';

// Connect directly to the production backend API
const API = axios.create({
  baseURL: 'https://movie-watchlist-gfgv.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization header if JWT token exists in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response unwrapping and error messaging
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please check your connection.';
    return Promise.reject(new Error(message));
  }
);

export default API;
