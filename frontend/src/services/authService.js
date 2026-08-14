import API from './api';

export const loginUser = async (credentials) => {
  return await API.post('/auth/login', credentials);
};

export const registerUser = async (userData) => {
  return await API.post('/auth/register', userData);
};

export const getCurrentUser = async () => {
  return await API.get('/auth/me');
};
