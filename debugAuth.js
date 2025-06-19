import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

// HTTP client setup
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Test different login payload structures
async function testLoginVariations() {
  const testCredentials = {
    email: 'katso@youngeagles.org.za',
    password: '#Katso@yehc'
  };

  console.log('🔍 Testing different login payload structures...\n');

  // Variation 1: Just email and password
  console.log('1️⃣ Testing with email and password only:');
  try {
    const response = await httpClient.post('/auth/login', {
      email: testCredentials.email,
      password: testCredentials.password
    });
    console.log('✅ Success with email/password only');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Failed with email/password only');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }

  // Variation 2: With role as teacher
  console.log('\n2️⃣ Testing with role as teacher:');
  try {
    const response = await httpClient.post('/auth/login', {
      email: testCredentials.email,
      password: testCredentials.password,
      role: 'teacher'
    });
    console.log('✅ Success with role=teacher');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Failed with role=teacher');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }

  // Variation 3: With userType instead of role
  console.log('\n3️⃣ Testing with userType instead of role:');
  try {
    const response = await httpClient.post('/auth/login', {
      email: testCredentials.email,
      password: testCredentials.password,
      userType: 'teacher'
    });
    console.log('✅ Success with userType=teacher');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Failed with userType=teacher');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }

  // Variation 4: Check if there's a different login endpoint
  console.log('\n4️⃣ Testing alternative login endpoint (/login):');
  try {
    const response = await httpClient.post('/login', {
      email: testCredentials.email,
      password: testCredentials.password
    });
    console.log('✅ Success with /login endpoint');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Failed with /login endpoint');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Test registration with a new test account
async function testRegistration() {
  console.log('\n🆕 Testing registration with a new test account...\n');
  
  const testUser = {
    email: `test-${Date.now()}@youngeagles.test`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent'
  };

  try {
    const response = await httpClient.post('/auth/register', testUser);
    console.log('✅ Registration successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Try to login with the newly registered account
    console.log('\n🔐 Attempting login with newly registered account...');
    try {
      const loginResponse = await httpClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful with new account');
      console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));
    } catch (loginError) {
      console.log('❌ Login failed with new account');
      if (loginError.response) {
        console.log(`Status: ${loginError.response.status}`);
        console.log(`Data: ${JSON.stringify(loginError.response.data, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Registration failed');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

// Check API endpoints and their methods
async function checkAPIEndpoints() {
  console.log('\n🔍 Checking available API endpoints...\n');
  
  const endpointsToCheck = [
    '/auth',
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/users',
    '/api/auth/login',
    '/api/users'
  ];

  for (const endpoint of endpointsToCheck) {
    try {
      // Try OPTIONS request to see what methods are allowed
      const optionsResponse = await httpClient.options(endpoint);
      console.log(`✅ ${endpoint} - OPTIONS successful`);
      console.log(`   Allowed methods: ${optionsResponse.headers['access-control-allow-methods'] || 'Not specified'}`);
    } catch (optionsError) {
      try {
        // Try GET request
        const getResponse = await httpClient.get(endpoint);
        console.log(`✅ ${endpoint} - GET successful`);
        console.log(`   Response: ${JSON.stringify(getResponse.data, null, 2).substring(0, 200)}...`);
      } catch (getError) {
        console.log(`❌ ${endpoint} - Not accessible (${getError.response?.status || 'No response'})`);
      }
    }
  }
}

// Main debug function
async function runDebugTests() {
  console.log('🚀 Starting Authentication Debug Tests');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(60));

  try {
    await checkAPIEndpoints();
    await testLoginVariations();
    await testRegistration();
  } catch (error) {
    console.error('❌ Debug tests failed:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Debug tests completed');
}

// Run the debug tests
runDebugTests().catch(error => {
  console.error('❌ Debug execution failed:', error);
  process.exit(1);
});

