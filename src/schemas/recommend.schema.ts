import { z } from 'zod';

export const recommendSchema = z.object({
  family_id: z.number().int().positive().default(1),
  attending_member_ids: z.array(z.number().int().positive()).min(1, 'Select at least one attending family member'),
  genre: z.string().optional(),
  max_duration: z.number().int().positive().optional(),
  streaming_service: z.string().optional(),
  only_unwatched: z.boolean().default(true)
});
