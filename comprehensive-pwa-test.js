import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test Configuration
const TEST_CONFIG = {
  API_BASE_URL: 'https://youngeagles-api-server.up.railway.app/api',
  PWA_URL: 'https://youngeagles-app.vercel.app',
  TEST_CREDENTIALS: {
    parent: {
      email: 'oliviamakunyane@gmail.com',
      // Will use Firebase auth for this
    },
    teacher: {
      email: 'teacher@test.com',
      password: 'password123'
    },
    admin: {
      email: 'admin@test.com',
      password: 'admin123'
    }
  }
};

// Test Results Storage
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Utility Functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const result = {
    test: testName,
    status,
    details,
    timestamp
  };
  
  testResults.details.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  } else if (status === 'SKIP') {
    testResults.skipped++;
    console.log(`⏭️  ${testName}: ${details}`);
  }
  
  if (details && status !== 'SKIP') {
    console.log(`   ${details}`);
  }
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${TEST_CONFIG.API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'x-request-source': 'pwa-test',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 0 
    };
  }
}

// Test Functions
async function testServerHealth() {
  console.log('\n🏥 Testing Server Health...');
  
  // Test health endpoint
  const healthResult = await makeRequest('GET', '/../health');
  if (healthResult.success) {
    logTest('Health Check Endpoint', 'PASS', `Server is healthy - Uptime: ${healthResult.data.uptime}s`);
  } else {
    logTest('Health Check Endpoint', 'FAIL', `Health check failed: ${healthResult.error}`);
  }
  
  // Test root endpoint
  const rootResult = await makeRequest('GET', '/..');
  if (rootResult.success) {
    logTest('Root Endpoint', 'PASS', `API server responding: ${rootResult.data.message}`);
  } else {
    logTest('Root Endpoint', 'FAIL', `Root endpoint failed: ${rootResult.error}`);
  }
}

