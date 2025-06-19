#!/usr/bin/env node

// Standalone API connectivity test - no project dependencies
import axios from 'axios';

const API_ENDPOINTS = {
  production: 'https://api.youngeagles.edu',
  local: 'http://localhost:3001'
};

async function testEndpoint(name, baseUrl) {
  try {
    console.log(`🔍 Testing ${name} API at ${baseUrl}...`);
    
    const response = await axios.get(`${baseUrl}/health`, {
      timeout: 5000,
      validateStatus: () => true // Accept any HTTP status
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ ${name} API is ONLINE`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      console.log(`⚠️  ${name} API responded with status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${name} API is OFFLINE (Connection refused)`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`❌ ${name} API domain not found`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`❌ ${name} API request timed out`);
    } else {
      console.log(`❌ ${name} API error: ${error.message}`);
    }
    return false;
  }
}

async function runConnectivityTest() {
  console.log('🚀 Young Eagles PWA - API Connectivity Test');
  console.log('=============================================\n');
  
  const results = {};
  
  // Test production API
  results.production = await testEndpoint('Production', API_ENDPOINTS.production);
  console.log('');
  
  // Test local API
  results.local = await testEndpoint('Local Development', API_ENDPOINTS.local);
  console.log('');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('================');
  
  if (results.production) {
    console.log('✅ Production API: ONLINE');
  } else {
    console.log('❌ Production API: OFFLINE');
  }
  
  if (results.local) {
    console.log('✅ Local API: ONLINE');
  } else {
    console.log('❌ Local API: OFFLINE');
  }
  
  console.log('');
  
  if (results.production || results.local) {
    console.log('🎉 SUCCESS: At least one API endpoint is reachable!');
    if (results.local) {
      console.log('💡 Recommendation: Use local development API for testing');
    } else if (results.production) {
      console.log('💡 Recommendation: Using production API');
    }
  } else {
    console.log('🚨 WARNING: No API endpoints are reachable');
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. For Local API:');
    console.log('   • Start your backend server on port 3001');
    console.log('   • Ensure /health endpoint is implemented');
    console.log('   • Check for CORS configuration');
    console.log('');
    console.log('2. For Production API:');
    console.log('   • Verify the domain is correct');
    console.log('   • Check if the server is deployed and running');
    console.log('   • Ensure /health endpoint exists');
  }
}

// Run the test
runConnectivityTest().catch(error => {
  console.error('🚨 Test script failed:', error.message);
  process.exit(1);
});

