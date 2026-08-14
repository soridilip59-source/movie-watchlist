import React from 'react';
import { Film, BookmarkCheck, CheckCircle2, Clock, PlayCircle, Users, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';
import './DashboardStats.css';

const DashboardStats = ({ stats }) => {
  const {
    totalMovies = 0,
    watchlistCount = 0,
    watchedCount = 0,
    plannedCount = 0,
    watchingCount = 0,
    familyMembers = 0,
    topGenres = [],
    recentlyAdded = [],
    recentlyWatched = [],
  } = stats || {};

  return (
    <div className="dashboard-stats-wrapper">
      {/* Stat Cards Grid */}
      <div className="stats-cards-grid">
        <div className="stat-card border-red">
          <div className="stat-icon-wrap icon-red">
            <Film size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalMovies}</span>
            <span className="stat-label">Catalog Movies</span>
          </div>
        </div>

        <div className="stat-card border-blue">
          <div className="stat-icon-wrap icon-blue">
            <BookmarkCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{watchlistCount}</span>
            <span className="stat-label">In Watchlist</span>
          </div>
        </div>

        <div className="stat-card border-green">
          <div className="stat-icon-wrap icon-green">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{watchedCount}</span>
            <span className="stat-label">Movies Watched</span>
          </div>
        </div>

        <div className="stat-card border-yellow">
          <div className="stat-icon-wrap icon-yellow">
            <PlayCircle size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{watchingCount}</span>
            <span className="stat-label">Currently Watching</span>
          </div>
        </div>

        <div className="stat-card border-purple">
          <div className="stat-icon-wrap icon-purple">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{familyMembers}</span>
            <span className="stat-label">Family Members</span>
          </div>
        </div>
      </div>

      {/* Top Genres Breakdown */}
      {topGenres.length > 0 && (
        <div className="dashboard-section-card">
          <div className="section-title-row">
            <Flame size={20} color="#e50914" />
            <h3>Family Favorite Genres</h3>
          </div>

          <div className="genres-bars-grid">
            {topGenres.map(({ genre, count }) => {
              const maxCount = topGenres[0]?.count || 1;
              const percentage = Math.round((count / maxCount) * 100);
              return (
                <div key={genre} className="genre-bar-item">
                  <div className="genre-bar-header">
                    <span className="genre-name">{genre}</span>
                    <span className="genre-count">{count} movies</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <div className="dashboard-section-card">
          <div className="section-title-row">
            <Clock size={20} color="#3b82f6" />
            <h3>Recently Added to Watchlist</h3>
            <Link to="/watchlist" className="view-all-link">View Watchlist →</Link>
          </div>

          <div className="recent-cards-row">
            {recentlyAdded.map((item) => (
              item.movieId && (
                <MovieCard key={item._id} movie={item.movieId} watchlistStatus={item.status} />
              )
            ))}
          </div>
        </div>
      )}

      {/* Recently Watched Section */}
      {recentlyWatched.length > 0 && (
        <div className="dashboard-section-card">
          <div className="section-title-row">
            <CheckCircle2 size={20} color="#10b981" />
            <h3>Recently Watched Together</h3>
          </div>

          <div className="recent-cards-row">
            {recentlyWatched.map((item) => (
              item.movieId && (
                <MovieCard key={item._id} movie={item.movieId} watchlistStatus={item.status} />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
