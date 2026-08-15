import { z } from 'zod';

export const addToWatchlistSchema = z.object({
  family_id: z.number().int().positive(),
  movie_id: z.number().int().positive(),
  added_by_member_id: z.number().int().positive().optional(),
  status: z.enum(['want_to_watch', 'watching', 'watched']).default('want_to_watch'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  notes: z.string().optional()
});

export const updateWatchlistSchema = z.object({
  status: z.enum(['want_to_watch', 'watching', 'watched']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  notes: z.string().optional()
});

export const queryWatchlistSchema = z.object({
  family_id: z.coerce.number().int().positive().default(1),
  status: z.enum(['want_to_watch', 'watching', 'watched']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  member_id: z.coerce.number().int().positive().optional(),
  genre: z.string().optional()
});
