import { describe, it, expect, vi } from 'vitest';
import { redirect } from 'next/navigation';
import RootIndex from '@/app/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('RootIndex (Root Page)', () => {
  it('should redirect to dashboard', async () => {
    await RootIndex();

    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should call redirect function exactly once', async () => {
    vi.clearAllMocks();
    
    await RootIndex();

    expect(redirect).toHaveBeenCalledTimes(1);
  });
});