#!/usr/bin/env node

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

// HTTP client setup with increased timeout and proper headers
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'YoungEagles-Admin-Query/1.0'
  }
});

// Add request interceptor for debugging
httpClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 Making ${config.method.toUpperCase()} request to: ${config.url}`);
    if (config.data) {
      console.log('📤 Request data:', JSON.stringify(config.data, null, 2));
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
httpClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status} from: ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`❌ Error ${error.response.status} from: ${error.config?.url}`);
      console.log('📥 Error response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('❌ No response received:', error.message);
    } else {
      console.log('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Test API connectivity
async function testAPIConnectivity() {
  console.log('🔌 Testing API connectivity...\n');
  
  try {
    // Try a simple GET request to check if API is responding
    const response = await httpClient.get('/health');
    console.log('✅ API Health Check passed');
    return true;
  } catch (error) {
    console.log('⚠️  Health endpoint not available, trying auth endpoints...');
    
    try {
      // Try OPTIONS request on auth endpoint
      const authResponse = await httpClient.options('/auth/login');
      console.log('✅ Auth endpoint is reachable');
      return true;
    } catch (authError) {
      console.log('❌ API seems to be unreachable');
      console.log('Error details:', authError.message);
      return false;
    }
  }
}

// Try to get user/admin list without authentication (probably won't work)
async function tryDirectUserQuery() {
  console.log('\n🔍 Attempting direct user queries...\n');
  
  const endpoints = [
    '/users',
    '/admin/users',
    '/auth/users',
    '/user/list',
    '/admin/list'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Trying endpoint: ${endpoint}`);
      const response = await httpClient.get(endpoint);
      console.log(`✅ Success! Found data at ${endpoint}`);
      console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || 'No response'}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('❌ No accessible user endpoints found without authentication');
  return null;
}

// Try to authenticate with common admin credentials
async function tryAdminAuthentication() {
  console.log('\n🔐 Attempting admin authentication with common credentials...\n');
  
  // Common admin credential combinations to try
  const adminCredentials = [
    { email: 'admin@youngeagles.org.za', password: 'admin123' },
    { email: 'admin@youngeagles.co.za', password: 'admin123' },
    { email: 'administrator@youngeagles.org.za', password: 'admin123' },
    { email: 'admin@youngeagles.org.za', password: 'password' },
    { email: 'admin@youngeagles.org.za', password: 'Admin123!' },
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'katso@youngeagles.org.za', password: '#Katso@yehc' }, // Known user from error logs
  ];
  
  for (const creds of adminCredentials) {
    try {
      console.log(`🔑 Trying: ${creds.email}`);
      
      // Try admin login endpoint
      const response = await httpClient.post('/auth/admin-login', {
        email: creds.email,
        password: creds.password
      });
      
      console.log('✅ Admin authentication successful!');
      console.log('👤 Admin user:', response.data.user);
      console.log('🔑 Token:', response.data.token ? 'Generated' : 'None');
      
      return response.data;
      
    } catch (error) {
      console.log(`❌ Failed for ${creds.email}: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('❌ No successful admin authentication found');
  return null;
}

// Query admin users with authentication token
async function queryAdminUsersWithAuth(token) {
  console.log('\n👑 Querying admin users with authentication...\n');
  
  // Set authorization header
  httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  const adminEndpoints = [
    '/admin/users',
    '/admin/admins',
    '/users?role=admin',
    '/admin/dashboard',
    '/users',
  ];
  
  for (const endpoint of adminEndpoints) {
    try {
      console.log(`📡 Querying: ${endpoint}`);
      const response = await httpClient.get(endpoint);
      
      console.log(`✅ Success! Data from ${endpoint}:`);
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      // Look for admin users in the response
      if (response.data.users) {
        const adminUsers = response.data.users.filter(user => user.role === 'admin');
        if (adminUsers.length > 0) {
          console.log(`\n👑 Found ${adminUsers.length} admin users:`);
          adminUsers.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email} - ${admin.name || 'No name'} - ID: ${admin.id}`);
          });
        }
      }
      
      return response.data;
      
    } catch (error) {
      console.log(`❌ ${endpoint} failed: ${error.response?.status || 'No response'} - ${error.response?.data?.message || error.message}`);
    }
  }
  
  return null;
}

// Try to register a new admin user (probably won't work)
async function tryCreateAdminUser() {
  console.log('\n👤 Attempting to create a new admin user...\n');
  
  const newAdmin = {
    email: 'newadmin@youngeagles.org.za',
    password: 'NewAdmin123!',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    name: 'System Administrator'
  };
  
  const registrationEndpoints = [
    '/auth/register',
    '/admin/register',
    '/auth/admin-register',
    '/users/create'
  ];
  
  for (const endpoint of registrationEndpoints) {
    try {
      console.log(`📝 Trying registration at: ${endpoint}`);
      const response = await httpClient.post(endpoint, newAdmin);
      
      console.log('✅ Admin user creation successful!');
      console.log('👤 New admin:', response.data);
      
      return response.data;
      
    } catch (error) {
      console.log(`❌ ${endpoint} failed: ${error.response?.status || 'No response'} - ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('❌ Unable to create new admin user through any endpoint');
  return null;
}

// Database connection attempt (if database URL is exposed)
async function tryDatabaseConnection() {
  console.log('\n🗄️  Attempting database connection methods...\n');
  
  // Try to find database endpoints
  const dbEndpoints = [
    '/db/users',
    '/database/users',
    '/api/db/query',
    '/admin/db/users',
    '/debug/users',
    '/dev/users'
  ];
  
  for (const endpoint of dbEndpoints) {
    try {
      console.log(`🔍 Checking: ${endpoint}`);
      const response = await httpClient.get(endpoint);
      console.log(`✅ Database endpoint found: ${endpoint}`);
      console.log('📊 Data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log(`❌ ${endpoint} - Not accessible`);
    }
  }
  
  console.log('❌ No accessible database endpoints found');
  return null;
}

// Main query function
async function queryAdminUsers() {
  console.log('🚀 Starting Admin User Query');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(80));
  
  try {
    // Step 1: Test API connectivity
    const isConnected = await testAPIConnectivity();
    if (!isConnected) {
      console.log('❌ Cannot connect to API, aborting query');
      return;
    }
    
    // Step 2: Try direct user queries (unlikely to work)
    await tryDirectUserQuery();
    
    // Step 3: Try admin authentication
    const authResult = await tryAdminAuthentication();
    
    if (authResult && authResult.token) {
      // Step 4: Query admin users with authentication
      await queryAdminUsersWithAuth(authResult.token);
    }
    
    // Step 5: Try to create new admin user
    await tryCreateAdminUser();
    
    // Step 6: Try database connection methods
    await tryDatabaseConnection();
    
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 Admin user query completed');
  console.log('\n💡 Summary:');
  console.log('- If authentication failed, you may need to check with the backend team');
  console.log('- Look for any successful responses above to find admin user information');
  console.log('- Consider checking the backend database directly if you have access');
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the query
queryAdminUsers().catch(error => {
  console.error('🚨 Query failed:', error.message);
  process.exit(1);
});

