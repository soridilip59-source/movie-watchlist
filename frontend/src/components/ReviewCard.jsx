import React from 'react';
import RatingStars from './RatingStars';
import { Trash2, User } from 'lucide-react';
import './ReviewCard.css';

const ReviewCard = ({ review, currentUser, onDelete }) => {
  const isOwner = currentUser && review.userId && review.userId._id === currentUser._id;
  const isParent = currentUser && currentUser.role === 'parent';
  const canDelete = isOwner || isParent;

  const userObj = review.userId || {};
  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="review-card animate-fade-in">
      <div className="review-header">
        <div className="reviewer-info">
          <img
            src={userObj.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userObj.name}`}
            alt={userObj.name}
            className="reviewer-avatar"
          />
          <div>
            <div className="reviewer-name-row">
              <span className="reviewer-name">{userObj.name || 'Family Member'}</span>
              <span className={`badge badge-role-${userObj.role || 'parent'}`}>{userObj.role || 'parent'}</span>
            </div>
            <span className="review-date">{formattedDate}</span>
          </div>
        </div>

        <div className="review-header-right">
          <RatingStars rating={review.rating} readOnly size={16} />
          {canDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="delete-review-btn"
              title="Delete review"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <p className="review-comment">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;
