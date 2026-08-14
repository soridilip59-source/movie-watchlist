const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.post('/', protect, authorize('parent'), createMovie);
router.put('/:id', protect, authorize('parent'), updateMovie);
router.delete('/:id', protect, authorize('parent'), deleteMovie);

module.exports = router;
