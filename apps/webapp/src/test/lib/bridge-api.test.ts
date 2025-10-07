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

describe('BridgeApiClient', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bridgeApi: any;

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Set up environment variables
    process.env.BRIDGE_CLIENT_ID = 'test-client-id';
    process.env.BRIDGE_CLIENT_SECRET = 'test-client-secret';
    
    // Import the bridgeApi instance
    const bridgeModule = await import('@/lib/bridge-api');
    bridgeApi = bridgeModule.bridgeApi;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.BRIDGE_CLIENT_ID;
    delete process.env.BRIDGE_CLIENT_SECRET;
  });

  describe('API Methods', () => {

  describe('createUser', () => {
    it('should create user without external ID', async () => {
      const mockUser = {
        uuid: 'test-uuid-123',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await bridgeApi.createUser();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/users',
        {},
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockUser);
    });

    it('should create user with external ID', async () => {
      const mockUser = {
        uuid: 'test-uuid-123',
        external_user_id: 'external-123',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await bridgeApi.createUser('external-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/users',
        { external_user_id: 'external-123' },
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle axios errors with proper error details', async () => {
      const axiosError = {
        response: {
          status: 400,
          data: { error: 'Invalid request' },
        },
        message: 'Request failed',
      };

      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(bridgeApi.createUser()).rejects.toThrow('Failed to create Bridge user: Unknown error');
    });

    it('should handle non-axios errors', async () => {
      const genericError = new Error('Network error');
      
      mockedAxios.post.mockRejectedValueOnce(genericError);
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(bridgeApi.createUser()).rejects.toThrow('Failed to create Bridge user: Network error');
    });

    it('should handle unknown errors', async () => {
      mockedAxios.post.mockRejectedValueOnce('string error');
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      await expect(bridgeApi.createUser()).rejects.toThrow('Failed to create Bridge user: Unknown error');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const mockAuthResponse = {
        access_token: 'test-access-token',
        expires_at: '2024-12-31T23:59:59Z',
        user: { uuid: 'test-uuid-123' },
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockAuthResponse,
      });

      const result = await bridgeApi.authenticateUser('test-uuid-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/authorization/token',
        { user_uuid: 'test-uuid-123' },
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle authentication errors', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        message: 'Authentication failed',
      };

      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(bridgeApi.authenticateUser('invalid-uuid')).rejects.toThrow('Failed to authenticate Bridge user: Unknown error');
    });
  });

  describe('createConnectSession', () => {
    it('should create connect session without callback URL', async () => {
      const mockResponse = {
        id: 'session-123',
        url: 'https://connect.bridgeapi.io/session-123',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await bridgeApi.createConnectSession(
        'test-access-token',
        'user@example.com'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/connect-sessions',
        { user_email: 'user@example.com' },
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create connect session with callback URL', async () => {
      const mockResponse = {
        id: 'session-123',
        url: 'https://connect.bridgeapi.io/session-123',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await bridgeApi.createConnectSession(
        'test-access-token',
        'user@example.com',
        'https://app.example.com/callback'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/connect-sessions',
        {
          user_email: 'user@example.com',
          callback_url: 'https://app.example.com/callback',
        },
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle connect session creation errors', async () => {
      const axiosError = {
        response: {
          status: 400,
          data: { error: 'Invalid email' },
        },
        config: {
          headers: { 'Authorization': 'Bearer test-access-token' },
        },
        message: 'Bad request',
      };

      mockedAxios.post.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      await expect(
        bridgeApi.createConnectSession('test-access-token', 'invalid-email')
      ).rejects.toThrow('Failed to create Bridge connect session: Unknown error');
    });
  });

  describe('getItems', () => {
    it('should fetch items successfully', async () => {
      const mockItemsResponse = {
        resources: [
          {
            id: 'item-1',
            name: 'Test Bank',
            status: 'active',
            bank_id: 'bank-123',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockItemsResponse,
      });

      const result = await bridgeApi.getItems('test-access-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/items',
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
          },
        }
      );
      expect(result).toEqual(mockItemsResponse);
    });

    it('should handle items fetch errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(bridgeApi.getItems('test-access-token')).rejects.toThrow('Failed to fetch Bridge items');
    });
  });

  describe('getAccounts', () => {
    it('should fetch all accounts when no itemId provided', async () => {
      const mockAccountsResponse = {
        resources: [
          {
            id: 'account-1',
            name: 'Checking Account',
            balance: 1000.50,
            type: 'checking',
            currency_code: 'EUR',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            provider_id: 'provider-123',
            item_id: 'item-1',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockAccountsResponse,
      });

      const result = await bridgeApi.getAccounts('test-access-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/accounts',
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
          },
        }
      );
      expect(result).toEqual(mockAccountsResponse);
    });

    it('should fetch accounts for specific item when itemId provided', async () => {
      const mockAccountsResponse = {
        resources: [
          {
            id: 'account-1',
            name: 'Checking Account',
            balance: 1000.50,
            type: 'checking',
            currency_code: 'EUR',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            provider_id: 'provider-123',
            item_id: 'item-123',
          },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockAccountsResponse,
      });

      const result = await bridgeApi.getAccounts('test-access-token', 'item-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/aggregation/accounts?item_id=item-123',
        expect.any(Object)
      );
      expect(result).toEqual(mockAccountsResponse);
    });

    it('should handle accounts fetch errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(bridgeApi.getAccounts('test-access-token')).rejects.toThrow('Failed to fetch Bridge accounts');
    });
  });

  describe('testConnection', () => {
    it('should return true when connection test succeeds', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { providers: [] },
      });

      const result = await bridgeApi.testConnection();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.bridgeapi.io/v3/providers',
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      expect(result).toBe(true);
    });

    it('should return false when connection test fails', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        message: 'Unauthorized',
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      const result = await bridgeApi.testConnection();

      expect(result).toBe(false);
    });

    it('should return false when network error occurs', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      mockedAxios.isAxiosError.mockReturnValueOnce(false);

      const result = await bridgeApi.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('Header construction', () => {
    it('should construct base headers correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200, data: [] });

      await bridgeApi.testConnection();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
    });

    it('should construct auth headers correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { resources: [] },
      });

      await bridgeApi.getItems('test-access-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        {
          headers: {
            'Bridge-Version': '2025-01-15',
            'Client-Id': 'test-client-id',
            'Client-Secret': 'test-client-secret',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer test-access-token',
          },
        }
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete user flow', async () => {
      // Mock all API calls for a complete flow
      const mockUser = { uuid: 'test-uuid' };
      const mockAuth = { access_token: 'token', expires_at: '2024-12-31T23:59:59Z', user: mockUser };
      const mockSession = { id: 'session-123', url: 'https://connect.example.com' };
      const mockItems = { resources: [{ id: 'item-1', name: 'Bank', status: 'active', bank_id: 'bank-1', created_at: '2024-01-01', updated_at: '2024-01-01' }] };
      const mockAccounts = { resources: [{ id: 'account-1', name: 'Checking', balance: 1000, type: 'checking', currency_code: 'EUR', status: 'active', created_at: '2024-01-01', updated_at: '2024-01-01', provider_id: 'provider-1', item_id: 'item-1' }] };

      mockedAxios.post
        .mockResolvedValueOnce({ data: mockUser })      // createUser
        .mockResolvedValueOnce({ data: mockAuth })      // authenticateUser
        .mockResolvedValueOnce({ data: mockSession });  // createConnectSession

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockItems })     // getItems
        .mockResolvedValueOnce({ data: mockAccounts }); // getAccounts

      // Execute complete flow
      const user = await bridgeApi.createUser('external-123');
      const auth = await bridgeApi.authenticateUser(user.uuid);
      const session = await bridgeApi.createConnectSession(auth.access_token, 'user@example.com');
      const items = await bridgeApi.getItems(auth.access_token);
      const accounts = await bridgeApi.getAccounts(auth.access_token, items.resources[0]!.id);

      expect(user).toEqual(mockUser);
      expect(auth).toEqual(mockAuth);
      expect(session).toEqual(mockSession);
      expect(items).toEqual(mockItems);
      expect(accounts).toEqual(mockAccounts);
    });

    it('should handle error recovery in user flow', async () => {
      // First call fails, second succeeds
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ data: { uuid: 'test-uuid' } });

      // First attempt should fail
      await expect(bridgeApi.createUser()).rejects.toThrow('Failed to create Bridge user: Temporary failure');

      // Second attempt should succeed
      const result = await bridgeApi.createUser();
      expect(result).toEqual({ uuid: 'test-uuid' });
    });
  });
  });
});