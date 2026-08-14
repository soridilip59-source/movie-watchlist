import React, { useState } from 'react';
import Modal from './Modal';
import { createMovie } from '../services/movieService';

const AddMovieModal = ({ isOpen, onClose, onMovieAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Animation',
    releaseYear: new Date().getFullYear(),
    duration: '120 min',
    posterUrl: '',
    trailerUrl: '',
    ageRating: 'PG',
    language: 'English',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.posterUrl) {
      return setError('Please fill in all required fields.');
    }

    try {
      setSubmitting(true);
      const res = await createMovie(formData);
      if (res.success) {
        onMovieAdded(res.movie);
        onClose();
        setFormData({
          title: '',
          description: '',
          genre: 'Animation',
          releaseYear: new Date().getFullYear(),
          duration: '120 min',
          posterUrl: '',
          trailerUrl: '',
          ageRating: 'PG',
          language: 'English',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to create movie.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Movie to Catalog">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-banner mb-3">{error}</div>}

        <div className="form-group">
          <label className="form-label">Movie Title *</label>
          <input
            type="text"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Toy Story 5"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Movie plot overview..."
            rows={3}
            required
          />
        </div>

        <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Primary Genre *</label>
            <select name="genre" className="form-select" value={formData.genre} onChange={handleChange}>
              <option value="Animation">Animation</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Family">Family</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Sci-Fi">Sci-Fi</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Release Year *</label>
            <input
              type="number"
              name="releaseYear"
              className="form-input"
              value={formData.releaseYear}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid-2-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Age Rating</label>
            <select name="ageRating" className="form-select" value={formData.ageRating} onChange={handleChange}>
              <option value="G">G (General)</option>
              <option value="PG">PG (Parental Guidance)</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="TV-Y7">TV-Y7</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <input
              type="text"
              name="duration"
              className="form-input"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 105 min"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Poster Image URL *</label>
          <input
            type="url"
            name="posterUrl"
            className="form-input"
            value={formData.posterUrl}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">YouTube Trailer URL (Optional)</label>
          <input
            type="url"
            name="trailerUrl"
            className="form-input"
            value={formData.trailerUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Movie'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMovieModal;
