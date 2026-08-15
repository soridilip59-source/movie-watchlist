import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  release_year: z.number().int().min(1888).max(2100),
  genres: z.string().min(1, 'At least one genre is required'), // comma separated
  content_rating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  duration_minutes: z.number().int().positive('Duration must be positive'),
  synopsis: z.string().min(5, 'Synopsis must be at least 5 characters'),
  director: z.string().min(1, 'Director is required'),
  poster_url: z.string().url().or(z.string().length(0)).optional(),
  streaming_services: z.string().min(1, 'Streaming services required'),
  imdb_rating: z.number().min(0).max(10).optional().default(0)
});

export const updateMovieSchema = createMovieSchema.partial();

export const queryMovieSchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  content_rating: z.string().optional(),
  streaming_service: z.string().optional(),
  min_imdb: z.coerce.number().min(0).max(10).optional(),
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().min(0).default(0)
});
