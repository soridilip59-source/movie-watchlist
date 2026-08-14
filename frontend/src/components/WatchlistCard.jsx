import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit3, CheckCircle2, Clock, PlayCircle, Star, User } from 'lucide-react';
import RatingStars from './RatingStars';
import './WatchlistCard.css';

const WatchlistCard = ({ item, onStatusChange, onRemove, onUpdateItem }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  const [priority, setPriority] = useState(item.priority || 'medium');
  const [saving, setSaving] = useState(false);

  const movie = item.movieId || {};

  const handleSaveNotes = async () => {
    try {
      setSaving(true);
      await onUpdateItem(item._id, { notes, priority });
      setIsEditingNotes(false);
    } catch (err) {
      alert(err.message || 'Failed to update notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="watchlist-card animate-fade-in">
      <div className="watchlist-poster-wrap">
        <img src={movie.posterUrl} alt={movie.title} className="watchlist-poster" />
        <span className={`badge badge-priority-${item.priority} priority-tag`}>
          {item.priority} priority
        </span>
      </div>

      <div className="watchlist-content">
        <div className="watchlist-header">
          <div>
            <Link to={`/movies/${movie._id}`} className="watchlist-title-link">
              <h3 className="watchlist-title">{movie.title}</h3>
            </Link>
            <div className="watchlist-meta">
              <span>{movie.releaseYear}</span>
              <span>•</span>
              <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
              <span>•</span>
              <span>{movie.duration}</span>
            </div>
          </div>

          <button
            onClick={() => onRemove(item._id)}
            className="btn btn-danger btn-sm delete-btn"
            title="Remove from watchlist"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Notes section */}
        <div className="watchlist-notes-box">
          {isEditingNotes ? (
            <div className="notes-edit-area">
              <textarea
                className="form-textarea notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add family notes (e.g. Watch on Sunday night)..."
                rows={2}
              />
              <div className="notes-edit-actions">
                <select
                  className="form-select btn-sm"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveNotes}
                  disabled={saving}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditingNotes(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="notes-display" onClick={() => setIsEditingNotes(true)}>
              <span className="notes-text">
                {item.notes ? `"${item.notes}"` : 'No family notes added yet. Click to add notes.'}
              </span>
              <Edit3 size={14} className="edit-icon" />
            </div>
          )}
        </div>

        {/* Footer actions: Status selector & addedBy tag */}
        <div className="watchlist-footer">
          <div className="status-selector-wrap">
            <span className="status-label">Watch Status:</span>
            <div className="status-pill-group">
              <button
                className={`status-pill ${item.status === 'planned' ? 'active planned' : ''}`}
                onClick={() => onStatusChange(item._id, 'planned')}
              >
                <Clock size={14} />
                <span>Planned</span>
              </button>
              <button
                className={`status-pill ${item.status === 'watching' ? 'active watching' : ''}`}
                onClick={() => onStatusChange(item._id, 'watching')}
              >
                <PlayCircle size={14} />
                <span>Watching</span>
              </button>
              <button
                className={`status-pill ${item.status === 'watched' ? 'active watched' : ''}`}
                onClick={() => onStatusChange(item._id, 'watched')}
              >
                <CheckCircle2 size={14} />
                <span>Watched</span>
              </button>
            </div>
          </div>

          <div className="added-by-info">
            <User size={14} />
            <span>Added by {item.addedBy?.name || 'Family member'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistCard;
