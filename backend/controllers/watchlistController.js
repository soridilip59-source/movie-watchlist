const Watchlist = require('../models/Watchlist');
const Family = require('../models/Family');
const Movie = require('../models/Movie');

// @desc    Add movie to family watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId, familyId, priority, notes } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a movieId.',
      });
    }

    // Determine target family ID
    let targetFamilyId = familyId;
    if (!targetFamilyId) {
      const family = await Family.findOne({ members: req.user._id });
      if (!family) {
        return res.status(400).json({
          success: false,
          message: 'You must belong to a family to add items to a watchlist.',
        });
      }
      targetFamilyId = family._id;
    }

    // Check user membership
    const family = await Family.findById(targetFamilyId);
    if (!family || !family.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You do not belong to this family.',
      });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Check for duplicate in family watchlist
    const existing = await Watchlist.findOne({
      familyId: targetFamilyId,
      movieId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Movie is already present in your family watchlist.',
        watchlistItem: existing,
      });
    }

    const watchlistItem = await Watchlist.create({
      familyId: targetFamilyId,
      movieId,
      addedBy: req.user._id,
      status: 'planned',
      priority: priority && ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      notes: notes || '',
      addedAt: new Date(),
    });

    const populatedItem = await Watchlist.findById(watchlistItem._id)
      .populate('movieId')
      .populate('addedBy', 'name avatar role');

    return res.status(201).json({
      success: true,
      message: 'Movie added to family watchlist successfully',
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get family watchlist
// @route   GET /api/watchlist/:familyId
// @access  Private
const getFamilyWatchlist = async (req, res, next) => {
  try {
    const { familyId } = req.params;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found.',
      });
    }

    const isMember = family.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not belong to this family.',
      });
    }

    const watchlist = await Watchlist.find({ familyId })
      .populate('movieId')
      .populate('addedBy', 'name avatar role')
      .populate('watchedBy', 'name avatar role')
      .sort({ addedAt: -1 });

    return res.json({
      success: true,
      count: watchlist.length,
      data: watchlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single watchlist item by familyId and movieId
// @route   GET /api/watchlist/:familyId/:movieId
// @access  Private
const getWatchlistItem = async (req, res, next) => {
  try {
    const { familyId, movieId } = req.params;

    const item = await Watchlist.findOne({ familyId, movieId })
      .populate('movieId')
      .populate('addedBy', 'name avatar role')
      .populate('watchedBy', 'name avatar role');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Movie is not in family watchlist.',
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watchlist item details (priority/notes)
// @route   PUT /api/watchlist/:id
// @access  Private
const updateWatchlistItem = async (req, res, next) => {
  try {
    const { priority, notes } = req.body;
    let item = await Watchlist.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found.',
      });
    }

    // Verify user belongs to the item's family
    const family = await Family.findById(item.familyId);
    if (!family || !family.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      item.priority = priority;
    }
    if (notes !== undefined) {
      item.notes = notes;
    }

    await item.save();

    const updatedItem = await Watchlist.findById(item._id)
      .populate('movieId')
      .populate('addedBy', 'name avatar role')
      .populate('watchedBy', 'name avatar role');

    return res.json({
      success: true,
      message: 'Watchlist item updated',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watchlist status (planned -> watching -> watched)
// @route   PUT /api/watchlist/:id/status
// @access  Private
const updateWatchlistStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['planned', 'watching', 'watched'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be planned, watching, or watched.',
      });
    }

    let item = await Watchlist.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found.',
      });
    }

    const family = await Family.findById(item.familyId);
    if (!family || !family.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    item.status = status;
    if (status === 'watched') {
      item.watchedBy = req.user._id;
      item.watchedAt = new Date();
    } else {
      item.watchedBy = null;
      item.watchedAt = null;
    }

    await item.save();

    const updatedItem = await Watchlist.findById(item._id)
      .populate('movieId')
      .populate('addedBy', 'name avatar role')
      .populate('watchedBy', 'name avatar role');

    return res.json({
      success: true,
      message: `Status updated to '${status}'`,
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = async (req, res, next) => {
  try {
    const item = await Watchlist.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found.',
      });
    }

    const family = await Family.findById(item.familyId);
    if (!family || !family.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    await item.deleteOne();

    return res.json({
      success: true,
      message: 'Movie removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWatchlist,
  getFamilyWatchlist,
  getWatchlistItem,
  updateWatchlistItem,
  updateWatchlistStatus,
  removeFromWatchlist,
};
