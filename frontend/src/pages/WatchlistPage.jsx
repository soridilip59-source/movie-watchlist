import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchFamilyWatchlist,
  updateWatchlistStatus,
  updateWatchlistItem,
  removeFromWatchlist,
} from '../services/watchlistService';
import WatchlistCard from '../components/WatchlistCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SearchBar from '../components/SearchBar';
import { BookmarkCheck, Clock, PlayCircle, CheckCircle2, Filter } from 'lucide-react';
import './WatchlistPage.css';

const WatchlistPage = () => {
  const { activeFamilyId, family } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active tab & filters
  const [activeTab, setActiveTab] = useState('all'); // all, planned, watching, watched
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadWatchlist = async () => {
    if (!activeFamilyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetchFamilyWatchlist(activeFamilyId);
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load watchlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [activeFamilyId]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await updateWatchlistStatus(itemId, newStatus);
      if (res.success) {
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? res.data : item))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleUpdateItem = async (itemId, updateData) => {
    const res = await updateWatchlistItem(itemId, updateData);
    if (res.success) {
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? res.data : item))
      );
    }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm('Remove this movie from your family watchlist?')) return;
    try {
      const res = await removeFromWatchlist(itemId);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item._id !== itemId));
      }
    } catch (err) {
      alert(err.message || 'Failed to remove movie');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // Status Tab Filter
    if (activeTab !== 'all' && item.status !== activeTab) return false;

    // Priority Filter
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const title = item.movieId?.title?.toLowerCase() || '';
      const notes = item.notes?.toLowerCase() || '';
      const q = searchQuery.toLowerCase();
      if (!title.includes(q) && !notes.includes(q)) return false;
    }

    return true;
  });

  const plannedCount = items.filter((i) => i.status === 'planned').length;
  const watchingCount = items.filter((i) => i.status === 'watching').length;
  const watchedCount = items.filter((i) => i.status === 'watched').length;

  if (loading) {
    return <LoadingSpinner text="Loading family watchlist..." />;
  }

  return (
    <div className="watchlist-page animate-fade-in">
      <div className="watchlist-header">
        <div>
          <h1 className="watchlist-page-title">Family Watchlist</h1>
          <p className="watchlist-page-subtitle">
            Shared movies for {family?.name || 'your family'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="watchlist-tabs-row">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <BookmarkCheck size={16} />
          <span>All ({items.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'planned' ? 'active' : ''}`}
          onClick={() => setActiveTab('planned')}
        >
          <Clock size={16} />
          <span>Planned ({plannedCount})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'watching' ? 'active' : ''}`}
          onClick={() => setActiveTab('watching')}
        >
          <PlayCircle size={16} />
          <span>Watching ({watchingCount})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
          onClick={() => setActiveTab('watched')}
        >
          <CheckCircle2 size={16} />
          <span>Watched ({watchedCount})</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="watchlist-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Filter watchlist items..."
        />

        <div className="priority-filter-wrap">
          <Filter size={16} className="filter-icon" />
          <span className="filter-label">Priority:</span>
          <select
            className="form-select btn-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={loadWatchlist} />
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <BookmarkCheck size={48} className="empty-icon" />
          <h3>No movies found in this tab.</h3>
          <p>Add movies from the catalog or adjust your active filters.</p>
        </div>
      ) : (
        <div className="watchlist-cards-list">
          {filteredItems.map((item) => (
            <WatchlistCard
              key={item._id}
              item={item}
              onStatusChange={handleStatusChange}
              onRemove={handleRemove}
              onUpdateItem={handleUpdateItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
