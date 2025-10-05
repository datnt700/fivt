import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('port configuration', () => {
    it('should use default port 3000 when PORT env var not set', async () => {
      vi.stubEnv('PORT', undefined);
      
      const { port } = await import('@/config');
      expect(port).toBe(3000);
    });

    it('should use PORT env var when provided', async () => {
      vi.stubEnv('PORT', '8080');
      
      const { port } = await import('@/config');
      expect(port).toBe('8080');
    });
  });

  describe('host configuration', () => {
    it('should use localhost when VERCEL_PROJECT_PRODUCTION_URL not set', async () => {
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined);
      vi.stubEnv('PORT', undefined);
      
      const { host } = await import('@/config');
      expect(host).toBe('http://localhost:3000');
    });

    it('should use localhost with custom port', async () => {
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined);
      vi.stubEnv('PORT', '4000');
      
      const { host } = await import('@/config');
      expect(host).toBe('http://localhost:4000');
    });

    it('should use HTTPS with Vercel production URL', async () => {
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'my-app.vercel.app');
      
      const { host } = await import('@/config');
      expect(host).toBe('https://my-app.vercel.app');
    });

    it('should handle Vercel URL with subdomain', async () => {
      vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'feature-branch-my-app.vercel.app');
      
      const { host } = await import('@/config');
      expect(host).toBe('https://feature-branch-my-app.vercel.app');
    });
  });
});