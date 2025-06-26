# Testing Setup and Issue Reproduction

## Test Configuration Setup

This document outlines the test setup to reproduce the issue where the dashboard shows 0 counts while the API should return assignment data.

### Current Environment Status

1. **Local Development Server**: ✅ Running on http://localhost:3002
2. **Local API Server**: ✅ Running on http://localhost:3001
3. **Production API**: ✅ Available at https://youngeagles-api-server.up.railway.app

### API Configuration Testing

The application supports both local and production API configurations:

#### Local API Configuration (Current)
```bash
# .env (current)
VITE_FORCE_LOCAL_API=true
VITE_API_LOCAL_URL=http://localhost:3001/api
VITE_DEBUG_MODE=true
```

#### Production API Configuration
```bash
# .env.test (for testing)
VITE_FORCE_LOCAL_API=false
VITE_API_BASE_URL=https://youngeagles-api-server.up.railway.app/api
VITE_DEBUG_MODE=true
```

### Test Account Requirements

To properly test the issue, we need:
1. A parent account with valid credentials
2. Associated children records in the database
3. Homework/assignment records for those children

### Network Traffic Analysis Points

Key API endpoints to monitor:
1. `/auth/login` - Parent authentication
2. `/auth/parents/{parentId}/children` - Fetch children for dropdown
3. `/parent/{parentId}/child/{childId}/homework` - Fetch assignments
4. `/parent/reports?child_id={childId}` - Progress reports
5. `/homeworks/grades/child/{childId}` - Grade data

### Expected vs Actual Behavior

**Expected**: Dashboard shows actual assignment counts from API
**Actual**: Dashboard shows 0 counts despite API containing data

### Test Scenarios

1. **Scenario 1: Local API with Force Local = true**
   - API URL: http://localhost:3001
   - Expected: Should use local API
   
2. **Scenario 2: Production API with Force Local = false**
   - API URL: https://youngeagles-api-server.up.railway.app/api
   - Expected: Should use production API

### Issue Reproduction Steps

1. Set up environment configuration
2. Start application
3. Login with valid parent credentials
4. Navigate to dashboard
5. Monitor network traffic for API calls
6. Compare API response data with dashboard display
7. Capture HAR file and screenshots

### Network Monitoring Tools

- Browser DevTools Network tab
- HAR file export
- Console logging (with VITE_DEBUG_MODE=true)
- Network request/response inspection

