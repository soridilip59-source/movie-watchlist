import axios from 'axios';

// Support VITE_API_BASE_URL, VITE_API_URL, or direct backend fallback
const rawUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://movie-watchlist-gfgv.vercel.app/api';

let apiBaseUrl = rawUrl.replace(/\/$/, '');
if (!apiBaseUrl.endsWith('/api') && !apiBaseUrl.includes('/api/')) {
  apiBaseUrl += '/api';
}

const API = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if JWT token exists
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

// Response interceptor for unified error formatting
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default API;
