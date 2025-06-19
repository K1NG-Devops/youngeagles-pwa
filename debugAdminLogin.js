#!/usr/bin/env node

import axios from 'axios';

// Test the exact same request that should be made by the frontend
async function testAdminLogin() {
  console.log('🔍 Testing Admin Login Request');
  console.log('='.repeat(50));
  
  const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';
  
  // Create axios instance with the same config as the frontend
  const httpClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  // Add logging interceptors
  httpClient.interceptors.request.use(
    (config) => {
      console.log(`🚀 Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      console.log('📤 Headers:', JSON.stringify(config.headers, null, 2));
      console.log('📤 Data:', JSON.stringify(config.data, null, 2));
      return config;
    }
  );
  
  httpClient.interceptors.response.use(
    (response) => {
      console.log(`✅ Response ${response.status}: ${response.statusText}`);
      console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
      return response;
    },
    (error) => {
      if (error.response) {
        console.log(`❌ Error ${error.response.status}: ${error.response.statusText}`);
        console.log('📥 Error data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('❌ Network error:', error.message);
      }
      return Promise.reject(error);
    }
  );
  
  // Test the actual admin login request
  const testCredentials = {
    email: 'admin@test.com',
    password: 'test123',
    role: 'admin'
  };
  
  try {
    console.log('\n🔐 Testing POST request to /auth/admin-login');
    console.log('Credentials:', { email: testCredentials.email, password: '***', role: testCredentials.role });
    
    const response = await httpClient.post('/auth/admin-login', {
      email: testCredentials.email,
      password: testCredentials.password,
      role: testCredentials.role
    });
    
    console.log('\n✅ Admin login request completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Admin login request failed (expected for test credentials)');
  }
  
  // Also test the teacher login endpoint for comparison
  try {
    console.log('\n🧑‍🏫 Testing POST request to /auth/teacher-login');
    
    const teacherResponse = await httpClient.post('/auth/teacher-login', {
      email: testCredentials.email,
      password: testCredentials.password,
      role: 'teacher'
    });
    
    console.log('\n✅ Teacher login request completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Teacher login request failed (expected for test credentials)');
  }
  
  // Test regular login endpoint for comparison
  try {
    console.log('\n👤 Testing POST request to /auth/login');
    
    const parentResponse = await httpClient.post('/auth/login', {
      email: testCredentials.email,
      password: testCredentials.password,
      role: 'parent'
    });
    
    console.log('\n✅ Parent login request completed successfully!');
    
  } catch (error) {
    console.log('\n❌ Parent login request failed (expected for test credentials)');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test completed');
  console.log('\n💡 Analysis:');
  console.log('- All requests should be POST methods');
  console.log('- Check the Railway logs to see what method is actually being received');
  console.log('- If you see GET requests in Railway logs, there might be:');
  console.log('  1. A browser redirect happening');
  console.log('  2. A CORS preflight issue');
  console.log('  3. A form submission issue in the frontend');
  console.log('  4. An axios configuration problem');
}

// Run the test
testAdminLogin().catch(error => {
  console.error('🚨 Test failed:', error.message);
  process.exit(1);
});

