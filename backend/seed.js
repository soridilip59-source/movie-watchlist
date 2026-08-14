const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const User = require('./models/User');
const Family = require('./models/Family');
const Movie = require('./models/Movie');
const Watchlist = require('./models/Watchlist');
const Review = require('./models/Review');

dotenv.config();

const sampleMovies = [
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
    description: 'Follow Joy, Sadness, Anger, Fear and Disgust as teenage Anxiety joins headquarters in a emotional adventure.',
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

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Family.deleteMany({});
    await Movie.deleteMany({});
    await Watchlist.deleteMany({});
    await Review.deleteMany({});

    console.log('[Seed] Inserting users...');
    const parent1 = await User.create({
      name: 'John Doe',
      email: 'parent@example.com',
      password: 'password123',
      role: 'parent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
    });

    const parent2 = await User.create({
      name: 'Sarah Doe',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'parent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahDoe',
    });

    const child1 = await User.create({
      name: 'Timmy Doe',
      email: 'child@example.com',
      password: 'password123',
      role: 'child',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TimmyDoe',
    });

    const child2 = await User.create({
      name: 'Emma Doe',
      email: 'emma@example.com',
      password: 'password123',
      role: 'child',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaDoe',
    });

    console.log('[Seed] Creating Family workspace...');
    const family = await Family.create({
      name: 'The Doe Family',
      createdBy: parent1._id,
      members: [parent1._id, parent2._id, child1._id, child2._id],
    });

    console.log('[Seed] Inserting Movies catalog...');
    const insertedMovies = await Movie.insertMany(sampleMovies);

    console.log('[Seed] Populating Watchlist items...');
    const watchlistEntries = [
      {
        familyId: family._id,
        movieId: insertedMovies[0]._id, // Spider-Man
        addedBy: parent1._id,
        status: 'watched',
        priority: 'high',
        notes: 'Watched together on Movie Night with popcorn!',
        watchedBy: parent1._id,
        watchedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        familyId: family._id,
        movieId: insertedMovies[1]._id, // Inside Out 2
        addedBy: child1._id,
        status: 'watching',
        priority: 'high',
        notes: 'Timmy wanted to see Anxiety and Disgust!',
      },
      {
        familyId: family._id,
        movieId: insertedMovies[3]._id, // Paddington in Peru
        addedBy: parent2._id,
        status: 'planned',
        priority: 'medium',
        notes: 'Scheduled for next Sunday family evening.',
      },
      {
        familyId: family._id,
        movieId: insertedMovies[4]._id, // Super Mario Bros
        addedBy: child2._id,
        status: 'watched',
        priority: 'medium',
        notes: 'Emma loved Princess Peach!',
        watchedBy: child2._id,
        watchedAt: new Date(Date.now() - 86400000 * 5),
      },
    ];

    await Watchlist.insertMany(watchlistEntries);

    console.log('[Seed] Creating Reviews & calculating ratings...');
    const sampleReviews = [
      {
        movieId: insertedMovies[0]._id,
        userId: parent1._id,
        familyId: family._id,
        rating: 5,
        comment: 'Mind-blowing animation and fantastic story! The whole family was on the edge of their seats.',
      },
      {
        movieId: insertedMovies[0]._id,
        userId: child1._id,
        familyId: family._id,
        rating: 5,
        comment: 'Miles Morales is the best superhero ever! 100/10!',
      },
      {
        movieId: insertedMovies[1]._id,
        userId: parent2._id,
        familyId: family._id,
        rating: 4,
        comment: 'Such a heartwarming depiction of teenage emotions. Very relatable for parents too.',
      },
      {
        movieId: insertedMovies[4]._id,
        userId: child2._id,
        familyId: family._id,
        rating: 5,
        comment: 'Super fun video game movie! Loved Rainbow Road.',
      },
    ];

    await Review.insertMany(sampleReviews);

    // Update average ratings for all movies
    for (const movie of insertedMovies) {
      const reviews = await Review.find({ movieId: movie._id });
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        movie.rating = parseFloat((total / reviews.length).toFixed(1));
        movie.reviewCount = reviews.length;
      } else {
        movie.rating = 4.5; // default fallback rating for display
        movie.reviewCount = 1;
      }
      await movie.save();
    }

    console.log('----------------------------------------------------');
    console.log(' Seed completed successfully!');
    console.log(' Sample Credentials:');
    console.log(' Parent Login : parent@example.com / password123');
    console.log(' Child Login  : child@example.com / password123');
    console.log(' Family ID    : ' + family._id);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
