import API from './api';

export const addReview = async (movieId, reviewData) => {
  return await API.post(`/movies/${movieId}/reviews`, reviewData);
};

export const fetchMovieReviews = async (movieId) => {
  return await API.get(`/movies/${movieId}/reviews`);
};

export const updateReview = async (id, reviewData) => {
  return await API.put(`/reviews/${id}`, reviewData);
};

export const deleteReview = async (id) => {
  return await API.delete(`/reviews/${id}`);
};
