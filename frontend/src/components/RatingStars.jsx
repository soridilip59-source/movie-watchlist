import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingStars.css';

const RatingStars = ({ rating = 0, onRatingChange = null, size = 18, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className={`rating-stars ${readOnly ? 'read-only' : 'interactive'}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            className="star-btn"
            disabled={readOnly}
            onClick={() => onRatingChange && onRatingChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              color={isFilled ? '#f59e0b' : '#6b7280'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
