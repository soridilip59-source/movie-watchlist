const Movie = require('../models/Movie');

const initialCatalog = [
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genre: ['Animation', 'Action', 'Adventure'],
    releaseYear: 2023,
    duration: '140 min',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Inside Out 2',
    description: 'Follow Joy, Sadness, Anger, Fear and Disgust as teenage Anxiety joins headquarters in an emotional adventure.',
    genre: ['Animation', 'Comedy', 'Family'],
    releaseYear: 2024,
    duration: '96 min',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri.',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    releaseYear: 2022,
    duration: '192 min',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    ageRating: 'PG-13',
    language: 'English',
  },
  {
    title: 'Paddington in Peru',
    description: 'Paddington returns to Peru to visit his beloved Aunt Lucy, who now resides at the Home for Retired Bears.',
    genre: ['Adventure', 'Comedy', 'Family'],
    releaseYear: 2025,
    duration: '105 min',
    posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=7uKqtrgKzGg',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'The Super Mario Bros. Movie',
    description: 'A plumber named Mario travels through an underground labyrinth with his brother, Luigi, trying to save a captured princess.',
    genre: ['Animation', 'Adventure', 'Comedy'],
    releaseYear: 2023,
    duration: '92 min',
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=TnGl01FkBUE',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Kung Fu Panda 4',
    description: 'After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior.',
    genre: ['Animation', 'Action', 'Comedy'],
    releaseYear: 2024,
    duration: '94 min',
    posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Guardians of the Galaxy Vol. 3',
    description: 'Still reeling from the loss of Gamora, Peter Quill rallies his team to defend the universe and protect one of their own.',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    releaseYear: 2023,
    duration: '150 min',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=u3V5KDHRQvk',
    ageRating: 'PG-13',
    language: 'English',
  },
  {
    title: 'Despicable Me 4',
    description: 'Gru, Lucy, Margo, Edith, and Agnes welcome a new member to the family, Gru Jr., who is intent on tormenting his dad.',
    genre: ['Animation', 'Comedy', 'Family'],
    releaseYear: 2024,
    duration: '95 min',
    posterUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=qQlr9-rF320',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    releaseYear: 2014,
    duration: '169 min',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    ageRating: 'PG-13',
    language: 'English',
  },
  {
    title: 'Moana 2',
    description: 'Moana receives an unexpected call from her wayfinding ancestors and embarks on a journey into far seas of Oceania.',
    genre: ['Animation', 'Adventure', 'Family'],
    releaseYear: 2024,
    duration: '100 min',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=hDZ7y8RP5HE',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Wicked',
    description: 'Elphaba, a misunderstood young woman born with green skin, forms an unlikely friendship with Glinda in the magical land of Oz.',
    genre: ['Fantasy', 'Drama', 'Family'],
    releaseYear: 2024,
    duration: '160 min',
    posterUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=6COmYeLsz4c',
    ageRating: 'PG',
    language: 'English',
  },
  {
    title: 'Elemental',
    description: 'In a city where fire, water, land, and air residents live together, a fiery young woman and a go-with-the-flow guy discover how much they have in common.',
    genre: ['Animation', 'Comedy', 'Fantasy'],
    releaseYear: 2023,
    duration: '101 min',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=hXzcyx9V0xw',
    ageRating: 'PG',
    language: 'English',
  },
];

// @desc    Get all movies with search, filter, and pagination (Auto-seeds if catalog is empty)
// @route   GET /api/movies
// @access  Public / Private
const getMovies = async (req, res, next) => {
  try {
    // Auto-seed initial catalog if database is empty
    const totalExisting = await Movie.countDocuments();
    if (totalExisting === 0) {
      try {
        await Movie.insertMany(initialCatalog);
        console.log('[MovieController] Auto-seeded initial movie catalog successfully.');
      } catch (sErr) {
        console.warn('[MovieController] Auto-seed note:', sErr.message);
      }
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
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
