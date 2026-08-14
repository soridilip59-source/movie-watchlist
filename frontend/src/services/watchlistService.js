import API from './api';

export const addToWatchlist = async (data) => {
  return await API.post('/watchlist', data);
};

export const fetchFamilyWatchlist = async (familyId) => {
  return await API.get(`/watchlist/${familyId}`);
};

export const fetchWatchlistItem = async (familyId, movieId) => {
  return await API.get(`/watchlist/${familyId}/${movieId}`);
};

export const updateWatchlistItem = async (id, data) => {
  return await API.put(`/watchlist/${id}`, data);
};

export const updateWatchlistStatus = async (id, status) => {
  return await API.put(`/watchlist/${id}/status`, { status });
};

export const removeFromWatchlist = async (id) => {
  return await API.delete(`/watchlist/${id}`);
};
