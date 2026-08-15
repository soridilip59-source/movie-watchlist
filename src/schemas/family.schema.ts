import { z } from 'zod';

export const createFamilySchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters')
});

export const createMemberSchema = z.object({
  family_id: z.number().int().positive(),
  name: z.string().min(2, 'Member name must be at least 2 characters'),
  role: z.enum(['Parent', 'Teen', 'Kid', 'Other']),
  age: z.number().int().min(0, 'Age must be non-negative'),
  max_rating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  avatar_emoji: z.string().optional().default('👤')
});

export const updateMemberSchema = createMemberSchema.partial().omit({ family_id: true });
