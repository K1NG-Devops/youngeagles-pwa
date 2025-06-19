import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

// Valid test user credentials
const testUsers = [
  {
    role: 'teacher',
    email: 'katso@youngeagles.org.za',
    password: '#Katso@yehc'
  },
  {
    role: 'admin',
    email: 'king@youngeagles.org.za',
    password: '#Olivia@17'
  }
];

// HTTP client setup
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock localStorage for Node.js
const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock toast for Node.js
const mockToast = {
  success: (message) => console.log(`✅ SUCCESS: ${message}`),
  error: (message) => console.log(`❌ ERROR: ${message}`),
  info: (message) => console.log(`ℹ️  INFO: ${message}`)
};

// Authentication functions
async function testLogin(email, password, role) {
  try {
    console.log(`\n🔐 Testing ${role} login...`);
    console.log(`Email: ${email}`);
    
    const response = await httpClient.post('/auth/login', {
      email,
      password,
      role
    });

    if (response.data && response.data.token) {
      console.log(`✅ Login successful for ${role}`);
      console.log(`Token received: ${response.data.token.substring(0, 20)}...`);
      
      // Store token
      mockLocalStorage.setItem('token', response.data.token);
      
      if (response.data.user) {
        mockLocalStorage.setItem('user', JSON.stringify(response.data.user));
        console.log(`User data: ${JSON.stringify(response.data.user, null, 2)}`);
      }
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user
      };
    } else {
      console.log(`❌ Login failed for ${role}: No token received`);
      return { success: false, error: 'No token received' };
    }
  } catch (error) {
    console.log(`❌ Login failed for ${role}:`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Message: ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function testTokenVerification(token) {
  try {
    console.log(`\n🔍 Testing token verification...`);
    
    const response = await httpClient.get('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data) {
      console.log(`✅ Token verification successful`);
      console.log(`User data: ${JSON.stringify(response.data, null, 2)}`);
      return { success: true, user: response.data };
    } else {
      console.log(`❌ Token verification failed: No user data`);
      return { success: false, error: 'No user data' };
    }
  } catch (error) {
    console.log(`❌ Token verification failed:`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Message: ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function testLogout(token) {
  try {
    console.log(`\n🚪 Testing logout...`);
    
    const response = await httpClient.post('/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`✅ Logout successful`);
    mockLocalStorage.removeItem('token');
    mockLocalStorage.removeItem('user');
    
    return { success: true };
  } catch (error) {
    console.log(`❌ Logout failed:`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Message: ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

// Main test function
async function runAuthenticationTests() {
  console.log('🚀 Starting Authentication Flow Tests');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('=' * 50);

  let passedTests = 0;
  let totalTests = 0;

  for (const testUser of testUsers) {
    console.log(`\n${'='.repeat(30)}`);
    console.log(`Testing ${testUser.role.toUpperCase()} Authentication Flow`);
    console.log(`${'='.repeat(30)}`);
    
    // Test login
    totalTests++;
    const loginResult = await testLogin(testUser.email, testUser.password, testUser.role);
    if (loginResult.success) {
      passedTests++;
      
      // Test token verification
      totalTests++;
      const verifyResult = await testTokenVerification(loginResult.token);
      if (verifyResult.success) {
        passedTests++;
      }
      
      // Test logout
      totalTests++;
      const logoutResult = await testLogout(loginResult.token);
      if (logoutResult.success) {
        passedTests++;
      }
    } else {
      // Skip verification and logout tests if login failed
      totalTests += 2;
      console.log(`⏭️  Skipping token verification and logout tests due to login failure`);
    }
    
    // Clear localStorage between tests
    mockLocalStorage.clear();
  }

  // Final results
  console.log(`\n${'='.repeat(50)}`);
  console.log('🏁 Test Results Summary');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log(`\n🎉 All tests passed! Authentication is working correctly.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please check the error messages above.`);
  }
}

// Run the tests
runAuthenticationTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});

