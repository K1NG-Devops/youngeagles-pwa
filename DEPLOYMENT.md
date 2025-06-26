# Deployment Configuration Documentation

## Overview
This document outlines the environment configuration and required secrets for deploying the Young Eagles PWA to various environments including Vercel and GitHub Actions.

## Environment Variables

### Core API Configuration
These are the essential environment variables required for the application to function:

#### `VITE_API_BASE_URL` (Required)
- **Description**: The base URL for the production API server
- **Format**: `https://domain.com` (NO trailing slash or `/api` suffix)
- **Example**: `https://youngeagles-api-server.up.railway.app`
- **Usage**: Used when `VITE_FORCE_LOCAL_API=false` or in production

#### `VITE_API_LOCAL_URL` (Required for Development)
- **Description**: The base URL for the local development API server
- **Format**: `http://localhost:PORT` (NO trailing slash or `/api` suffix)
- **Example**: `http://localhost:3001`
- **Usage**: Used when `VITE_FORCE_LOCAL_API=true` or when running locally

#### `VITE_API_WS_URL` (Required)
- **Description**: The WebSocket URL for real-time communication
- **Format**: `wss://domain.com` for production, `ws://localhost:PORT` for local
- **Example**: `wss://youngeagles-api-server.up.railway.app`
- **Usage**: Used for Socket.IO connections

#### `VITE_FORCE_LOCAL_API` (Optional)
- **Description**: Forces the app to use local API even in production
- **Values**: `'true'` | `'false'`
- **Default**: `'false'`
- **Usage**: Useful for admin testing or debugging production builds locally

### Feature Flags
Optional environment variables that control application features:

#### `VITE_ENABLE_PUSH_NOTIFICATIONS`
- **Default**: `'true'`
- **Description**: Enables push notification functionality

#### `VITE_ENABLE_OFFLINE_MODE`
- **Default**: `'true'`
- **Description**: Enables PWA offline capabilities

#### `VITE_ENABLE_ANALYTICS`
- **Default**: `'false'`
- **Description**: Enables analytics tracking

#### `VITE_DEBUG_MODE`
- **Default**: `'false'`
- **Description**: Enables verbose logging and debugging features

### Website URLs
#### `VITE_MAIN_WEBSITE_URL`
- **Description**: Production website URL
- **Example**: `https://youngeagles.org.za`

#### `VITE_MAIN_WEBSITE_DEV_URL`
- **Description**: Development website URL
- **Example**: `http://localhost:5173`

## API Configuration Logic

The `API_CONFIG.getApiUrl()` function uses the following logic:

```javascript
// Priority order for determining API URL:
1. If VITE_FORCE_LOCAL_API === 'true' → Use LOCAL_URL
2. If import.meta.env.DEV === true → Use LOCAL_URL  
3. If window.location.hostname === 'localhost' → Use LOCAL_URL
4. Otherwise → Use BASE_URL (production)

// URL Sanitization:
- Removes trailing '/api' if present
- Removes trailing '/' if present
```

## Vercel Deployment Configuration

### Environment Variables in Vercel Dashboard
Set these environment variables in your Vercel project dashboard:

```bash
# Core API Configuration
vite_api_base_url = "https://youngeagles-api-server.up.railway.app"
vite_api_local_url = "http://localhost:3001"
vite_api_ws_url = "wss://youngeagles-api-server.up.railway.app"
vite_force_local_api = "false"

# Feature Flags
vite_enable_push_notifications = "true"
vite_enable_offline_mode = "true"
vite_enable_analytics = "false"
vite_debug_mode = "false"

# Website URLs
vite_main_website_url = "https://youngeagles.org.za"
vite_main_website_dev_url = "http://localhost:5173"
```

### Vercel.json Configuration
The `vercel.json` file maps these to environment variables using the `@` prefix:

```json
{
  "env": {
    "VITE_API_BASE_URL": "@vite_api_base_url",
    "VITE_API_WS_URL": "@vite_api_ws_url",
    // ... other mappings
  }
}
```

## GitHub Actions Configuration

### Required Repository Secrets
Set these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### Vercel Integration Secrets
```bash
VERCEL_TOKEN = "your_vercel_token"
VERCEL_ORG_ID = "your_vercel_org_id"  
VERCEL_PROJECT_ID = "your_vercel_project_id"
```

#### Application Environment Secrets
```bash
# Core API (Required)
VITE_API_BASE_URL = "https://youngeagles-api-server.up.railway.app"
VITE_API_LOCAL_URL = "http://localhost:3001"
VITE_API_WS_URL = "wss://youngeagles-api-server.up.railway.app"

# Feature Flags (Optional - defaults applied if not set)
VITE_FORCE_LOCAL_API = "false"
VITE_ENABLE_PUSH_NOTIFICATIONS = "true"
VITE_ENABLE_OFFLINE_MODE = "true"
VITE_ENABLE_ANALYTICS = "false"
VITE_DEBUG_MODE = "false"

# Website URLs (Required)
VITE_MAIN_WEBSITE_URL = "https://youngeagles.org.za"
VITE_MAIN_WEBSITE_DEV_URL = "http://localhost:5173"
```

## Testing Environment Switching

### Local Development Testing
```bash
# Test local API (default in dev)
npm run dev

# Test production API locally
VITE_FORCE_LOCAL_API=false npm run dev

# Test with forced local API
VITE_FORCE_LOCAL_API=true npm run build && npm run preview
```

### Production Testing
```bash
# Build with production settings
npm run build:prod

# Verify environment detection
# Check browser console for logs:
# "🔧 Using SANITIZED PRODUCTION API: https://..."
# "🔌 Using PRODUCTION WebSocket URL: wss://..."
```

## WebSocket Configuration

The WebSocket service automatically selects the correct URL:

```javascript
// Development/Local: ws://localhost:3001
// Production: wss://youngeagles-api-server.up.railway.app
// Path: /socket.io (automatically appended)
```

## Troubleshooting

### Common Issues

1. **API calls failing**: Verify `VITE_API_BASE_URL` doesn't include `/api` suffix
2. **WebSocket connection failed**: Check `VITE_API_WS_URL` matches your server's WebSocket endpoint
3. **Environment not switching**: Verify `VITE_FORCE_LOCAL_API` is exactly `'true'` (string)
4. **Vercel deployment failing**: Ensure all required environment variables are set in Vercel dashboard

### Debug Mode
Enable debug mode to see detailed API call logging:
```bash
VITE_DEBUG_MODE=true npm run dev
```

### Verification Commands
```bash
# Check environment variables during build
npm run build 2>&1 | grep VITE_

# Test API connectivity
curl -I https://youngeagles-api-server.up.railway.app/health

# Test WebSocket connectivity  
wscat -c wss://youngeagles-api-server.up.railway.app/socket.io
```

## Security Notes

1. Never commit `.env` files containing sensitive data
2. Use `.env.example` as a template for required variables
3. Regularly rotate API keys and tokens
4. Monitor environment variable usage in deployment logs
5. Ensure WebSocket URLs use secure protocols (`wss://`) in production

## Migration Checklist

When updating environment configuration:

- [ ] Update `.env.example` with new variables
- [ ] Update `vercel.json` environment mapping
- [ ] Update GitHub Actions workflow secrets
- [ ] Update Vercel dashboard environment variables
- [ ] Test local development with new configuration
- [ ] Test production build with new configuration
- [ ] Update this documentation
