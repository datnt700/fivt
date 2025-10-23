import { describe, it, expect } from 'vitest';
import {
  createGroupSchema,
  updateGroupSchema,
  type UpdateGroupFormValues,
} from '@/app/(protected)/community/_validations/group-schema';

describe('Group Schema Validation', () => {
  describe('createGroupSchema', () => {
    describe('when all required fields are valid', () => {
      it('should validate successfully with minimum required fields', () => {
        const validData = {
          name: 'Test Group',
          description: 'This is a test group description.',
        };

        const result = createGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate successfully with all optional fields', () => {
        const validData = {
          name: 'Test Group',
          description: 'This is a test group description.',
          icon: 'https://example.com/icon.png',
          banner: 'https://example.com/banner.jpg',
          isPrivate: true,
        };

        const result = createGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('when name is invalid', () => {
      it('should fail when name is too short', () => {
        const invalidData = {
          name: 'AB',
          description: 'This is a test group description.',
        };

        const result = createGroupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('name');
        }
      });

      it('should fail when name is too long', () => {
        const invalidData = {
          name: 'A'.repeat(101),
          description: 'This is a test group description.',
        };

        const result = createGroupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('name');
        }
      });

      it('should fail when name is missing', () => {
        const invalidData = {
          description: 'This is a test group description.',
        };

        const result = createGroupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('when description is invalid', () => {
      it('should fail when description is too long', () => {
        const invalidData = {
          name: 'Test Group',
          description: 'A'.repeat(1001),
        };

        const result = createGroupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('description');
        }
      });
    });

    describe('when isPrivate is provided', () => {
      it('should validate with isPrivate as true', () => {
        const validData = {
          name: 'Private Group',
          description: 'This is a private group.',
          isPrivate: true,
        };

        const result = createGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate with isPrivate as false', () => {
        const validData = {
          name: 'Public Group',
          description: 'This is a public group.',
          isPrivate: false,
        };

        const result = createGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should default isPrivate when not provided', () => {
        const validData = {
          name: 'Test Group',
          description: 'This is a test group.',
        };

        const result = createGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateGroupSchema', () => {
    describe('when updating fields', () => {
      it('should validate partial updates with name only', () => {
        const validData: UpdateGroupFormValues = {
          name: 'Updated Group Name',
        };

        const result = updateGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate partial updates with description only', () => {
        const validData: UpdateGroupFormValues = {
          description: 'Updated group description.',
        };

        const result = updateGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should validate with all fields', () => {
        const validData: UpdateGroupFormValues = {
          name: 'Updated Group',
          description: 'Updated description.',
          icon: 'https://example.com/new-icon.png',
          banner: 'https://example.com/new-banner.jpg',
          isPrivate: false,
        };

        const result = updateGroupSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    describe('when validation fails', () => {
      it('should fail when name is too short', () => {
        const invalidData = {
          name: 'AB',
        };

        const result = updateGroupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('name');
        }
      });

      it('should fail when description is too long', () => {
        const invalidData = {
          description: 'A'.repeat(1001),
        };

        const result = updateGroupSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toContain('description');
        }
      });
    });
  });
});
