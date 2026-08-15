import axios from 'axios';

// Get and sanitize API Base URL from environment or fallback
function getApiBaseUrl() {
  let url = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://movie-watchlist-gfgv.vercel.app/api'
  );

  if (typeof url !== 'string' || !url.trim()) {
    url = 'https://movie-watchlist-gfgv.vercel.app/api';
  }

  url = url.trim().replace(/^["']|["']$/g, '');

  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }

  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url += '/api';
  }

  return url;
}

const API = axios.create({
  baseURL: getApiBaseUrl(),
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
