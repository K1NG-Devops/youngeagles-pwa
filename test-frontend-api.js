#!/usr/bin/env node

// Quick frontend API test to debug connectivity issues

import axios from 'axios';

const API_BASE = 'https://youngeagles-api-server.up.railway.app';

async function testDirectAPI() {
  console.log('🧪 Testing Direct API Connectivity');
  console.log('===================================');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`, { 
      timeout: 30000,
      headers: {
        'Origin': 'https://youngeagles.org.za',
        'User-Agent': 'Frontend-Test/1.0'
      }
    });
    console.log('✅ Health Check:', healthResponse.status, healthResponse.data.status);
    
    // Test 2: Admin Login
    console.log('\n2. Testing Admin Login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/admin-login`, {
      email: 'admin@youngeagles.org.za',
      password: '#Admin@2012'
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://youngeagles.org.za',
        'User-Agent': 'Frontend-Test/1.0'
      }
    });
    console.log('✅ Admin Login:', loginResponse.status, 'Token received:', !!loginResponse.data.accessToken);
    
    // Test 3: Token verification
    if (loginResponse.data.accessToken) {
      console.log('\n3. Testing Token Verification...');
      const verifyResponse = await axios.get(`${API_BASE}/api/auth/verify`, {
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${loginResponse.data.accessToken}`,
          'Origin': 'https://youngeagles.org.za',
          'User-Agent': 'Frontend-Test/1.0'
        }
      });
      console.log('✅ Token Verification:', verifyResponse.status, 'User:', verifyResponse.data.user.email);
    }
    
    console.log('\n🎉 All tests passed! API is working correctly.');
    console.log('\n💡 The issue might be in the frontend timeout/network configuration.');
    console.log('   Try clearing browser cache or check browser developer tools for more details.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    if (error.code === 'ECONNABORTED') {
      console.error('   This is a timeout error - try increasing timeout values');
    }
  }
}

async function testWithAxiosConfig() {
  console.log('\n🔧 Testing with different Axios configurations');
  console.log('=============================================');
  
  // Test with different timeout values
  const timeouts = [5000, 10000, 30000, 60000];
  
  for (const timeout of timeouts) {
    try {
      console.log(`\n⏱️  Testing with ${timeout/1000}s timeout...`);
      const startTime = Date.now();
      
      const response = await axios.post(`${API_BASE}/api/auth/admin-login`, {
        email: 'admin@youngeagles.org.za',
        password: '#Admin@2012'
      }, {
        timeout,
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://youngeagles.org.za'
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Success with ${timeout/1000}s timeout (took ${duration}ms)`);
      break;
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`❌ Timeout with ${timeout/1000}s`);
      } else {
        console.log(`❌ Error with ${timeout/1000}s:`, error.message);
        break;
      }
    }
  }
}

// Run tests
(async () => {
  await testDirectAPI();
  await testWithAxiosConfig();
})();
