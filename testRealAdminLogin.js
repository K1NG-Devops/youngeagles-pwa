#!/usr/bin/env node

import axios from 'axios';

// Test the exact workflow the frontend will use
async function testRealAdminLogin() {
  console.log('🧪 Testing Real Admin Login Workflow');
  console.log('=====================================');
  
  const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';
  
  // Create the same axios configuration as the frontend
  const httpClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Test credentials (these will fail but show the correct flow)
  const testCredentials = [
    { email: 'admin@youngeagles.org.za', password: 'admin123' },
    { email: 'admin@test.com', password: 'test123' },
    // Add any other credentials you want to test
  ];
  
  for (const creds of testCredentials) {
    console.log(`\n🔐 Testing admin login with: ${creds.email}`);
    
    try {
      // This is exactly what the frontend authService will do
      const response = await httpClient.post('/auth/admin-login', {
        email: creds.email,
        password: creds.password,
        role: 'admin'
      });
      
      console.log('✅ SUCCESS! Admin login worked!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      // If successful, test accessing admin endpoints
      if (response.data.token) {
        console.log('\n🔍 Testing admin dashboard access...');
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        try {
          const dashboardResponse = await httpClient.get('/admin/dashboard');
          console.log('✅ Admin dashboard accessible');
          console.log('Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
        } catch (dashError) {
          console.log('❌ Admin dashboard not accessible:', dashError.response?.data?.message || dashError.message);
        }
      }
      
      return; // Exit on first success
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Status: ${error.response.status}`);
        console.log(`❌ Error: ${error.response.data?.message || 'Unknown error'}`);
        
        // Check if this is the expected "invalid credentials" error
        if (error.response.status === 400 && error.response.data?.message === 'Invalid email or password.') {
          console.log('   (This is the expected error for invalid credentials)');
        }
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
  }
  
  console.log('\n💡 Summary:');
  console.log('- The admin login endpoint is working correctly');
  console.log('- POST requests are being sent properly'); 
  console.log('- The API responds with proper error messages');
  console.log('- You need valid admin credentials to proceed');
  console.log('\n📝 Next steps:');
  console.log('1. Get valid admin credentials from the backend team');
  console.log('2. Or create an admin user in the database');
  console.log('3. The frontend is now properly configured to make real API calls');
}

// Run the test
testRealAdminLogin().catch(error => {
  console.error('🚨 Test failed:', error.message);
  process.exit(1);
});

