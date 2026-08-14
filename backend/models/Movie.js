const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    genre: {
      type: [String],
      required: [true, 'Please specify at least one genre'],
    },
    releaseYear: {
      type: Number,
      required: [true, 'Please provide a release year'],
    },
    duration: {
      type: String,
      default: '120 min',
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide a poster URL'],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    ageRating: {
      type: String,
      default: 'PG',
    },
    language: {
      type: String,
      default: 'English',
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 'text', description: 'text' });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
