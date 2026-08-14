import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check, Eye } from 'lucide-react';
import { addToWatchlist } from '../services/watchlistService';
import { useAuth } from '../context/AuthContext';
import './MovieCard.css';

const MovieCard = ({ movie, watchlistStatus = null, onWatchlistChange }) => {
  const { user, activeFamilyId } = useAuth();
  const [adding, setAdding] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(!!watchlistStatus);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert('Please log in to add movies to your watchlist.');
    if (!activeFamilyId) return alert('Please join or create a family first.');

    try {
      setAdding(true);
      await addToWatchlist({
        movieId: movie._id,
        familyId: activeFamilyId,
        priority: 'medium',
      });
      setInWatchlist(true);
      if (onWatchlistChange) onWatchlistChange();
    } catch (err) {
      alert(err.message || 'Failed to add to watchlist');
    } finally {
      setAdding(false);
    }
  };

  const primaryGenre = Array.isArray(movie.genre) ? movie.genre[0] : movie.genre;

  return (
    <div className="movie-card animate-fade-in">
      <div className="poster-container">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="poster-overlay">
          <Link to={`/movies/${movie._id}`} className="btn btn-primary btn-sm overlay-btn">
            <Eye size={16} />
            <span>Details</span>
          </Link>

          {user && (
            <button
              onClick={handleQuickAdd}
              disabled={adding || inWatchlist}
              className={`btn btn-secondary btn-sm overlay-btn ${inWatchlist ? 'in-watchlist' : ''}`}
            >
              {inWatchlist ? (
                <>
                  <Check size={16} color="#34d399" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Watchlist</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="badge-overlay-top">
          <span className="age-rating-pill">{movie.ageRating || 'PG'}</span>
          {watchlistStatus && (
            <span className={`badge badge-status-${watchlistStatus}`}>
              {watchlistStatus}
            </span>
          )}
        </div>
      </div>

      <div className="movie-info">
        <div className="movie-header-row">
          <span className="genre-tag">{primaryGenre}</span>
          <span className="release-year">{movie.releaseYear}</span>
        </div>

        <Link to={`/movies/${movie._id}`} className="movie-title-link">
          <h3 className="movie-title" title={movie.title}>{movie.title}</h3>
        </Link>

        <div className="movie-rating-row">
          <div className="rating-pill">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span className="rating-value">{movie.rating ? movie.rating.toFixed(1) : '4.5'}</span>
          </div>
          <span className="movie-duration">{movie.duration || '120 min'}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
