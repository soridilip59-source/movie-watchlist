import API from './api';

// Register new user account
export const registerUser = async (userData) => {
  return await API.post('/auth/register', userData);
};

// Log in existing user
export const loginUser = async (credentials) => {
  return await API.post('/auth/login', credentials);
};

// Fetch profile of authenticated user
export const getCurrentUser = async () => {
  return await API.get('/auth/me');
};
