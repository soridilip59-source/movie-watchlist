import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMovieById } from '../services/movieService';
import { fetchMovieReviews, addReview, deleteReview } from '../services/reviewService';
import { fetchWatchlistItem, addToWatchlist, updateWatchlistStatus } from '../services/watchlistService';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { Star, Plus, Check, Play, Clock, Calendar, Globe, ArrowLeft } from 'lucide-react';
import './MovieDetailsPage.css';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const { user, activeFamilyId } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlistItem, setWatchlistItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const movieRes = await fetchMovieById(id);
      if (movieRes.success) {
        setMovie(movieRes.movie);
      }

      const reviewsRes = await fetchMovieReviews(id);
      if (reviewsRes.success) {
        setReviews(reviewsRes.reviews);
      }

      if (activeFamilyId) {
        try {
          const watchRes = await fetchWatchlistItem(activeFamilyId, id);
          if (watchRes.success) {
            setWatchlistItem(watchRes.data);
          }
        } catch (wErr) {
          setWatchlistItem(null);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load movie details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, activeFamilyId]);

  const handleAddWatchlist = async () => {
    if (!user) return alert('Please log in first.');
    if (!activeFamilyId) return alert('Please join or create a family first.');

    try {
      const res = await addToWatchlist({
        movieId: movie._id,
        familyId: activeFamilyId,
        priority: 'medium',
      });
      if (res.success) {
        setWatchlistItem(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to add to watchlist');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!watchlistItem) return;
    try {
      const res = await updateWatchlistStatus(watchlistItem._id, newStatus);
      if (res.success) {
        setWatchlistItem(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update watch status');
    }
  };

  const handlePostReview = async ({ rating, comment }) => {
    if (!user) return alert('Please log in to write a review.');
    try {
      setSubmittingReview(true);
      const res = await addReview(movie._id, { rating, comment, familyId: activeFamilyId });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await deleteReview(reviewId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading movie details..." />;
  }

  if (error || !movie) {
    return <ErrorMessage message={error || 'Movie not found.'} />;
  }

  return (
    <div className="movie-details-page animate-fade-in">
      <Link to="/movies" className="back-link">
        <ArrowLeft size={18} />
        <span>Back to Movies</span>
      </Link>

      {/* Hero Banner Section */}
      <div className="movie-hero">
        <div className="movie-poster-large">
          <img src={movie.posterUrl} alt={movie.title} />
        </div>

        <div className="movie-hero-details">
          <div className="hero-tags">
            <span className="age-rating-pill">{movie.ageRating}</span>
            {Array.isArray(movie.genre) &&
              movie.genre.map((g) => (
                <span key={g} className="badge badge-role-parent">
                  {g}
                </span>
              ))}
          </div>

          <h1 className="movie-hero-title">{movie.title}</h1>

          <div className="movie-hero-specs">
            <span className="spec-item">
              <Calendar size={16} /> {movie.releaseYear}
            </span>
            <span className="spec-item">
              <Clock size={16} /> {movie.duration}
            </span>
            <span className="spec-item">
              <Globe size={16} /> {movie.language}
            </span>
            <div className="rating-pill">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{movie.rating ? movie.rating.toFixed(1) : '4.5'}</span>
              <span className="review-count">({movie.reviewCount || reviews.length} reviews)</span>
            </div>
          </div>

          <p className="movie-description">{movie.description}</p>

          {/* Action Buttons */}
          <div className="movie-hero-actions">
            {movie.trailerUrl && (
              <button
                className="btn btn-primary"
                onClick={() => setShowTrailerModal(true)}
              >
                <Play size={18} fill="currentColor" />
                <span>Watch Trailer</span>
              </button>
            )}

            {user && (
              watchlistItem ? (
                <div className="status-selector-box">
                  <span className="status-box-label">In Watchlist:</span>
                  <select
                    className="form-select status-select"
                    value={watchlistItem.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="planned">Planned</option>
                    <option value="watching">Watching</option>
                    <option value="watched">Watched</option>
                  </select>
                </div>
              ) : (
                <button className="btn btn-secondary" onClick={handleAddWatchlist}>
                  <Plus size={18} />
                  <span>Add to Family Watchlist</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="reviews-title">Family Reviews & Ratings</h2>

        {user && <ReviewForm onSubmit={handlePostReview} submitting={submittingReview} />}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews-text">No reviews written yet. Be the first in your family to write a review!</p>
          ) : (
            reviews.map((rev) => (
              <ReviewCard
                key={rev._id}
                review={rev}
                currentUser={user}
                onDelete={handleDeleteReview}
              />
            ))
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <Modal
          isOpen={showTrailerModal}
          onClose={() => setShowTrailerModal(false)}
          title={`${movie.title} - Official Trailer`}
        >
          <div className="trailer-video-wrap">
            <iframe
              src={movie.trailerUrl.replace('watch?v=', 'embed/')}
              title={movie.title}
              allowFullScreen
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MovieDetailsPage;
