const User = require('../models/User');
const Family = require('../models/Family');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user & create initial family profile
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'parent' } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: full name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role.toLowerCase(),
    });

    // Auto-create family profile for new parent user
    let family = null;
    try {
      if (Family) {
        family = await Family.create({
          name: `${user.name}'s Family`,
          members: [
            {
              userId: user._id,
              name: user.name,
              role: user.role === 'child' ? 'kid' : 'parent',
              age: user.role === 'child' ? 10 : 35,
              maxRating: user.role === 'child' ? 'PG' : 'R',
              avatar: user.role === 'child' ? '🦸' : '👤',
            },
          ],
        });

        user.familyId = family._id;
        await user.save();
      }
    } catch (fErr) {
      console.warn('[AuthController] Note during family creation:', fErr.message);
    }

    const token = generateToken(user._id);
    const avatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar,
        familyId: user.familyId || (family ? family._id : null),
        familyName: family ? family.name : null,
      },
    });
  } catch (error) {
    console.error('[AuthController] Register error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while creating your account.',
    });
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user with password included
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // Lookup family name if familyId exists
    let familyName = null;
    if (user.familyId && Family) {
      try {
        const fam = await Family.findById(user.familyId);
        if (fam) familyName = fam.name;
      } catch (err) {}
    }

    const token = generateToken(user._id);
    const avatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar,
        familyId: user.familyId,
        familyName,
      },
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during login.',
    });
  }
};

// @desc    Get currently authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Requires Bearer token)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    let familyName = null;
    if (user.familyId && Family) {
      try {
        const fam = await Family.findById(user.familyId);
        if (fam) familyName = fam.name;
      } catch (err) {}
    }

    const avatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar,
        familyId: user.familyId,
        familyName,
      },
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar,
        familyId: user.familyId,
        familyName,
      },
    });
  } catch (error) {
    console.error('[AuthController] getMe error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile.',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
