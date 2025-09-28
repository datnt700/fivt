import axios from 'axios';

const BRIDGE_API_BASE = 'https://api.bridgeapi.io/v3';
const BRIDGE_VERSION = '2025-01-15';

interface BridgeUser {
  uuid: string;
  external_user_id?: string;
}

interface BridgeAuthResponse {
  access_token: string;
  expires_at: string;
  user: BridgeUser;
}

interface BridgeConnectSessionResponse {
  id: string;
  url: string;
}

class BridgeApiClient {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
      throw new Error('Bridge API credentials are required');
    }
    this.clientId = process.env.BRIDGE_CLIENT_ID;
    this.clientSecret = process.env.BRIDGE_CLIENT_SECRET;
  }

  private getBaseHeaders() {
    return {
      'Bridge-Version': BRIDGE_VERSION,
      'Client-Id': this.clientId,
      'Client-Secret': this.clientSecret,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private getAuthHeaders(accessToken: string) {
    return {
      ...this.getBaseHeaders(),
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  async createUser(externalUserId?: string): Promise<BridgeUser> {
    try {
      const response = await axios.post(
        `${BRIDGE_API_BASE}/aggregation/users`,
        externalUserId ? { external_user_id: externalUserId } : {},
        {
          headers: this.getBaseHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Bridge user:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw new Error(`Failed to create Bridge user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async authenticateUser(userUuid: string): Promise<BridgeAuthResponse> {
    try {
      const response = await axios.post(
        `${BRIDGE_API_BASE}/aggregation/authorization/token`,
        { user_uuid: userUuid },
        {
          headers: this.getBaseHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error authenticating Bridge user:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw new Error(`Failed to authenticate Bridge user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createConnectSession(
    accessToken: string,
    userEmail: string,
    callbackUrl?: string
  ): Promise<BridgeConnectSessionResponse> {
    try {
      const response = await axios.post(
        `${BRIDGE_API_BASE}/aggregation/connect-sessions`,
        {
          user_email: userEmail,
          ...(callbackUrl && { callback_url: callbackUrl }),
        },
        {
          headers: this.getAuthHeaders(accessToken),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Bridge connect session:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request headers:', error.config?.headers);
      }
      throw new Error(`Failed to create Bridge connect session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getItems(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${BRIDGE_API_BASE}/aggregation/items`,
        {
          headers: this.getAuthHeaders(accessToken),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Bridge items:', error);
      throw new Error('Failed to fetch Bridge items');
    }
  }

  async getAccounts(accessToken: string, itemId?: string): Promise<any> {
    try {
      const url = itemId 
        ? `${BRIDGE_API_BASE}/aggregation/accounts?item_id=${itemId}`
        : `${BRIDGE_API_BASE}/aggregation/accounts`;
      
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(accessToken),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Bridge accounts:', error);
      throw new Error('Failed to fetch Bridge accounts');
    }
  }

  // Health check method to test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${BRIDGE_API_BASE}/providers`,
        {
          headers: this.getBaseHeaders(),
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error('Bridge API connection test failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      return false;
    }
  }
}

export const bridgeApi = new BridgeApiClient();