async function testCORSConfiguration() {
  console.log('\n🌐 Testing CORS Configuration...');
  
  try {
    const response = await axios.options(`${TEST_CONFIG.API_BASE_URL}/auth/firebase-login`, {
      headers: {
        'Origin': TEST_CONFIG.PWA_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const corsHeaders = response.headers;
    if (corsHeaders['access-control-allow-origin']) {
      logTest('CORS Preflight', 'PASS', `CORS enabled for origin: ${corsHeaders['access-control-allow-origin']}`);
    } else {
      logTest('CORS Preflight', 'FAIL', 'CORS headers not found in preflight response');
    }
  } catch (error) {
    logTest('CORS Preflight', 'FAIL', `CORS preflight failed: ${error.message}`);
  }
}

async function testAuthEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test Firebase login endpoint
  const firebaseLoginResult = await makeRequest('POST', '/auth/firebase-login', {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User'
  });
  
  if (firebaseLoginResult.status === 400 || firebaseLoginResult.status === 401) {
    logTest('Firebase Login Endpoint', 'PASS', 'Endpoint responding correctly (expected auth failure for test data)');
  } else if (firebaseLoginResult.success) {
    logTest('Firebase Login Endpoint', 'PASS', 'Endpoint accessible and responding');
  } else {
    logTest('Firebase Login Endpoint', 'FAIL', `Endpoint error: ${firebaseLoginResult.error}`);
  }
  
  // Test teacher login endpoint
  const teacherLoginResult = await makeRequest('POST', '/auth/teacher-login', {
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  if (teacherLoginResult.status === 400 || teacherLoginResult.status === 401) {
    logTest('Teacher Login Endpoint', 'PASS', 'Endpoint responding correctly (expected auth failure for test data)');
  } else if (teacherLoginResult.success) {
    logTest('Teacher Login Endpoint', 'PASS', 'Endpoint accessible and responding');
  } else {
    logTest('Teacher Login Endpoint', 'FAIL', `Endpoint error: ${teacherLoginResult.error}`);
  }
  
  // Test admin login endpoint
  const adminLoginResult = await makeRequest('POST', '/auth/admin-login', {
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  if (adminLoginResult.status === 400 || adminLoginResult.status === 401) {
    logTest('Admin Login Endpoint', 'PASS', 'Endpoint responding correctly (expected auth failure for test data)');
  } else if (adminLoginResult.success) {
    logTest('Admin Login Endpoint', 'PASS', 'Endpoint accessible and responding');
  } else {
    logTest('Admin Login Endpoint', 'FAIL', `Endpoint error: ${adminLoginResult.error}`);
  }
}

async function testParentEndpoints() {
  console.log('\n👨‍👩‍👧‍👦 Testing Parent Endpoints...');
  
  // Test endpoints that require authentication
  const endpoints = [
    { path: '/parent/children', method: 'GET', name: 'Get Children' },
    { path: '/parent/homework', method: 'GET', name: 'Get Homework' },
    { path: '/parent/profile', method: 'GET', name: 'Get Profile' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path);
    
    if (result.status === 401) {
      logTest(`Parent ${endpoint.name} Endpoint`, 'PASS', 'Endpoint properly requires authentication');
    } else if (result.success) {
      logTest(`Parent ${endpoint.name} Endpoint`, 'PASS', 'Endpoint accessible');
    } else {
      logTest(`Parent ${endpoint.name} Endpoint`, 'FAIL', `Endpoint error: ${result.error}`);
    }
  }
}

async function testTeacherEndpoints() {
  console.log('\n👨‍🏫 Testing Teacher Endpoints...');
  
  const endpoints = [
    { path: '/teacher/classes', method: 'GET', name: 'Get Classes' },
    { path: '/teacher/homework', method: 'GET', name: 'Get Homework' },
    { path: '/teacher/attendance', method: 'GET', name: 'Get Attendance' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path);
    
    if (result.status === 401) {
      logTest(`Teacher ${endpoint.name} Endpoint`, 'PASS', 'Endpoint properly requires authentication');
    } else if (result.success) {
      logTest(`Teacher ${endpoint.name} Endpoint`, 'PASS', 'Endpoint accessible');
    } else {
      logTest(`Teacher ${endpoint.name} Endpoint`, 'FAIL', `Endpoint error: ${result.error}`);
    }
  }
}

async function testAdminEndpoints() {
  console.log('\n👑 Testing Admin Endpoints...');
  
  const endpoints = [
    { path: '/admin/users', method: 'GET', name: 'Get Users' },
    { path: '/admin/teachers', method: 'GET', name: 'Get Teachers' },
    { path: '/admin/parents', method: 'GET', name: 'Get Parents' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path);
    
    if (result.status === 401) {
      logTest(`Admin ${endpoint.name} Endpoint`, 'PASS', 'Endpoint properly requires authentication');
    } else if (result.success) {
      logTest(`Admin ${endpoint.name} Endpoint`, 'PASS', 'Endpoint accessible');
    } else {
      logTest(`Admin ${endpoint.name} Endpoint`, 'FAIL', `Endpoint error: ${result.error}`);
    }
  }
}

async function testHomeworkEndpoints() {
  console.log('\n📚 Testing Homework Endpoints...');
  
  const endpoints = [
    { path: '/homework', method: 'GET', name: 'Get All Homework' },
    { path: '/homework/submissions', method: 'GET', name: 'Get Submissions' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path);
    
    if (result.status === 401) {
      logTest(`Homework ${endpoint.name} Endpoint`, 'PASS', 'Endpoint properly requires authentication');
    } else if (result.success) {
      logTest(`Homework ${endpoint.name} Endpoint`, 'PASS', 'Endpoint accessible');
    } else {
      logTest(`Homework ${endpoint.name} Endpoint`, 'FAIL', `Endpoint error: ${result.error}`);
    }
  }
}

async function testMessagingEndpoints() {
  console.log('\n💬 Testing Messaging Endpoints...');
  
  const endpoints = [
    { path: '/messaging/conversations', method: 'GET', name: 'Get Conversations' },
    { path: '/messaging/messages', method: 'GET', name: 'Get Messages' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.path);
    
    if (result.status === 401) {
      logTest(`Messaging ${endpoint.name} Endpoint`, 'PASS', 'Endpoint properly requires authentication');
    } else if (result.success) {
      logTest(`Messaging ${endpoint.name} Endpoint`, 'PASS', 'Endpoint accessible');
    } else {
      logTest(`Messaging ${endpoint.name} Endpoint`, 'FAIL', `Endpoint error: ${result.error}`);
    }
  }
}

async function testPWAAccessibility() {
  console.log('\n📱 Testing PWA Accessibility...');
  
  try {
    const response = await axios.get(TEST_CONFIG.PWA_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'PWA-Test-Bot/1.0'
      }
    });
    
    if (response.status === 200) {
      logTest('PWA Load Test', 'PASS', `PWA loads successfully (${response.status})`);
      
      // Check for PWA manifest
      if (response.data.includes('manifest.json')) {
        logTest('PWA Manifest', 'PASS', 'Manifest reference found in HTML');
      } else {
        logTest('PWA Manifest', 'FAIL', 'Manifest reference not found in HTML');
      }
      
      // Check for service worker
      if (response.data.includes('sw.js') || response.data.includes('service-worker')) {
        logTest('Service Worker', 'PASS', 'Service worker reference found');
      } else {
        logTest('Service Worker', 'FAIL', 'Service worker reference not found');
      }
      
    } else {
      logTest('PWA Load Test', 'FAIL', `PWA failed to load (${response.status})`);
    }
  } catch (error) {
    logTest('PWA Load Test', 'FAIL', `PWA load error: ${error.message}`);
  }
}

async function testDatabaseConnectivity() {
  console.log('\n🗄️ Testing Database Connectivity...');
  
  // Test a simple database query endpoint
  const result = await makeRequest('GET', '/test-db');
  
  if (result.success) {
    logTest('Database Connectivity', 'PASS', 'Database connection successful');
  } else if (result.status === 404) {
    logTest('Database Connectivity', 'SKIP', 'Test endpoint not available (expected)');
  } else {
    logTest('Database Connectivity', 'FAIL', `Database connection failed: ${result.error}`);
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test 404 handling
  const notFoundResult = await makeRequest('GET', '/nonexistent-endpoint');
  if (notFoundResult.status === 404) {
    logTest('404 Error Handling', 'PASS', '404 errors handled correctly');
  } else {
    logTest('404 Error Handling', 'FAIL', `Unexpected response for 404: ${notFoundResult.status}`);
  }
  
  // Test malformed request handling
  const malformedResult = await makeRequest('POST', '/auth/firebase-login', 'invalid-json');
  if (malformedResult.status === 400 || malformedResult.status === 422) {
    logTest('Malformed Request Handling', 'PASS', 'Malformed requests handled correctly');
  } else {
    logTest('Malformed Request Handling', 'FAIL', `Unexpected response for malformed request: ${malformedResult.status}`);
  }
}

function generateTestReport() {
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📝 Total Tests: ${testResults.passed + testResults.failed + testResults.skipped}`);
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`);
      });
  }
  
  console.log('\n🔗 ENDPOINTS TESTED:');
  console.log(`   • API Base: ${TEST_CONFIG.API_BASE_URL}`);
  console.log(`   • PWA URL: ${TEST_CONFIG.PWA_URL}`);
  
  return {
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped,
      successRate: parseFloat(successRate)
    },
    details: testResults.details
  };
}

