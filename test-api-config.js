#!/usr/bin/env node

/**
 * Test script to verify API configuration switching between local and production
 * and capture network traffic for debugging dashboard count issues
 */

import fs from 'fs';

function switchToLocalConfig() {
  const envContent = `# Young Eagles PWA - Local Development Configuration

# Force the PWA to use local API server instead of production
VITE_FORCE_LOCAL_API=true

# Local API server URL
VITE_API_LOCAL_URL=http://localhost:3001/api

# Production API server URL (fallback)
VITE_API_BASE_URL=https://youngeagles-api-server.up.railway.app/api

# Development flags
VITE_DEBUG_MODE=true
VITE_ENABLE_SW=false

# Local development URLs
VITE_MAIN_WEBSITE_DEV_URL=http://localhost:5173
VITE_MAIN_WEBSITE_URL=https://youngeagles.org.za

# Feature flags for local development
VITE_ENABLE_PUSH_NOTIFICATIONS=false
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_ANALYTICS=false
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Switched to LOCAL API configuration');
  console.log('📡 API URL: http://localhost:3001/api');
}

function switchToProductionConfig() {
  const envContent = `# Young Eagles PWA - Production API Testing Configuration

# Force the PWA to use production API server instead of local
VITE_FORCE_LOCAL_API=false

# Local API server URL
VITE_API_LOCAL_URL=http://localhost:3001/api

# Production API server URL
VITE_API_BASE_URL=https://youngeagles-api-server.up.railway.app/api

# Development flags
VITE_DEBUG_MODE=true
VITE_ENABLE_SW=false

# Feature flags for production testing
VITE_ENABLE_PUSH_NOTIFICATIONS=false
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_ANALYTICS=false
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Switched to PRODUCTION API configuration');
  console.log('📡 API URL: https://youngeagles-api-server.up.railway.app/api');
}

function generateTestReport() {
  const report = `# API Configuration Test Report

## Test Execution Time
${new Date().toISOString()}

## Configuration Files Created

### 1. Local API Configuration (.env)
- VITE_FORCE_LOCAL_API=true
- API Base URL: http://localhost:3001/api
- Debug Mode: Enabled

### 2. Production API Configuration (.env.test)
- VITE_FORCE_LOCAL_API=false
- API Base URL: https://youngeagles-api-server.up.railway.app/api
- Debug Mode: Enabled

## Network Traffic Monitoring Instructions

### Browser DevTools Setup
1. Open Chrome/Firefox DevTools
2. Navigate to Network tab
3. Filter by XHR/Fetch requests
4. Clear existing logs
5. Keep DevTools open during testing

### Key API Endpoints to Monitor

#### Authentication
- POST /auth/login
- GET /auth/verify

#### Dashboard Data Loading
- GET /auth/parents/{parentId}/children
- GET /parent/{parentId}/child/{childId}/homework
- GET /parent/reports?child_id={childId}
- GET /homeworks/grades/child/{childId}

### Expected Network Flow
1. Login request with credentials
2. Children list fetch for dropdown
3. Homework/assignment data fetch per selected child
4. Dashboard count calculations

### Issue Indicators
- API returns data but dashboard shows 0
- Network requests succeed with 200 status
- Response contains valid assignment data
- Dashboard component not updating counts

### HAR File Export
1. Right-click in Network tab
2. Select "Save all as HAR with content"
3. Save files as:
   - local-api-traffic.har
   - production-api-traffic.har

### Screenshots to Capture
1. Dashboard showing 0 counts
2. Network tab with successful API calls
3. API response preview with actual data
4. Console logs with debug information

## Test Parent Account Requirements

For complete testing, ensure you have:
- Valid parent login credentials
- Associated children in the database
- Homework assignments for those children
- Proper database relationships

## Next Steps

1. Use this script to switch configurations
2. Test with both API endpoints
3. Capture network traffic and screenshots
4. Compare API responses with dashboard display
5. Identify the disconnect between data and UI
`;

  fs.writeFileSync('TEST_REPORT.md', report);
  console.log('📄 Generated test report: TEST_REPORT.md');
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'local':
    switchToLocalConfig();
    break;
  case 'production':
    switchToProductionConfig();
    break;
  case 'report':
    generateTestReport();
    break;
  default:
    console.log(`
🧪 Young Eagles PWA API Configuration Test Tool

Usage:
  node test-api-config.js local       - Switch to local API configuration
  node test-api-config.js production  - Switch to production API configuration  
  node test-api-config.js report      - Generate test report

Current configuration:
  ${fs.existsSync('.env') ? 'Configuration file exists' : 'No .env file found'}

After switching configurations:
1. Restart the development server (npm run dev)
2. Open browser DevTools Network tab
3. Login with a valid parent account
4. Monitor API calls vs dashboard display
5. Capture HAR files and screenshots
`);
}
