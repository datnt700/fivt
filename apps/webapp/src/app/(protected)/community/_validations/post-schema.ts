import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300, 'Title must be less than 300 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export const updatePostSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;
export type UpdatePostFormValues = z.infer<typeof updatePostSchema>;
