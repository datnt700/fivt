import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { PowensLink } from '@/app/(protected)/(dashboard)/banking/_components/powens-link';
import { toast } from 'sonner';

// Mock next-intl
const mockTranslations = {
  'banking.providers.powens.title': 'Powens Banking',
  'banking.providers.powens.description': 'Connect to 500+ European banks',
  'banking.connection.connecting': 'Connecting...',
  'banking.connection.connect': 'Connect to Powens',
  'banking.connection.success': 'Bank connected successfully!',
  'banking.connection.error': 'Connection failed: {error}',
  'banking.features.secure_connection': 'Secure 256-bit encryption',
  'banking.features.real_time_data': 'Real-time account data',
  'banking.features.european_banks': '500+ European banks supported',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string, params?: Record<string, string>) => {
    const template = mockTranslations[key as keyof typeof mockTranslations] || key;
    if (params && typeof template === 'string') {
      return template.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    return template;
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock platform utilities
const mockPlatformUtils = {
  isPlatformMobile: vi.fn(() => false),
  getPowensWebviewRecommendations: vi.fn(() => ({
    platform: 'desktop-web',
    recommendation: 'Full-page redirect',
    note: 'Full-page redirect provides best experience for desktop banking flows'
  })),
  openPowensWebview: vi.fn(),
};

vi.mock('@/app/(protected)/(dashboard)/banking/_utils/platform-utils', () => mockPlatformUtils);

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window methods
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener, writable: true });
Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener, writable: true });
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  writable: true,
});

