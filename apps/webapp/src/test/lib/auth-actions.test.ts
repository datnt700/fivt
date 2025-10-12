import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithGoogle } from '@/lib/auth-actions';
import { signIn } from '@/auth';

// Mock the auth module
vi.mock('@/auth', () => ({
  signIn: vi.fn(),
}));

const mockSignIn = vi.mocked(signIn);

describe('Auth Actions', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should call signIn with google provider and redirect to home', async () => {
      // Arrange
      mockSignIn.mockResolvedValue(undefined);

      // Act
      await signInWithGoogle();

      // Assert
      expect(mockSignIn).toHaveBeenCalledWith('google', {
        redirectTo: '/'
      });
    });

    it('should propagate errors from signIn', async () => {
      // Arrange
      const error = new Error('Authentication failed');
      mockSignIn.mockRejectedValue(error);

      // Act & Assert
      await expect(signInWithGoogle()).rejects.toThrow('Authentication failed');
    });
  });
});