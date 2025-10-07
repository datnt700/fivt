import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import useScrollingEffect from '@/hooks/use-scroll';

describe('useScrollingEffect', () => {
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Create fresh mocks
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();
    
    // Mock addEventListener and removeEventListener
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return "down" as initial scroll direction', () => {
    const { result } = renderHook(() => useScrollingEffect());
    
    expect(result.current).toBe('down');
  });

  it('should add scroll event listener on mount', () => {
    renderHook(() => useScrollingEffect());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should remove scroll event listener on unmount', () => {
    const { unmount } = renderHook(() => useScrollingEffect());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should detect scroll direction changes', () => {
    let scrollHandler: (() => void) | null = null;
    
    mockAddEventListener.mockImplementation((event: string, handler: () => void) => {
      if (event === 'scroll') {
        scrollHandler = handler;
      }
    });

    Object.defineProperty(window, 'scrollY', { value: 0 });
    
    const { result } = renderHook(() => useScrollingEffect());
    
    expect(result.current).toBe('down');

    // Simulate scrolling down
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100 });
      scrollHandler?.();
    });

    expect(result.current).toBe('down');

    // Simulate scrolling up  
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50 });
      scrollHandler?.();
    });

    expect(result.current).toBe('up');
  });

  it('should handle multiple scroll events correctly', () => {
    let scrollHandler: (() => void) | null = null;
    
    mockAddEventListener.mockImplementation((event: string, handler: () => void) => {
      if (event === 'scroll') {
        scrollHandler = handler;
      }
    });

    Object.defineProperty(window, 'scrollY', { value: 50 });
    
    const { result } = renderHook(() => useScrollingEffect());
    
    // Test multiple scroll positions and expected directions
    const scrollTests = [
      { position: 100, expected: 'down' },
      { position: 75, expected: 'up' },
      { position: 125, expected: 'down' },
      { position: 50, expected: 'up' },
    ];

    scrollTests.forEach(({ position, expected }) => {
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: position });
        scrollHandler?.();
      });

      expect(result.current).toBe(expected);
    });
  });

  it('should handle cleanup correctly', () => {
    let addedHandler: (() => void) | null = null;
    
    mockAddEventListener.mockImplementation((event: string, handler: () => void) => {
      if (event === 'scroll') {
        addedHandler = handler;
      }
    });

    const { unmount } = renderHook(() => useScrollingEffect());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', addedHandler);
  });
});