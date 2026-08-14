const Movie = require('../models/Movie');

// @desc    Get all movies with search, filter, and pagination
// @route   GET /api/movies
// @access  Public / Private
const getMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, genre, year } = req.query;
    let query = {};

    // Search filter (regex search on title or description)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Genre filter
    if (genre && genre.trim() !== '' && genre.toLowerCase() !== 'all') {
      query.genre = { $in: [new RegExp(`^${genre.trim()}$`, 'i')] };
    }

    // Year filter
    if (year && !isNaN(parseInt(year, 10))) {
      query.releaseYear = parseInt(year, 10);
    }

    const totalMovies = await Movie.countDocuments(query);
    const totalPages = Math.ceil(totalMovies / limit) || 1;

    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      movies,
      page,
      limit,
      totalMovies,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public / Private
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    return res.json({
      success: true,
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Parent only)
// @route   POST /api/movies
// @access  Private (Parent)
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      releaseYear,
      duration,
      posterUrl,
      trailerUrl,
      ageRating,
      language,
    } = req.body;

    if (!title || !description || !genre || !releaseYear || !posterUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, genre, releaseYear, and posterUrl.',
      });
    }

    const movie = await Movie.create({
      title,
      description,
      genre: Array.isArray(genre) ? genre : genre.split(',').map((g) => g.trim()),
      releaseYear: parseInt(releaseYear, 10),
      duration: duration || '120 min',
      posterUrl,
      trailerUrl: trailerUrl || '',
      ageRating: ageRating || 'PG',
      language: language || 'English',
    });

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Parent only)
// @route   PUT /api/movies/:id
// @access  Private (Parent)
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    if (req.body.genre && !Array.isArray(req.body.genre)) {
      req.body.genre = req.body.genre.split(',').map((g) => g.trim());
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Parent only)
// @route   DELETE /api/movies/:id
// @access  Private (Parent)
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    await movie.deleteOne();

    return res.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
