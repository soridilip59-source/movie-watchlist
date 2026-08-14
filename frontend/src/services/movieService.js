import API from './api';

export const fetchMovies = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.genre && params.genre !== 'All') query.append('genre', params.genre);
  if (params.year) query.append('year', params.year);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  return await API.get(`/movies?${query.toString()}`);
};

export const fetchMovieById = async (id) => {
  return await API.get(`/movies/${id}`);
};

export const createMovie = async (movieData) => {
  return await API.post('/movies', movieData);
};

export const updateMovie = async (id, movieData) => {
  return await API.put(`/movies/${id}`, movieData);
};

export const deleteMovie = async (id) => {
  return await API.delete(`/movies/${id}`);
};
