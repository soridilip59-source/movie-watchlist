const Family = require('../models/Family');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');

// @desc    Create a new family
// @route   POST /api/families
// @access  Private
const createFamily = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a family name.',
      });
    }

    // Check if user already belongs to a family
    const existingFamily = await Family.findOne({ members: req.user._id });
    if (existingFamily) {
      return res.status(400).json({
        success: false,
        message: 'You already belong to a family workspace.',
        family: existingFamily,
      });
    }

    const family = await Family.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populatedFamily = await Family.findById(family._id).populate(
      'members',
      'name email role avatar'
    );

    return res.status(201).json({
      success: true,
      message: 'Family created successfully',
      family: populatedFamily,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get family by ID
// @route   GET /api/families/:id
// @access  Private
const getFamilyById = async (req, res, next) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate('createdBy', 'name email role avatar')
      .populate('members', 'name email role avatar createdAt');

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found.',
      });
    }

    // Verify user belongs to this family
    const isMember = family.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this family.',
      });
    }

    return res.json({
      success: true,
      family,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to family (Parent only)
// @route   POST /api/families/:id/members
// @access  Private (Parent)
const addFamilyMember = async (req, res, next) => {
  try {
    const { email, role, name, password } = req.body;
    const family = await Family.findById(req.params.id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found.',
      });
    }

    // Authorization check: Must be a member and a Parent
    const isMember = family.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not belong to this family.',
      });
    }

    if (req.user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Only parents can add family members.',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address for the new member.',
      });
    }

    let targetUser = await User.findOne({ email: email.toLowerCase() });

    // If user doesn't exist, create account for them
    if (!targetUser) {
      if (!name || !password) {
        return res.status(400).json({
          success: false,
          message: 'User does not exist. Please provide name and password to create account.',
        });
      }

      targetUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role && ['parent', 'child'].includes(role) ? role : 'child',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      });
    }

    // Check if user is already a member of this family
    if (family.members.includes(targetUser._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this family.',
      });
    }

    family.members.push(targetUser._id);
    await family.save();

    const updatedFamily = await Family.findById(family._id).populate(
      'members',
      'name email role avatar createdAt'
    );

    return res.json({
      success: true,
      message: 'Family member added successfully',
      family: updatedFamily,
      addedMember: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        avatar: targetUser.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from family (Parent only)
// @route   DELETE /api/families/:id/members/:userId
// @access  Private (Parent)
const removeFamilyMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const family = await Family.findById(id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found.',
      });
    }

    // Must be parent
    if (req.user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Children cannot remove family members.',
      });
    }

    // Check if user belongs to family
    const isMember = family.members.some(
      (mId) => mId.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not belong to this family.',
      });
    }

    // Cannot remove creator/self if sole parent
    family.members = family.members.filter(
      (mId) => mId.toString() !== userId.toString()
    );
    await family.save();

    const updatedFamily = await Family.findById(family._id).populate(
      'members',
      'name email role avatar createdAt'
    );

    return res.json({
      success: true,
      message: 'Family member removed successfully',
      family: updatedFamily,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Family Dashboard Stats
// @route   GET /api/families/:id/dashboard
// @access  Private
const getFamilyDashboard = async (req, res, next) => {
  try {
    const familyId = req.params.id;
    const family = await Family.findById(familyId).populate('members', 'name email role avatar');

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found.',
      });
    }

    const isMember = family.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to family dashboard.',
      });
    }

    const totalMovies = await Movie.countDocuments();
    const watchlistEntries = await Watchlist.find({ familyId }).populate('movieId').populate('addedBy', 'name avatar').populate('watchedBy', 'name avatar');

    const watchlistCount = watchlistEntries.length;
    const plannedCount = watchlistEntries.filter((w) => w.status === 'planned').length;
    const watchingCount = watchlistEntries.filter((w) => w.status === 'watching').length;
    const watchedCount = watchlistEntries.filter((w) => w.status === 'watched').length;

    // Top genres calculation from watched/watchlist movies
    const genreMap = {};
    watchlistEntries.forEach((item) => {
      if (item.movieId && Array.isArray(item.movieId.genre)) {
        item.movieId.genre.forEach((g) => {
          genreMap[g] = (genreMap[g] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Recently added (last 5)
    const recentlyAdded = [...watchlistEntries]
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 5);

    // Recently watched (last 5)
    const recentlyWatched = [...watchlistEntries]
      .filter((w) => w.status === 'watched' && w.watchedAt)
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        totalMovies,
        watchlistCount,
        watchedCount,
        plannedCount,
        watchingCount,
        familyMembers: family.members.length,
        topGenres,
        recentlyAdded,
        recentlyWatched,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Movie Recommendations for Family
// @route   GET /api/families/:id/recommendations
// @access  Private
const getFamilyRecommendations = async (req, res, next) => {
  try {
    const familyId = req.params.id;
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
        message: 'Access denied.',
      });
    }

    // Get all movie IDs currently in family's watchlist
    const watchlist = await Watchlist.find({ familyId }).select('movieId');
    const existingMovieIds = watchlist.map((item) => item.movieId.toString());

    // Collect top preferred genres from watchlist & watched movies
    const watchlistFull = await Watchlist.find({ familyId }).populate('movieId');
    const genreCounts = {};
    watchlistFull.forEach((item) => {
      if (item.movieId && Array.isArray(item.movieId.genre)) {
        item.movieId.genre.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    const preferredGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g);

    // Build recommendation query excluding existing watchlist movies
    let query = {
      _id: { $nin: existingMovieIds },
    };

    if (preferredGenres.length > 0) {
      query.genre = { $in: preferredGenres };
    }

    let recommendations = await Movie.find(query)
      .sort({ rating: -1, releaseYear: -1 })
      .limit(10);

    // Fallback if not enough recommendations based on preferred genres
    if (recommendations.length < 5) {
      const fallback = await Movie.find({ _id: { $nin: existingMovieIds } })
        .sort({ rating: -1 })
        .limit(10);
      recommendations = fallback;
    }

    return res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFamily,
  getFamilyById,
  addFamilyMember,
  removeFamilyMember,
  getFamilyDashboard,
  getFamilyRecommendations,
};
