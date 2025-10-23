import { describe, it, expect } from 'vitest';
import {
  createPostSchema,
  updatePostSchema,
  type UpdatePostFormValues,
} from '@/app/(protected)/community/_validations/post-schema';

describe('Post Schema Validation', () => {
  describe('createPostSchema', () => {
    describe('when all required fields are valid', () => {
      it('should validate successfully with minimum required fields', () => {
        const validData = {
          title: 'Test Post Title',
          content: 'This is a test post content with enough characters.',
        };

        const result = createPostSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate successfully with all optional fields', () => {
        const validData = {
          title: 'Test Post Title',
          content: 'This is a test post content with enough characters.',
          excerpt: 'Short excerpt',
          coverImage: 'https://example.com/image.jpg',
          groupId: '550e8400-e29b-41d4-a716-446655440000',
          tags: ['tech', 'finance'],
          status: 'PUBLISHED' as const,
        };

        const result = createPostSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('when title is invalid', () => {
      it('should fail when title is too short', () => {
        const invalidData = {
          title: 'Ab',
          content: 'This is a test post content with enough characters.',
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('title');
        }
      });

      it('should fail when title is too long', () => {
        const invalidData = {
          title: 'A'.repeat(301),
          content: 'This is a test post content with enough characters.',
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('title');
        }
      });

      it('should fail when title is missing', () => {
        const invalidData = {
          content: 'This is a test post content with enough characters.',
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('when content is invalid', () => {
      it('should fail when content is too short', () => {
        const invalidData = {
          title: 'Test Post Title',
          content: 'Short',
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('content');
        }
      });

      it('should fail when content is missing', () => {
        const invalidData = {
          title: 'Test Post Title',
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('when tags are invalid', () => {
      it('should fail when more than 10 tags are provided', () => {
        const invalidData = {
          title: 'Test Post Title',
          content: 'This is a test post content with enough characters.',
          tags: Array(11).fill('tag'),
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('tags');
        }
      });

      it('should succeed with exactly 10 tags', () => {
        const validData = {
          title: 'Test Post Title',
          content: 'This is a test post content with enough characters.',
          tags: Array(10).fill('tag'),
        };

        const result = createPostSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('when status is invalid', () => {
      it('should fail with invalid status value', () => {
        const invalidData = {
          title: 'Test Post Title',
          content: 'This is a test post content with enough characters.',
          status: 'INVALID_STATUS',
        };

        const result = createPostSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should succeed with valid status values', () => {
        const statuses = ['DRAFT', 'PUBLISHED'];

        statuses.forEach(status => {
          const validData = {
            title: 'Test Post Title',
            content: 'This is a test post content with enough characters.',
            status,
          };

          const result = createPostSchema.safeParse(validData);
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('updatePostSchema', () => {
    it('should validate when all fields are optional', () => {
      const validData: UpdatePostFormValues = {};

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial updates', () => {
      const validData: UpdatePostFormValues = {
        title: 'Updated Title',
      };

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with all fields', () => {
      const validData: UpdatePostFormValues = {
        title: 'Updated Title',
        content: 'Updated content with enough characters.',
        excerpt: 'Updated excerpt',
        coverImage: 'https://example.com/new-image.jpg',
        status: 'PUBLISHED',
        isPinned: true,
        isLocked: false,
      };

      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when title is too short', () => {
      const invalidData = {
        title: 'Ab',
      };

      const result = updatePostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when content is too short', () => {
      const invalidData = {
        content: 'Short',
      };

      const result = updatePostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
