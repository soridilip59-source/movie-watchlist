import React from 'react';
import MovieCard from './MovieCard';
import LoadingSpinner from './LoadingSpinner';
import { Film } from 'lucide-react';
import './MovieGrid.css';

const MovieGrid = ({ movies, loading, emptyMessage = 'No movies found.', watchlistMap = {}, onWatchlistChange }) => {
  if (loading) {
    return <LoadingSpinner text="Fetching movies catalog..." />;
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="empty-state">
        <Film size={48} className="empty-icon" />
        <h3>{emptyMessage}</h3>
        <p>Try adjusting your search criteria or filter selections.</p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          watchlistStatus={watchlistMap[movie._id]?.status || null}
          onWatchlistChange={onWatchlistChange}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
