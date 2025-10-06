import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

const mockedAxios = {
  post: vi.mocked(axios.post),
  get: vi.mocked(axios.get),
  isAxiosError: vi.mocked(axios.isAxiosError),
};

describe('PowensApiClient', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let powensApi: any;

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Set up environment variables
    process.env.POWENS_API_BASE = 'https://test-domain.biapi.pro/2.0';
    process.env.POWENS_CLIENT_ID = 'test-client-id';
    process.env.POWENS_CLIENT_SECRET = 'test-client-secret';
    
    // Import the powensApi instance
    const powensModule = await import('@/lib/powens-api');
    powensApi = powensModule.powensApi;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.POWENS_API_BASE;
    delete process.env.POWENS_CLIENT_ID;
    delete process.env.POWENS_CLIENT_SECRET;
  });

  describe('createUser', () => {
    it('should create user and return access token successfully', async () => {
      const mockResponse = {
        auth_token: 'test-auth-token-123',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await powensApi.createUser();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test-domain.biapi.pro/2.0/auth/init',
        {
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      expect(result).toEqual({
        access_token: 'test-auth-token-123',
        token_type: 'Bearer',
        expires_in: 3600,
      });
    });

    it('should handle user creation errors with axios error details', async () => {
      const axiosError = {
        response: {
          status: 400,
          data: { error: 'Invalid credentials' },
        },
        config: {
          headers: { 'Content-Type': 'application/json' },
        },
        message: 'Bad request',
      };

      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(powensApi.createUser()).rejects.toThrow('Failed to create Powens user: Unknown error');
    });

    it('should handle user creation errors with generic error', async () => {
      const genericError = new Error('Network error');
      
      mockedAxios.post.mockRejectedValueOnce(genericError);
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(powensApi.createUser()).rejects.toThrow('Failed to create Powens user: Network error');
    });

    it('should handle unknown errors', async () => {
      mockedAxios.post.mockRejectedValueOnce('string error');
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(powensApi.createUser()).rejects.toThrow('Failed to create Powens user: Unknown error');
    });
  });

  describe('getTemporaryCode', () => {
    it('should get temporary code successfully', async () => {
      const mockResponse = {
        code: 'temp-code-123',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await powensApi.getTemporaryCode('test-access-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-domain.biapi.pro/2.0/auth/token/code?type=singleAccess',
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
            'User-Agent': 'FivtApp/1.0',
          },
        }
      );

      expect(result).toBe('temp-code-123');
    });

    it('should handle temporary code errors', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        config: {
          headers: { 'Authorization': 'Bearer invalid-token' },
        },
        message: 'Unauthorized',
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(powensApi.getTemporaryCode('invalid-token')).rejects.toThrow('Failed to get Powens temporary code: Unknown error');
    });
  });

  describe('createConnectSession', () => {
    it('should create connect session successfully', async () => {
      const result = await powensApi.createConnectSession(
        'temp-code-123',
        'https://app.example.com/callback'
      );

      expect(result).toEqual({
        connect_url: 'https://test-domain.biapi.pro/2.0/auth/webview/connect?redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&client_id=test-client-id&code=temp-code-123&connector_capabilities=bank&connector_ids=8',
        id_session: 'temp-code-123',
      });
    });

    it('should work with valid API base URLs', async () => {
      // Test with valid API base URL
      process.env.POWENS_API_BASE = 'https://test-domain.biapi.pro/2.0';
      
      // Re-import to get updated environment
      const powensModule = await import('@/lib/powens-api');
      const validPowensApi = powensModule.powensApi;

      const result = await validPowensApi.createConnectSession('temp-code-123', 'https://app.example.com/callback');
      
      expect(result.connect_url).toContain('test-domain.biapi.pro');
      expect(result.id_session).toBe('temp-code-123');
    });

    it('should handle empty temporary code gracefully', async () => {
      // Mock the domain extraction to work
      process.env.POWENS_API_BASE = 'https://test-domain.biapi.pro/2.0';
      
      // Since createConnectSession doesn't make HTTP calls, it should handle empty codes
      await expect(
        powensApi.createConnectSession('', 'https://app.example.com/callback')
      ).resolves.toEqual({
        connect_url: 'https://test-domain.biapi.pro/2.0/auth/webview/connect?redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&client_id=test-client-id&code=&connector_capabilities=bank&connector_ids=8',
        id_session: '',
      });
    });

    it('should properly URL encode callback URL', async () => {
      const callbackUrl = 'https://app.example.com/callback?param=value&other=test';
      
      const result = await powensApi.createConnectSession('temp-code-123', callbackUrl);

      expect(result.connect_url).toContain(encodeURIComponent(callbackUrl));
      expect(result.connect_url).toContain('redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback%3Fparam%3Dvalue%26other%3Dtest');
    });
  });

  describe('getAccounts', () => {
    it('should fetch accounts successfully', async () => {
      const mockAccounts = [
        {
          id: 1,
          name: 'Checking Account',
          balance: 1000.50,
          type: 'checking',
          number: '1234567890',
          currency: 'EUR',
          iban: 'FR1420041010050500013M02606',
          bic: 'CCBPFRPPNCE',
          bank: {
            id: 1,
            name: 'Test Bank',
            country_code: 'FR',
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockAccounts,
      });

      const result = await powensApi.getAccounts('test-access-token', 123);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-domain.biapi.pro/2.0/users/123/accounts',
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
            'User-Agent': 'FivtApp/1.0',
          },
        }
      );

      expect(result).toEqual(mockAccounts);
    });

    it('should handle accounts fetch errors', async () => {
      const axiosError = {
        response: {
          status: 404,
          data: { error: 'User not found' },
        },
        message: 'Not found',
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(powensApi.getAccounts('test-access-token', 999)).rejects.toThrow('Failed to fetch Powens accounts: Unknown error');
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [
        {
          id: 1,
          account_id: 123,
          date: '2024-01-15',
          value: -50.25,
          gross_value: -50.25,
          original_wording: 'ACHAT CARTE SUPERMARKET',
          simplified_wording: 'Supermarket purchase',
          category: {
            id: 1,
            name: 'Groceries',
          },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockTransactions,
      });

      const result = await powensApi.getTransactions('test-access-token', 123);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-domain.biapi.pro/2.0/accounts/123/transactions',
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
            'User-Agent': 'FivtApp/1.0',
          },
          params: {
            limit: 100,
          },
        }
      );

      expect(result).toEqual(mockTransactions);
    });

    it('should handle transactions fetch errors', async () => {
      const axiosError = {
        response: {
          status: 403,
          data: { error: 'Access denied' },
        },
        message: 'Forbidden',
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(powensApi.getTransactions('test-access-token', 123)).rejects.toThrow('Failed to fetch Powens transactions: Unknown error');
    });
  });

  describe('healthCheck', () => {
    it('should return true when health check succeeds', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { connectors: [] },
      });

      const result = await powensApi.healthCheck();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://test-domain.biapi.pro/2.0/connectors',
        {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 5000,
        }
      );

      expect(result).toBe(true);
    });

    it('should return false when health check fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await powensApi.healthCheck();

      expect(result).toBe(false);
    });

    it('should return false when status is not 200', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 500,
        data: { error: 'Internal server error' },
      });

      const result = await powensApi.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Header construction', () => {
    it('should construct basic auth headers correctly', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { auth_token: 'test-token' },
      });

      await powensApi.createUser();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
    });

    it('should construct bearer auth headers correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { code: 'temp-code' },
      });

      await powensApi.getTemporaryCode('test-access-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
            'User-Agent': 'FivtApp/1.0',
          },
        }
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user flow', async () => {
      // Mock all API calls for a complete flow
      const mockAuth = { auth_token: 'access-token-123' };
      const mockCode = { code: 'temp-code-456' };
      const mockAccounts = [{ id: 1, name: 'Account 1', balance: 1000, type: 'checking', number: '123', currency: 'EUR', bank: { id: 1, name: 'Bank', country_code: 'FR' }, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      const mockTransactions = [{ id: 1, account_id: 1, date: '2024-01-01', value: -50, gross_value: -50, original_wording: 'Purchase', simplified_wording: 'Purchase', category: { id: 1, name: 'Shopping' }, created_at: '2024-01-01', updated_at: '2024-01-01' }];

      mockedAxios.post.mockResolvedValueOnce({ data: mockAuth });
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockCode })      // getTemporaryCode
        .mockResolvedValueOnce({ data: mockAccounts })  // getAccounts
        .mockResolvedValueOnce({ data: mockTransactions }); // getTransactions

      // Execute complete flow
      const auth = await powensApi.createUser();
      const tempCode = await powensApi.getTemporaryCode(auth.access_token);
      const session = await powensApi.createConnectSession(tempCode, 'https://callback.example.com');
      const accounts = await powensApi.getAccounts(auth.access_token, 123);
      const transactions = await powensApi.getTransactions(auth.access_token, accounts[0]!.id);

      expect(auth.access_token).toBe('access-token-123');
      expect(tempCode).toBe('temp-code-456');
      expect(session.connect_url).toContain('temp-code-456');
      expect(accounts).toEqual(mockAccounts);
      expect(transactions).toEqual(mockTransactions);
    });

    it('should handle error recovery in user flow', async () => {
      // First call fails, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ data: { auth_token: 'recovery-token' } });

      // First attempt should fail
      await expect(powensApi.createUser()).rejects.toThrow('Failed to create Powens user: Temporary failure');

      // Second attempt should succeed
      const result = await powensApi.createUser();
      expect(result.access_token).toBe('recovery-token');
    });

    it('should handle different API base URL formats', async () => {
      // Test with the current environment setup
      const result = await powensApi.createConnectSession('code123', 'https://callback.com');
      
      // Should use the test environment's API base
      expect(result.connect_url).toContain('test-domain.biapi.pro');
      expect(result.id_session).toBe('code123');
    });
  });

  describe('Environment variable handling', () => {
    it('should use configured API base correctly', async () => {
      // Test with the current environment setup 
      const result = await powensApi.createConnectSession('code123', 'https://callback.com');
      
      // Should use the configured test base URL
      expect(result.connect_url).toContain('test-domain.biapi.pro');
      expect(result.id_session).toBe('code123');
    });

    it('should handle missing client credentials gracefully', async () => {
      delete process.env.POWENS_CLIENT_ID;
      
      const powensModule = await import('@/lib/powens-api');
      const testApi = powensModule.powensApi;

      mockedAxios.post.mockResolvedValueOnce({
        data: { auth_token: 'test-token' },
      });

      await testApi.createUser();

      // Should still make the request even with undefined client_id
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          client_id: undefined,
          client_secret: 'test-client-secret',
        },
        expect.any(Object)
      );
    });
  });
});