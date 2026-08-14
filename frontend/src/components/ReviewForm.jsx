import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { MessageSquare, Send } from 'lucide-react';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, submitting = false }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert('Please enter a review comment.');
    onSubmit({ rating, comment });
    setComment('');
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-header">
        <div className="review-form-title">
          <MessageSquare size={18} color="#e50914" />
          <span>Write a Review</span>
        </div>

        <div className="rating-select-group">
          <span className="rating-label">Your Rating:</span>
          <RatingStars rating={rating} onRatingChange={setRating} size={22} />
        </div>
      </div>

      <textarea
        className="form-textarea review-textarea"
        placeholder="Share your thoughts about this movie with your family..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        required
      />

      <div className="review-form-footer">
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="btn btn-primary btn-sm"
        >
          <Send size={16} />
          <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
