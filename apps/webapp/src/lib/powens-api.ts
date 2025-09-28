import axios from 'axios';

// Powens API configuration - Based on https://docs.powens.com/documentation/
const POWENS_API_BASE = process.env.POWENS_API_BASE || 'https://your-domain-sandbox.biapi.pro/2.0';

// Powens API interfaces based on their documentation
export interface PowensUser {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PowensAccount {
  id: number;
  name: string;
  balance: number;
  type: string;
  number: string;
  currency: string;
  iban?: string;
  bic?: string;
  bank: {
    id: number;
    name: string;
    country_code: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PowensTransaction {
  id: number;
  account_id: number;
  date: string;
  value: number;
  gross_value: number;
  original_wording: string;
  simplified_wording: string;
  category: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PowensConnectSession {
  connect_url: string;
  id_session: string;
}

export interface PowensAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class PowensApiClient {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${process.env.POWENS_CLIENT_ID}:${process.env.POWENS_CLIENT_SECRET}`).toString('base64')}`,
      'User-Agent': 'FivtApp/1.0',
    };
  }

  private getAuthHeaders(accessToken: string) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'FivtApp/1.0',
    };
  }

  async createUser(): Promise<PowensAuthResponse> {
    try {
      console.log('Creating Powens user and getting access token');
      
      const response = await axios.post(
        `${POWENS_API_BASE}/auth/init`,
        {
          client_id: process.env.POWENS_CLIENT_ID,
          client_secret: process.env.POWENS_CLIENT_SECRET,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      console.log('Powens user created successfully with access token');
      return {
        access_token: response.data.auth_token,
        token_type: 'Bearer',
        expires_in: 3600, // Default expiration
      };
    } catch (error) {
      console.error('Error creating Powens user:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request headers:', error.config?.headers);
      }
      throw new Error(`Failed to create Powens user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTemporaryCode(accessToken: string): Promise<string> {
    try {
      console.log('Getting Powens temporary code for webview');
      
      const response = await axios.get(
        `${POWENS_API_BASE}/auth/token/code`,
        {
          headers: this.getAuthHeaders(accessToken),
        }
      );
      
      console.log('Powens temporary code obtained successfully');
      return response.data.code;
    } catch (error) {
      console.error('Error getting Powens temporary code:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request headers:', error.config?.headers);
      }
      throw new Error(`Failed to get Powens temporary code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createConnectSession(
    temporaryCode: string,
    callbackUrl: string
  ): Promise<PowensConnectSession> {
    try {
      console.log('Creating Powens webview connect URL');
      console.log('Using callback URL:', callbackUrl);
      
      // Extract domain from API base URL
      const domain = POWENS_API_BASE.match(/https:\/\/(.+)\.biapi\.pro/)?.[1] || 'your-domain-sandbox';
      
      const connectUrl = `https://webview.powens.com/connect?domain=${domain}&client_id=${process.env.POWENS_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&code=${temporaryCode}`;
      
      console.log('Powens connect session created successfully');
      return {
        connect_url: connectUrl,
        id_session: temporaryCode, // Use temporary code as session ID
      };
    } catch (error) {
      console.error('Error creating Powens connect session:', error);
      throw new Error(`Failed to create Powens connect session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAccounts(accessToken: string, userId: number): Promise<PowensAccount[]> {
    try {
      console.log('Fetching Powens accounts for user:', userId);
      
      const response = await axios.get(
        `${POWENS_API_BASE}/users/${userId}/accounts`,
        {
          headers: this.getAuthHeaders(accessToken),
        }
      );
      
      console.log('Powens accounts fetched successfully:', response.data.length, 'accounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching Powens accounts:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw new Error(`Failed to fetch Powens accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTransactions(accessToken: string, accountId: number): Promise<PowensTransaction[]> {
    try {
      console.log('Fetching Powens transactions for account:', accountId);
      
      const response = await axios.get(
        `${POWENS_API_BASE}/accounts/${accountId}/transactions`,
        {
          headers: this.getAuthHeaders(accessToken),
          params: {
            limit: 100, // Get last 100 transactions
          },
        }
      );
      
      console.log('Powens transactions fetched successfully:', response.data.length, 'transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching Powens transactions:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw new Error(`Failed to fetch Powens transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${POWENS_API_BASE}/connectors`, {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Powens API health check failed:', error);
      return false;
    }
  }
}

export const powensApi = new PowensApiClient();