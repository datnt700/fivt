# Powens Banking Integration - CORRECTED

This integration now correctly uses the Powens API as documented at https://docs.powens.com/documentation/.

## ✅ Current Status

- **API Client**: Updated to use correct Powens endpoints (`/auth/init`, `/auth/token/code`)
- **API Base URL**: Fixed to use `https://your-domain-sandbox.biapi.pro/2.0`
- **Authentication**: Uses proper Powens OAuth flow
- **Webview Integration**: Uses `https://webview.powens.com/connect`

## 🔧 Setup Instructions

### 1. Create Powens Account
1. Visit https://console.budget-insight.com/auth/register
2. Create an account and organization
3. Create a domain (will be suffixed with `-sandbox.biapi.pro`)

### 2. Configure Client Application
1. In the console, create a client application
2. Note your Client ID and Client Secret
3. Add redirect URL: `https://localhost:3000/api/powens/callback`

### 3. Configure Environment
Update your `.env.local`:
```bash
POWENS_CLIENT_ID="your_actual_client_id"
POWENS_CLIENT_SECRET="your_actual_client_secret"
POWENS_API_BASE="https://your-domain-sandbox.biapi.pro/2.0"
POWENS_CALLBACK_URL="https://localhost:3000/api/powens/callback"
```

Replace `your-domain` with your actual domain from the Powens console.

### 4. Test Integration
1. Navigate to `/banking/powens`
2. Click "Connect to Powens"
3. You should see the Powens webview for bank connection

## 🚀 How It Works

### Authentication Flow
1. **Create User**: Call `/auth/init` with client credentials → get access token
2. **Get Temporary Code**: Call `/auth/token/code` with access token → get temporary code
3. **Open Webview**: Redirect to `https://webview.powens.com/connect` with temporary code
4. **Handle Callback**: Receive `connection_id` parameter after successful connection

### API Endpoints Used
- `POST /auth/init` - Create user and get access token
- `GET /auth/token/code` - Get temporary code for webview
- Webview: `https://webview.powens.com/connect` - Bank connection interface

## 🐛 Previous Issues Fixed

### ❌ Before (Incorrect):
- Used non-existent domain `sync.powens.com`
- Wrong API endpoints (`/users`, `/oauth/token`)
- Incorrect authentication flow

### ✅ After (Correct):
- Using proper domain format: `your-domain-sandbox.biapi.pro`
- Correct API endpoints from official documentation
- Proper Powens OAuth flow with webview integration

## 📝 Next Steps

1. **Get real Powens credentials** from console.budget-insight.com
2. **Update environment variables** with your domain and credentials
3. **Test the connection flow** at `/banking/powens`
4. **Implement account data fetching** after successful connection

## 🔗 Resources

- **Documentation**: https://docs.powens.com/documentation/
- **Console**: https://console.budget-insight.com/
- **API Reference**: https://docs.powens.com/api-reference/