import mongoose from 'mongoose';
import { config } from '../config';
import { FamilyModel } from '../models/family.model';
import { MovieModel } from '../models/movie.model';
import { WatchlistModel } from '../models/watchlist.model';
import { RatingModel } from '../models/rating.model';

export async function connectMongo(): Promise<boolean> {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000 // Quick timeout if Mongo isn't running locally
    });
    console.log(`🍃 Connected to MongoDB database at ${config.mongoUri}`);
    return true;
  } catch (err: any) {
    console.log(`⚠️ MongoDB connection skipped or failed (${err.message}). Using local SQLite engine.`);
    return false;
  }
}

export async function seedMongoDatabase() {
  if (mongoose.connection.readyState !== 1) return;

  await FamilyModel.deleteMany({});
  await MovieModel.deleteMany({});
  await WatchlistModel.deleteMany({});
  await RatingModel.deleteMany({});

  // Seed Family & Members
  await FamilyModel.create({
    numeric_id: 1,
    name: 'The Miller Family',
    members: [
      { id: 1, name: 'Dan (Dad)', role: 'Parent', age: 40, max_rating: 'R', avatar_emoji: '👨‍👩‍👧‍👦' },
      { id: 2, name: 'Sarah (Mom)', role: 'Parent', age: 38, max_rating: 'R', avatar_emoji: '👩‍💻' },
      { id: 3, name: 'Maya', role: 'Teen', age: 15, max_rating: 'PG-13', avatar_emoji: '🎧' },
      { id: 4, name: 'Leo', role: 'Kid', age: 8, max_rating: 'PG', avatar_emoji: '🦸‍♂️' }
    ]
  });

  // Seed Movies
  const movies = [
    {
      numeric_id: 1,
      title: 'Inside Out 2',
      release_year: 2024,
      genres: 'Animation, Comedy, Family',
      content_rating: 'PG',
      duration_minutes: 96,
      synopsis: 'Teenager Riley experiences new emotions as Joy, Sadness, Anger, Fear, and Disgust make room for Anxiety, Envy, Ennui, and Embarrassment.',
      director: 'Kelsey Mann',
      poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
      streaming_services: 'Disney+',
      imdb_rating: 7.7
    },
    {
      numeric_id: 2,
      title: 'Spider-Man: Across the Spider-Verse',
      release_year: 2023,
      genres: 'Animation, Action, Sci-Fi',
      content_rating: 'PG-13',
      duration_minutes: 140,
      synopsis: 'Miles Morales catapults across the Multiverse, encountering a team of Spider-People charged with protecting its existence.',
      director: 'Joaquim Dos Santos, Kemp Powers',
      poster_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      streaming_services: 'Netflix',
      imdb_rating: 8.6
    },
    {
      numeric_id: 3,
      title: 'Paddington 2',
      release_year: 2017,
      genres: 'Adventure, Comedy, Family',
      content_rating: 'PG',
      duration_minutes: 103,
      synopsis: 'Paddington undertakes a number of odd jobs to buy the perfect present for his Aunt Lucy\'s 100th birthday, only for the gift to be stolen.',
      director: 'Paul King',
      poster_url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=500&auto=format&fit=crop&q=80',
      streaming_services: 'Prime Video',
      imdb_rating: 7.8
    },
    {
      numeric_id: 4,
      title: 'The Incredibles',
      release_year: 2004,
      genres: 'Animation, Action, Adventure',
      content_rating: 'PG',
      duration_minutes: 115,
      synopsis: 'A family of undercover superheroes, while trying to live the quiet suburban life, are forced into action to save the world.',
      director: 'Brad Bird',
      poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      streaming_services: 'Disney+',
      imdb_rating: 8.0
    }
  ];

  await MovieModel.insertMany(movies);

  // Seed Watchlist
  await WatchlistModel.create({
    numeric_id: 1,
    family_id: 1,
    movie_id: 1,
    added_by_member_id: 1,
    status: 'want_to_watch',
    priority: 'high',
    notes: 'Everyone wants to see the new emotions!'
  });

  // Seed Ratings
  await RatingModel.create({
    numeric_id: 1,
    movie_id: 3,
    member_id: 1,
    rating: 5,
    review_text: 'Masterpiece of cozy cinema! Dan approved.'
  });

  console.log('✅ MongoDB Family Movie Watchlist Database seeded successfully!');
}
