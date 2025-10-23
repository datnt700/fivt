import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name too long'),
  description: z.string().max(1000).optional(),
  icon: z.string().url().optional().or(z.literal('')),
  banner: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().default(false),
});

export const updateGroupSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  icon: z.string().url().optional().or(z.literal('')),
  banner: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().optional(),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
export type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>;
