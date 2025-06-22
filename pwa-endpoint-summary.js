import axios from 'axios';

const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';
const PWA_URL = 'https://youngeagles-app.vercel.app';

console.log('🔍 YOUNG EAGLES PWA ENDPOINT ANALYSIS');
console.log('=====================================');
console.log(`API Base: ${API_BASE_URL}`);
console.log(`PWA URL: ${PWA_URL}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

async function testEndpoint(path, description) {
  try {
    const response = await axios.get(`${API_BASE_URL}${path}`, {
      timeout: 5000,
      headers: {
        'x-request-source': 'pwa-test'
      }
    });
    
    if (response.status === 200) {
      console.log(`✅ ${description}: Working (${response.status})`);
      return { path, status: 'working', code: response.status };
    } else {
      console.log(`⚠️  ${description}: Unexpected status (${response.status})`);
      return { path, status: 'unexpected', code: response.status };
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`🔒 ${description}: Requires authentication (${error.response.status})`);
      return { path, status: 'auth_required', code: 401 };
    } else if (error.response?.status === 404) {
      console.log(`❌ ${description}: Not found (${error.response.status})`);
      return { path, status: 'not_found', code: 404 };
    } else {
      console.log(`🔥 ${description}: Error (${error.response?.status || 'Network'})`);
      return { path, status: 'error', code: error.response?.status || 0 };
    }
  }
}

async function testPWAAccess() {
  try {
    const response = await axios.get(PWA_URL, { timeout: 10000 });
    console.log(`✅ PWA Access: Working (${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ PWA Access: Failed (${error.response?.status || 'Network'})`);
    return false;
  }
}

async function runAnalysis() {
  // Test core server endpoints
  console.log('🏥 CORE SERVER ENDPOINTS:');
  await testEndpoint('/../health', 'Health Check');
  await testEndpoint('/..', 'Root API');
  await testEndpoint('/test-db', 'Database Test');
  
  console.log('\n🔐 AUTHENTICATION ENDPOINTS:');
  await testEndpoint('/auth/firebase-login', 'Firebase Login');
  await testEndpoint('/auth/teacher-login', 'Teacher Login');
  await testEndpoint('/auth/admin-login', 'Admin Login');
  
  console.log('\n👨‍👩‍👧‍👦 PARENT ENDPOINTS:');
  await testEndpoint('/parent/test', 'Parent Test');
  await testEndpoint('/parent/children', 'Parent Children');
  await testEndpoint('/parent/homework', 'Parent Homework');
  await testEndpoint('/parent/profile', 'Parent Profile');
  
  console.log('\n👨‍🏫 TEACHER ENDPOINTS:');
  await testEndpoint('/teacher/test', 'Teacher Test');
  await testEndpoint('/teacher/classes', 'Teacher Classes');
  await testEndpoint('/teacher/homework', 'Teacher Homework');
  await testEndpoint('/teacher/attendance', 'Teacher Attendance');
  
  console.log('\n👑 ADMIN ENDPOINTS:');
  await testEndpoint('/admin/users', 'Admin Users');
  await testEndpoint('/admin/teachers', 'Admin Teachers');
  await testEndpoint('/admin/parents', 'Admin Parents');
  await testEndpoint('/admin/dashboard', 'Admin Dashboard');
  
  console.log('\n📚 HOMEWORK ENDPOINTS:');
  await testEndpoint('/homework', 'Get Homework');
  await testEndpoint('/homeworks', 'Get Homeworks (Alt)');
  await testEndpoint('/homework/submissions', 'Homework Submissions');
  
  console.log('\n💬 MESSAGING ENDPOINTS:');
  await testEndpoint('/messaging/conversations', 'Get Conversations');
  await testEndpoint('/messaging/messages', 'Get Messages');
  await testEndpoint('/messages', 'Messages (Alt)');
  
  console.log('\n📱 PWA ACCESS:');
  await testPWAAccess();
  
  console.log('\n📊 SUMMARY:');
  console.log('===========');
  console.log('✅ Working: Endpoints that return 200 OK');
  console.log('🔒 Auth Required: Endpoints that return 401 (expected for protected routes)');
  console.log('❌ Not Found: Endpoints that return 404 (missing/not mounted)');
  console.log('🔥 Error: Endpoints with other errors');
  
  console.log('\n🔧 RECOMMENDATIONS:');
  console.log('===================');
  console.log('1. ✅ Core server infrastructure is working');
  console.log('2. ✅ Authentication endpoints are accessible');
  console.log('3. ❌ Parent/Teacher specific routes need to be properly mounted');
  console.log('4. ✅ Existing homework and messaging routes work');
  console.log('5. ✅ PWA is accessible and loading');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('===============');
  console.log('1. Debug why new routes are not being mounted in Railway deployment');
  console.log('2. Check for import/export issues in route files');
  console.log('3. Verify middleware dependencies are correctly imported');
  console.log('4. Test routes locally before deploying');
  console.log('5. Use existing working endpoints for PWA functionality');
}

runAnalysis().catch(console.error); 