describe('PowensLink', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatformUtils.isPlatformMobile.mockReturnValue(false);
    mockPlatformUtils.getPowensWebviewRecommendations.mockReturnValue({
      platform: 'desktop-web',
      recommendation: 'Full-page redirect',
      note: 'Full-page redirect provides best experience for desktop banking flows'
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render card with correct title and description', () => {
    render(<PowensLink />);
    
    expect(screen.getByText('providers.powens.title')).toBeInTheDocument();
    expect(screen.getByText('providers.powens.description')).toBeInTheDocument();
  });

  it('should render powens logo with correct styling', () => {
    render(<PowensLink />);
    
    const logo = screen.getByText('P');
    const logoContainer = logo.parentElement;
    
    expect(logoContainer).toHaveClass('w-8', 'h-8', 'bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
    expect(logo).toHaveClass('text-white', 'font-bold', 'text-sm');
  });

  it('should render connect button with correct text', () => {
    render(<PowensLink />);
    
    const button = screen.getByRole('button', { name: /connection.connect/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should render feature list', () => {
    render(<PowensLink />);
    
    expect(screen.getByText((content, element) => 
      element?.textContent === '✓ features.secure_connection'
    )).toBeInTheDocument();
    expect(screen.getByText((content, element) => 
      element?.textContent === '✓ features.real_time_data'
    )).toBeInTheDocument();
    expect(screen.getByText((content, element) => 
      element?.textContent === '✓ features.european_banks'
    )).toBeInTheDocument();
  });

  it('should show connecting state when button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should show connecting state immediately
    expect(button).toBeDisabled();
    expect(screen.getByText('connection.connecting')).toBeInTheDocument();
    
    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should get platform information before connecting', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPlatformUtils.isPlatformMobile).toHaveBeenCalled();
      expect(mockPlatformUtils.getPowensWebviewRecommendations).toHaveBeenCalled();
    });
  });

  it('should make API call with platform information', async () => {
    mockPlatformUtils.isPlatformMobile.mockReturnValue(true);
    mockPlatformUtils.getPowensWebviewRecommendations.mockReturnValue({
      platform: 'mobile-web',
      recommendation: 'New tab/window',
      note: 'Opening in new tab to maximize app-to-app support on mobile browsers'
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/powens/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent,
        },
        body: JSON.stringify({
          platform: 'mobile-web',
          isMobile: true,
        }),
      });
    });
  });

  it('should open powens webview with connect URL', async () => {
    const connectUrl = 'https://powens.example.com/connect';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: connectUrl
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPlatformUtils.openPowensWebview).toHaveBeenCalledWith(connectUrl);
    });
  });

  it('should set up message event listener', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  it('should handle successful powens connection message', async () => {
    const successData = { userId: 'user123', accounts: ['acc1', 'acc2'] };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink onSuccess={mockOnSuccess} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    // Simulate successful message
    const messageHandler = mockAddEventListener.mock.calls[0]?.[1];
    expect(messageHandler).toBeDefined();
    const successEvent = {
      origin: 'http://localhost:3000',
      data: { type: 'POWENS_SUCCESS', ...successData }
    };
    
    messageHandler!(successEvent);

    expect(toast.success).toHaveBeenCalledWith('connection.success');
    expect(mockOnSuccess).toHaveBeenCalledWith(successEvent.data);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should handle powens connection error message', async () => {
    const errorMessage = 'Invalid credentials';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    // Simulate error message
    const messageHandler = mockAddEventListener.mock.calls[0]?.[1];
    expect(messageHandler).toBeDefined();
    const errorEvent = {
      origin: 'http://localhost:3000',
      data: { type: 'POWENS_ERROR', error: errorMessage }
    };
    
    messageHandler!(errorEvent);

    expect(toast.error).toHaveBeenCalledWith('connection.error');
    expect(mockOnError).toHaveBeenCalledWith(errorMessage);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should ignore messages from wrong origin', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink onSuccess={mockOnSuccess} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    // Simulate message from wrong origin
    const messageHandler = mockAddEventListener.mock.calls[0]?.[1];
    expect(messageHandler).toBeDefined();
    const wrongOriginEvent = {
      origin: 'https://malicious-site.com',
      data: { type: 'POWENS_SUCCESS', userId: 'user123' }
    };
    
    messageHandler!(wrongOriginEvent);

    // Should not trigger success handlers
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'API key invalid' }),
    });

    render(<PowensLink onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('connection.error');
      expect(mockOnError).toHaveBeenCalledWith('API key invalid');
    });

    // Button should no longer be disabled
    expect(button).not.toBeDisabled();
  });

  it('should handle API error response without error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    render(<PowensLink onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('connection.error');
      expect(mockOnError).toHaveBeenCalledWith('Failed to create Powens connection');
    });
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

    render(<PowensLink onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('connection.error');
      expect(mockOnError).toHaveBeenCalledWith('Network timeout');
    });

    expect(button).not.toBeDisabled();
  });

  it('should handle unknown errors', async () => {
    mockFetch.mockRejectedValueOnce('String error');

    render(<PowensLink onError={mockOnError} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('connection.error');
      expect(mockOnError).toHaveBeenCalledWith('Unknown error occurred');
    });
  });

  it('should work without onSuccess callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    // Simulate successful message
    const messageHandler = mockAddEventListener.mock.calls[0]?.[1];
    expect(messageHandler).toBeDefined();
    const successEvent = {
      origin: 'http://localhost:3000',
      data: { type: 'POWENS_SUCCESS', userId: 'user123' }
    };
    
    messageHandler!(successEvent);

    // Should not throw error and still show success
    expect(toast.success).toHaveBeenCalled();
  });

  it('should work without onError callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'API error' }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      // Should not throw error and still show toast
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should handle mobile platform correctly', async () => {
    mockPlatformUtils.isPlatformMobile.mockReturnValue(true);
    mockPlatformUtils.getPowensWebviewRecommendations.mockReturnValue({
      platform: 'mobile-web',
      recommendation: 'New tab/window',
      note: 'Opening in new tab to maximize app-to-app support on mobile browsers'
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/powens/connect', 
        expect.objectContaining({
          body: JSON.stringify({
            platform: 'mobile-web',
            isMobile: true,
          }),
        })
      );
    });
  });

  it('should log platform information for debugging', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        connect_url: 'https://powens.example.com/connect'
      }),
    });

    render(<PowensLink />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Powens connection - Platform:', expect.any(Object));
    });

    consoleSpy.mockRestore();
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = render(<PowensLink />);
    
    // Component should mount without issues
    expect(screen.getByText('providers.powens.title')).toBeInTheDocument();
    
    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });
});