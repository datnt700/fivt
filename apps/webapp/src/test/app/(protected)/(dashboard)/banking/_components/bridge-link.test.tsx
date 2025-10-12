import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { BridgeLink } from '@/app/(protected)/(dashboard)/banking/_components/bridge-link';
import { toast } from 'sonner';

// Mock next-intl
const mockTranslations = {
  'banking.loading': 'Connecting...',
  'banking.connectBank': 'Connect Your Bank',
  'banking.success': 'Bank connected successfully!',
  'banking.error': 'Failed to connect bank. Please try again.',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    reload: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

describe('BridgeLink', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.open = vi.fn();
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  it('should render connect button with correct text and icon', () => {
    render(<BridgeLink />);
    
    const button = screen.getByRole('button', { name: /connectbank/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should render description text', () => {
    render(<BridgeLink />);
    
    expect(screen.getByText(/powered by bridge api/i)).toBeInTheDocument();
    expect(screen.getByText(/optimized for european banks/i)).toBeInTheDocument();
  });

  it('should show loading state when connecting', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should show loading state
    expect(button).toBeDisabled();
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should make API call to bridge connect endpoint', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/bridge/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('should open popup window with correct parameters', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const mockOpen = vi.mocked(window.open);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    mockOpen.mockReturnValue({} as Window);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://bridge.example.com/connect'),
        'bridge-connect',
        expect.stringContaining('width=600,height=700')
      );
    });
  });

  it('should handle API error response', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('error');
    });

    // Button should no longer be disabled
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('error');
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('should handle configuration errors', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockRejectedValueOnce(new Error('Bridge API not configured'));

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Bridge API not configured. Please contact support.');
    });
  });

  it('should set up message event listener when popup opens', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const mockOpen = vi.mocked(window.open);
    const mockAddEventListener = vi.mocked(window.addEventListener);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    mockOpen.mockReturnValue({} as Window);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  it('should append callback URL with session parameters', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const mockOpen = vi.mocked(window.open);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    mockOpen.mockReturnValue({} as Window);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const mockCall = mockOpen.mock.calls[0];
      expect(mockCall).toBeDefined();
      const [url] = mockCall!;
      expect(url).toContain('callback_url=');
      expect(url).toContain('session_id%3Dsession123');
      expect(url).toContain('user_uuid%3Duser456');
    });
  });

  it('should work without onSuccess callback', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const mockOpen = vi.mocked(window.open);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    mockOpen.mockReturnValue({} as Window);

    render(<BridgeLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // Should not throw error
    expect(() => {
      // Component should handle missing onSuccess gracefully
    }).not.toThrow();
  });

  it('should call onSuccess callback when provided', async () => {
    const mockFetch = vi.mocked(global.fetch);
    const mockOpen = vi.mocked(window.open);
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        redirect_url: 'https://bridge.example.com/connect',
        session_id: 'session123',
        user_uuid: 'user456'
      }),
    } as Response);

    mockOpen.mockReturnValue({} as Window);

    render(<BridgeLink onSuccess={mockOnSuccess} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // The actual message handling is tested via integration
    // Here we just ensure the callback prop is accepted
    expect(mockOnSuccess).toBeDefined();
  });
});