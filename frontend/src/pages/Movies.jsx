import React, { useState, useEffect } from 'react';
import { fetchMovies } from '../services/movieService';
import { fetchFamilyWatchlist } from '../services/watchlistService';
import { useAuth } from '../context/AuthContext';
import MovieGrid from '../components/MovieGrid';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import AddMovieModal from '../components/AddMovieModal';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Film } from 'lucide-react';
import './Movies.css';

const Movies = () => {
  const { user, activeFamilyId } = useAuth();
  const [movies, setMovies] = useState([]);
  const [watchlistMap, setWatchlistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, Pagination state
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  // Add Movie Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchMovies({ search, genre, year, page, limit: 10 });
      if (res.success) {
        setMovies(res.movies);
        setPage(res.page);
        setTotalPages(res.totalPages);
        setTotalMovies(res.totalMovies);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch movies catalog.');
    } finally {
      setLoading(false);
    }
  };

  const loadWatchlistMap = async () => {
    if (!activeFamilyId) return;
    try {
      const res = await fetchFamilyWatchlist(activeFamilyId);
      if (res.success) {
        const map = {};
        res.data.forEach((item) => {
          if (item.movieId) {
            map[item.movieId._id] = item;
          }
        });
        setWatchlistMap(map);
      }
    } catch (err) {
      console.error('Failed to load watchlist map:', err.message);
    }
  };

  useEffect(() => {
    loadMovies();
  }, [search, genre, year, page]);

  useEffect(() => {
    loadWatchlistMap();
  }, [activeFamilyId]);

  const handleMovieAdded = () => {
    loadMovies();
  };

  return (
    <div className="movies-page animate-fade-in">
      <div className="movies-header">
        <div>
          <h1 className="movies-title">Movie Catalog</h1>
          <p className="movies-subtitle">
            Explore {totalMovies} family-friendly movies, blockbusters & classics
          </p>
        </div>

        {user && user.role === 'parent' && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>Add Movie</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar-container">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          onClear={() => setSearch('')}
        />
        <FilterBar
          selectedGenre={genre}
          onGenreChange={(g) => { setGenre(g); setPage(1); }}
          selectedYear={year}
          onYearChange={(y) => { setYear(y); setPage(1); }}
        />
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={loadMovies} />
      ) : (
        <>
          <MovieGrid
            movies={movies}
            loading={loading}
            watchlistMap={watchlistMap}
            onWatchlistChange={loadWatchlistMap}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Parent Add Movie Modal */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMovieAdded={handleMovieAdded}
      />
    </div>
  );
};

export default Movies;
