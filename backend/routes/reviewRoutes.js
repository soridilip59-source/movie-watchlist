const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addReview,
  getMovieReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Routes mounted at /api/movies/:movieId/reviews or /api/reviews
router.route('/')
  .post(protect, addReview)
  .get(getMovieReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
