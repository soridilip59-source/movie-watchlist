import { z } from 'zod';

export const createRatingSchema = z.object({
  movie_id: z.number().int().positive(),
  member_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().optional()
});
