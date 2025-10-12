import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock matchMedia
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false for desktop widths initially', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should return true for mobile widths initially', () => {
    Object.defineProperty(window, 'innerWidth', { value: 640 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should use 768px as the mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { value: 767 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false for width at breakpoint (768px)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should set up matchMedia listener with correct query', () => {
    renderHook(() => useIsMobile());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('should add event listener for media query changes', () => {
    const mockAddEventListener = vi.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    renderHook(() => useIsMobile());

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update state when media query changes', () => {
    let changeHandler: (() => void) | null = null;
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 640 });
      if (changeHandler) {
        changeHandler();
      }
    });

    expect(result.current).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    const mockRemoveEventListener = vi.fn();
    let changeHandler: (() => void) | null = null;

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      }),
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    });

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', changeHandler);
  });

  it('should handle multiple resize events correctly', () => {
    let changeHandler: (() => void) | null = null;
    const mockAddEventListener = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    // Start with desktop
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);

    // Resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 480 });
      if (changeHandler) {
        changeHandler();
      }
    });
    expect(result.current).toBe(true);

    // Resize back to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1200 });
      if (changeHandler) {
        changeHandler();
      }
    });
    expect(result.current).toBe(false);

    // Resize to tablet (still not mobile)
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      if (changeHandler) {
        changeHandler();
      }
    });
    expect(result.current).toBe(false);
  });

  it('should return false for initial undefined state due to double negation', () => {
    // This test verifies the !!isMobile logic works correctly
    // The hook returns !!isMobile, so undefined becomes false
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    
    const { result } = renderHook(() => useIsMobile());
    
    // Should return false for desktop width
    expect(result.current).toBe(false);
    expect(typeof result.current).toBe('boolean');
  });

  it('should handle edge case widths around breakpoint', () => {
    const testWidths = [
      { width: 766, expected: true },
      { width: 767, expected: true },
      { width: 768, expected: false },
      { width: 769, expected: false },
    ];

    testWidths.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', { value: width });
      
      const { result, unmount } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(expected);
      
      unmount();
    });
  });
});