import { describe, it, expect } from 'vitest';
import {
  createCommentSchema,
  updateCommentSchema,
  type CreateCommentFormValues,
  type UpdateCommentFormValues,
} from '@/app/(protected)/community/_validations/comment-schema';

describe('Comment Schema Validation', () => {
  describe('createCommentSchema', () => {
    describe('when all required fields are valid', () => {
      it('should validate successfully with postId and content', () => {
        const validData: CreateCommentFormValues = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
          content: 'This is a valid comment with enough characters.',
        };

        const result = createCommentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate successfully with parentId for nested comment', () => {
        const validData: CreateCommentFormValues = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
          content: 'This is a reply to another comment.',
          parentId: '660e8400-e29b-41d4-a716-446655440001',
        };

        const result = createCommentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('when content is invalid', () => {
      it('should fail when content is too short', () => {
        const invalidData = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
          content: '',
        };

        const result = createCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('content');
        }
      });

      it('should fail when content is too long', () => {
        const invalidData = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
          content: 'A'.repeat(10001),
        };

        const result = createCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('content');
        }
      });

      it('should fail when content is missing', () => {
        const invalidData = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
        };

        const result = createCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('when postId is invalid', () => {
      it('should fail when postId is missing', () => {
        const invalidData = {
          content: 'This is a valid comment with enough characters.',
        };

        const result = createCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should fail when postId is empty string', () => {
        const invalidData = {
          postId: '',
          content: 'This is a valid comment with enough characters.',
        };

        const result = createCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should fail when postId is not a valid UUID', () => {
        const invalidData = {
          postId: 'not-a-uuid',
          content: 'This is a valid comment with enough characters.',
        };

        const result = createCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('when parentId is provided', () => {
      it('should validate optional parentId when present', () => {
        const validData = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
          content: 'This is a nested reply.',
          parentId: '660e8400-e29b-41d4-a716-446655440001',
        };

        const result = createCommentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate when parentId is omitted', () => {
        const validData = {
          postId: '550e8400-e29b-41d4-a716-446655440000',
          content: 'This is a top-level comment.',
        };

        const result = createCommentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateCommentSchema', () => {
    describe('when updating content', () => {
      it('should validate with valid content', () => {
        const validData: UpdateCommentFormValues = {
          content: 'Updated comment content with enough characters.',
        };

        const result = updateCommentSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should fail when content is empty', () => {
        const invalidData = {
          content: '',
        };

        const result = updateCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('content');
        }
      });

      it('should fail when content is too long', () => {
        const invalidData = {
          content: 'A'.repeat(10001),
        };

        const result = updateCommentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('content');
        }
      });
    });
  });
});
