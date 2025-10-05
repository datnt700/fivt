import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables first
const originalEnv = process.env;

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock next-auth
const mockAuthInstance = {
  handlers: { GET: vi.fn(), POST: vi.fn() },
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
};

const mockNextAuth = vi.fn(() => mockAuthInstance);

// Store callback references for testing
let _capturedConfig: any = null;

vi.mock('next-auth', () => ({
  default: mockNextAuth,
}));

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({ adapter: 'prisma' })),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({ id: 'google', name: 'Google' })),
}));

vi.mock('next-auth/providers/resend', () => ({
  default: vi.fn(() => ({ id: 'resend', name: 'Resend' })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {},
    account: {},
    session: {},
  },
}));

vi.mock('@react-email/render', () => ({
  render: vi.fn(() => Promise.resolve('<html>mocked email</html>')),
}));

vi.mock('react', () => ({
  default: {
    createElement: vi.fn(() => ({ type: 'MockedComponent' })),
  },
  createElement: vi.fn(() => ({ type: 'MockedComponent' })),
}));

vi.mock('@/app/auth/_templates/magic-link-email', () => ({
  default: { name: 'MagicLinkEmailTemplate' },
}));

vi.mock('@/config/routes', () => ({
  COMMON_ROUTES: {
    AUTH: {
      LOGIN: '/auth/login',
      VERIFY_REQUEST: '/auth/verify-request',
    },
    HOME: '/',
  },
}));

describe('Auth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      AUTH_SECRET: 'test-secret',
      RESEND_API_KEY: 'test-resend-key',
      AUTH_RESEND_FROM: 'test@example.com',
      AUTH_GOOGLE_ID: 'test-google-id',
      AUTH_GOOGLE_SECRET: 'test-google-secret',
      NODE_ENV: 'test',
    };

    // Capture configuration when NextAuth is called
    mockNextAuth.mockImplementation((config) => {
      _capturedConfig = config;
      return mockAuthInstance;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('Configuration Setup', () => {
    it('should initialize NextAuth with proper structure', async () => {
      await import('@/auth');

      expect(mockNextAuth).toHaveBeenCalledTimes(1);
      expect(_capturedConfig).toBeDefined();
      expect(_capturedConfig.secret).toBe('test-secret');
      expect(_capturedConfig.debug).toBe(false);
    });

    it('should have correct page configuration', async () => {
      await import('@/auth');

      expect(_capturedConfig.pages).toEqual({
        signIn: '/auth/login',
        error: '/auth/login',
        verifyRequest: '/auth/verify-request',
      });
    });

    it('should have redirect callback', async () => {
      await import('@/auth');

      expect(_capturedConfig.callbacks.redirect).toBeTypeOf('function');
    });

    it('should have session callback', async () => {
      await import('@/auth');

      expect(_capturedConfig.callbacks.session).toBeTypeOf('function');
    });

    it('should enable debug mode in development', async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      
      await import('@/auth');

      expect(_capturedConfig.debug).toBe(true);
    });
  });

  describe('Auth Callbacks', () => {
    beforeEach(async () => {
      await import('@/auth');
    });

    describe('redirect callback', () => {
      it('should handle relative URLs', async () => {
        const result = await _capturedConfig.callbacks.redirect({
          url: '/dashboard',
          baseUrl: 'https://example.com',
        });

        expect(result).toBe('https://example.com/dashboard');
      });

      it('should handle same origin URLs', async () => {
        const result = await _capturedConfig.callbacks.redirect({
          url: 'https://example.com/dashboard',
          baseUrl: 'https://example.com',
        });

        expect(result).toBe('https://example.com/dashboard');
      });

      it('should redirect to home for external URLs', async () => {
        const result = await _capturedConfig.callbacks.redirect({
          url: 'https://malicious.com/evil',
          baseUrl: 'https://example.com',
        });

        expect(result).toBe('https://example.com/');
      });

      it('should treat protocol-relative URLs as relative paths', async () => {
        const result = await _capturedConfig.callbacks.redirect({
          url: '//malicious.com/evil',
          baseUrl: 'https://example.com',
        });

        // The current implementation treats URLs starting with "/" as relative
        expect(result).toBe('https://example.com//malicious.com/evil');
      });
    });

    describe('session callback', () => {
      it('should add user ID to session when user is valid', async () => {
        const mockSession = {
          user: { email: 'test@example.com' },
          expires: '2024-01-01',
        };

        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
        };

        const result = await _capturedConfig.callbacks.session({
          session: mockSession,
          user: mockUser,
        });

        expect(result).toEqual({
          user: { 
            email: 'test@example.com',
            id: 'user-123'
          },
          expires: '2024-01-01',
        });
      });

      it('should return session unchanged when user has no email', async () => {
        const mockSession = {
          user: { name: 'Test User' },
          expires: '2024-01-01',
        };

        const mockUser = {
          id: 'user-123',
          name: 'Test User',
        };

        const result = await _capturedConfig.callbacks.session({
          session: mockSession,
          user: mockUser,
        });

        expect(result).toEqual(mockSession);
      });

      it('should return session unchanged when user has no ID', async () => {
        const mockSession = {
          user: { email: 'test@example.com' },
          expires: '2024-01-01',
        };

        const mockUser = {
          email: 'test@example.com',
        };

        const result = await _capturedConfig.callbacks.session({
          session: mockSession,
          user: mockUser,
        });

        expect(result).toEqual(mockSession);
      });

      it('should return session unchanged when session has no user', async () => {
        const mockSession = {
          expires: '2024-01-01',
        };

        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
        };

        const result = await _capturedConfig.callbacks.session({
          session: mockSession,
          user: mockUser,
        });

        expect(result).toEqual(mockSession);
      });
    });
  });

  describe('Exported Functions', () => {
    it('should export all required auth functions', async () => {
      const { handlers, auth, signIn, signOut } = await import('@/auth');

      expect(handlers).toBe(mockAuthInstance.handlers);
      expect(auth).toBe(mockAuthInstance.auth);
      expect(signIn).toBe(mockAuthInstance.signIn);
      expect(signOut).toBe(mockAuthInstance.signOut);
    });
  });
});