// Main Test Runner
async function runComprehensiveTests() {
  console.log('🚀 YOUNG EAGLES PWA COMPREHENSIVE TEST SUITE');
  console.log('==============================================');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`🌐 API URL: ${TEST_CONFIG.API_BASE_URL}`);
  console.log(`📱 PWA URL: ${TEST_CONFIG.PWA_URL}`);
  
  try {
    // Wait for potential deployment to complete
    console.log('\n⏳ Waiting 30 seconds for deployment to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await testServerHealth();
    await testCORSConfiguration();
    await testAuthEndpoints();
    await testParentEndpoints();
    await testTeacherEndpoints();
    await testAdminEndpoints();
    await testHomeworkEndpoints();
    await testMessagingEndpoints();
    await testPWAAccessibility();
    await testDatabaseConnectivity();
    await testErrorHandling();
    
  } catch (error) {
    console.error('❌ Test suite encountered an error:', error);
    logTest('Test Suite Execution', 'FAIL', error.message);
  }
  
  const report = generateTestReport();
  
  console.log('\n✅ Test suite completed!');
  console.log(`📊 Results: ${report.summary.passed} passed, ${report.summary.failed} failed, ${report.summary.skipped} skipped`);
  
  // Exit with error code if tests failed
  if (testResults.failed > 0) {
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests().catch(console.error);
}

export { runComprehensiveTests, TEST_CONFIG }; 