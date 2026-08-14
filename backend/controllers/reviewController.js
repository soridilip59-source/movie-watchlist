const Review = require('../models/Review');
const Movie = require('../models/Movie');
const Family = require('../models/Family');

// Helper function to update average movie rating
const updateMovieRating = async (movieId) => {
  const reviews = await Review.find({ movieId });
  const reviewCount = reviews.length;
  let avgRating = 0;

  if (reviewCount > 0) {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = parseFloat((total / reviewCount).toFixed(1));
  }

  await Movie.findByIdAndUpdate(movieId, {
    rating: avgRating,
    reviewCount: reviewCount,
  });
};

// @desc    Add review for a movie
// @route   POST /api/movies/:movieId/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { rating, comment, familyId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating (1-5) and comment.',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    let targetFamilyId = familyId;
    if (!targetFamilyId) {
      const family = await Family.findOne({ members: req.user._id });
      if (family) {
        targetFamilyId = family._id;
      }
    }

    // Check for existing review by user for this movie
    const existingReview = await Review.findOne({
      movieId,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this movie. You can edit your existing review.',
      });
    }

    const review = await Review.create({
      movieId,
      userId: req.user._id,
      familyId: targetFamilyId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    await updateMovieRating(movieId);

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'name avatar role'
    );

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a movie
// @route   GET /api/movies/:movieId/reviews
// @access  Public / Private
const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId })
      .populate('userId', 'name avatar role')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review (User can edit own review)
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own review.',
      });
    }

    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment.trim();

    await review.save();
    await updateMovieRating(review.movieId);

    const updatedReview = await Review.findById(review._id).populate(
      'userId',
      'name avatar role'
    );

    return res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (User can delete own review, or parent can delete)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const isOwner = review.userId.toString() === req.user._id.toString();
    const isParent = req.user.role === 'parent';

    if (!isOwner && !isParent) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this review.',
      });
    }

    const movieId = review.movieId;
    await review.deleteOne();
    await updateMovieRating(movieId);

    return res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getMovieReviews,
  updateReview,
  deleteReview,
};
