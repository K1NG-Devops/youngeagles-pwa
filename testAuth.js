#!/usr/bin/env node

// Test Authentication Flow
import authService from './src/services/authService.js';
import { API_CONFIG } from './src/config/api.js';

// Mock toast for testing (since we're not in React environment)
global.toast = {
  success: (msg) => console.log('✅ SUCCESS:', msg),
  error: (msg) => console.log('❌ ERROR:', msg),
  info: (msg) => console.log('ℹ️  INFO:', msg)
};

// Mock localStorage for Node.js environment
if (typeof localStorage === 'undefined') {
  const LocalStorage = {
    _data: {},
    getItem(key) {
      return this._data[key] || null;
    },
    setItem(key, value) {
      this._data[key] = value;
    },
    removeItem(key) {
      delete this._data[key];
    },
    clear() {
      this._data = {};
    }
  };
  global.localStorage = LocalStorage;
}

async function testAuthentication() {
  console.log('🚀 Starting Authentication Flow Test\n');
  
  console.log('📋 API Configuration:');
  console.log('- Base URL:', API_CONFIG.BASE_URL);
  console.log('- Environment:', API_CONFIG.isDevelopment ? 'Development' : 'Production');
  console.log('- Login Endpoint:', API_CONFIG.ENDPOINTS.LOGIN);
  console.log('');

  // Test credentials - these will either hit the real API or fallback to mock
  const testCredentials = [
    {
      email: 'parent@test.com',
      password: 'password123',
      role: 'parent'
    },
    {
      email: 'teacher@test.com',
      password: 'password123',
      role: 'teacher'
    },
    {
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    }
  ];

  for (const credentials of testCredentials) {
    console.log(`\n🔐 Testing ${credentials.role.toUpperCase()} login...`);
    console.log(`📧 Email: ${credentials.email}`);
    
    try {
      // Attempt login
      const result = await authService.login(
        credentials.email,
        credentials.password,
        credentials.role
      );

      console.log('✅ Login successful!');
      console.log('👤 User:', result.user.name || result.user.email);
      console.log('🎭 Role:', result.role);
      console.log('🔑 Token:', result.token ? 'Generated' : 'None');
      
      // Test authentication state
      console.log('\n📊 Authentication State:');
      console.log('- Is Logged In:', authService.isLoggedIn());
      console.log('- Current User:', authService.getCurrentUser()?.email);
      console.log('- User Role:', authService.getUserRole());
      console.log('- Has Token:', !!authService.getToken());

      // Test token verification if we have a real token
      if (authService.getToken() && !authService.getToken().startsWith('mock-')) {
        console.log('\n🔍 Testing token verification...');
        try {
          await authService.verifyToken();
          console.log('✅ Token verification successful');
        } catch (verifyError) {
          console.log('❌ Token verification failed:', verifyError.message);
        }
      }

      // Logout for next test
      console.log('\n👋 Logging out...');
      await authService.logout();
      console.log('Logout complete');

    } catch (error) {
      console.log('❌ Login failed:', error.message);
    }

    console.log('\n' + '='.repeat(50));
  }

  console.log('\n🏁 Authentication test completed!');
  
  // Show final state
  console.log('\n📊 Final State:');
  console.log('- Is Authenticated:', authService.isLoggedIn());
  console.log('- Current User:', authService.getCurrentUser());
  console.log('- Token:', authService.getToken());
}

// Run the test
testAuthentication().catch(error => {
  console.error('🚨 Test failed:', error);
  process.exit(1);
});

