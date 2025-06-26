#!/usr/bin/env node

// Test script to verify admin API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app';

console.log('🧪 Testing Admin API Endpoints...\n');

const testEndpoints = [
  { name: 'Dashboard', path: '/api/admin/dashboard' },
  { name: 'Analytics', path: '/api/admin/analytics' },
  { name: 'Quick Actions', path: '/api/admin/quick-actions' },
  { name: 'Users', path: '/api/admin/users' },
  { name: 'Teachers', path: '/api/admin/teachers' },
  { name: 'Parents', path: '/api/admin/parents' }
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const status = response.status;
    const statusText = response.statusText;
    
    // We expect 403 Forbidden (not 404) for admin endpoints without auth
    if (status === 403) {
      console.log(`✅ ${endpoint.name}: ${status} ${statusText} (Endpoint exists, auth required)`);
      return true;
    } else if (status === 404) {
      console.log(`❌ ${endpoint.name}: ${status} ${statusText} (Endpoint NOT FOUND)`);
      return false;
    } else {
      console.log(`⚠️  ${endpoint.name}: ${status} ${statusText} (Unexpected response)`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`Testing against: ${API_BASE_URL}\n`);
  
  let passCount = 0;
  for (const endpoint of testEndpoints) {
    const passed = await testEndpoint(endpoint);
    if (passed) passCount++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log(`\n📊 Test Results: ${passCount}/${testEndpoints.length} endpoints working correctly`);
  
  if (passCount === testEndpoints.length) {
    console.log('🎉 All admin endpoints are available on the production server!');
    console.log('🔧 The 404 errors in your browser were likely due to missing /api prefix.');
  } else {
    console.log('⚠️  Some endpoints may not be available on the production server.');
  }
}

runTests().catch(console.error);
