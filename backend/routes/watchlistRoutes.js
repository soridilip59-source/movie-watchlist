const express = require('express');
const router = express.Router();
const {
  addToWatchlist,
  getFamilyWatchlist,
  getWatchlistItem,
  updateWatchlistItem,
  updateWatchlistStatus,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addToWatchlist);
router.get('/:familyId', protect, getFamilyWatchlist);
router.get('/:familyId/:movieId', protect, getWatchlistItem);
router.put('/:id', protect, updateWatchlistItem);
router.put('/:id/status', protect, updateWatchlistStatus);
router.delete('/:id', protect, removeFromWatchlist);

module.exports = router;
