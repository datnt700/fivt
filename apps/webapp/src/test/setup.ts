import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test environment setup
// Environment is automatically set by Vitest

// Mock next/server for next-auth compatibility
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {}
  },
  NextResponse: class MockNextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
    }
    
    static json(data: unknown, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      });
    }
    
    static redirect(url: string) {
      return new Response(null, {
        status: 302,
        headers: { location: url },
      });
    }
  },
}))

// Mock next-auth for API routes
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(() => Promise.resolve(null)),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}))

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
  })),
}))

vi.mock('next-auth/providers/resend', () => ({
  default: vi.fn(() => ({
    id: 'resend',
    name: 'Resend',
    type: 'email',
  })),
}))