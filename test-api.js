#!/usr/bin/env node

// Set up environment variables for Node.js compatibility
process.env.VITE_API_BASE_URL = 'https://api.youngeagles.edu';
process.env.VITE_API_LOCAL_URL = 'http://localhost:3001';
process.env.VITE_ENABLE_MOCK_API = 'true';

import { testConnection } from './src/services/httpClient.js';

async function runApiTest() {
  console.log('🔍 Testing API connectivity...\n');
  
  try {
    const result = await testConnection();
    
    if (result.success) {
      console.log('✅ API Connection Successful!');
      console.log(`📡 Connected to: ${result.url}`);
      console.log(`🏷️  Type: ${result.type}`);
      console.log('\n✨ Your backend is online and ready!');
    } else {
      console.log('❌ API Connection Failed');
      console.log('🔧 Neither production nor local API endpoints are reachable');
      console.log('\n📋 Troubleshooting:');
      console.log('   • Check if your backend server is running');
      console.log('   • Verify API_BASE_URL and API_LOCAL_URL in environment config');
      console.log('   • Ensure the /health endpoint exists on your backend');
      console.log('   • Check network connectivity');
    }
  } catch (error) {
    console.error('🚨 Test failed with error:', error.message);
  }
}

// Run the test
runApiTest();

