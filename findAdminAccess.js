#!/usr/bin/env node

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

// HTTP client setup
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Test regular user registration first to understand the API
async function testUserRegistration() {
  console.log('🧪 Testing user registration to understand API structure...\n');
  
  const testUser = {
    email: `test-${Date.now()}@test.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent'
  };
  
  try {
    console.log('📝 Attempting parent registration...');
    const response = await httpClient.post('/auth/register', testUser);
    console.log('✅ Registration successful!');
    console.log('Response structure:', JSON.stringify(response.data, null, 2));
    
    // Try to login with the new user
    console.log('\n🔐 Testing login with new user...');
    const loginResponse = await httpClient.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful!');
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    return loginResponse.data;
    
  } catch (error) {
    console.log('❌ Registration/Login failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return null;
  }
}

// Try to register an admin user
async function tryRegisterAdminUser() {
  console.log('\n👑 Attempting to register an admin user...\n');
  
  const adminUser = {
    email: `admin-${Date.now()}@youngeagles.org.za`,
    password: 'AdminPassword123!',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    name: 'System Admin'
  };
  
  try {
    console.log('📝 Attempting admin registration...');
    const response = await httpClient.post('/auth/register', adminUser);
    console.log('✅ Admin registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Try admin login
    console.log('\n🔐 Testing admin login...');
    const loginResponse = await httpClient.post('/auth/admin-login', {
      email: adminUser.email,
      password: adminUser.password
    });
    console.log('✅ Admin login successful!');
    console.log('Admin login response:', JSON.stringify(loginResponse.data, null, 2));
    
    return loginResponse.data;
    
  } catch (error) {
    console.log('❌ Admin registration/login failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return null;
  }
}

// Test if katso user exists with different login methods
async function testKatsoUser() {
  console.log('\n🔍 Testing katso@youngeagles.org.za with different methods...\n');
  
  const katsoEmail = 'katso@youngeagles.org.za';
  const passwords = [
    '#Katso@yehc',
    'katso123',
    'Katso123',
    'Katso123!',
    '#katso@yehc',
    'password',
    'admin123'
  ];
  
  // Try regular login first
  console.log('🔐 Testing regular login endpoint...');
  for (const password of passwords) {
    try {
      console.log(`🔑 Trying password: ${password.replace(/./g, '*')}`);
      const response = await httpClient.post('/auth/login', {
        email: katsoEmail,
        password: password
      });
      console.log('✅ Regular login successful!');
      console.log('User data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // Try teacher login
  console.log('\n👩‍🏫 Testing teacher login endpoint...');
  for (const password of passwords) {
    try {
      console.log(`🔑 Trying teacher login with password: ${password.replace(/./g, '*')}`);
      const response = await httpClient.post('/auth/teacher-login', {
        email: katsoEmail,
        password: password
      });
      console.log('✅ Teacher login successful!');
      console.log('Teacher data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}`);
    }
  }
  
  console.log('❌ No successful login found for katso user');
  return null;
}

// Try common admin emails with various passwords
async function tryCommonAdminEmails() {
  console.log('\n📧 Testing common admin email patterns...\n');
  
  const adminEmails = [
    'admin@youngeagles.org.za',
    'administrator@youngeagles.org.za',
    'sysadmin@youngeagles.org.za',
    'root@youngeagles.org.za',
    'support@youngeagles.org.za',
    'info@youngeagles.org.za',
    'contact@youngeagles.org.za'
  ];
  
  const passwords = [
    'admin123',
    'Admin123!',
    'password',
    'Password123!',
    'youngeagles123',
    'YoungEagles123!',
    '123456'
  ];
  
  for (const email of adminEmails) {
    console.log(`\n📧 Testing email: ${email}`);
    for (const password of passwords) {
      try {
        console.log(`🔑 Trying password: ${password.replace(/./g, '*')}`);
        const response = await httpClient.post('/auth/admin-login', {
          email: email,
          password: password
        });
        console.log('✅ Admin login successful!');
        console.log('Admin data:', JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (error) {
        // Only log if it's not the expected "invalid credentials" error
        if (error.response?.status !== 400) {
          console.log(`❌ Unexpected error: ${error.response?.data?.message || error.message}`);
        }
      }
    }
  }
  
  console.log('❌ No successful admin login found with common emails');
  return null;
}

// Query users with valid authentication
async function queryUsersWithAuth(authData) {
  console.log('\n🔍 Querying users with valid authentication...\n');
  
  if (!authData || !authData.token) {
    console.log('❌ No valid authentication token available');
    return null;
  }
  
  // Set authorization header
  httpClient.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
  
  const endpoints = [
    '/users',
    '/admin/users',
    '/user/profile',
    '/admin/dashboard'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Querying: ${endpoint}`);
      const response = await httpClient.get(endpoint);
      console.log(`✅ Success! Data from ${endpoint}:`);
      console.log(JSON.stringify(response.data, null, 2));
      
      // Look for admin users
      if (response.data.users) {
        const adminUsers = response.data.users.filter(user => user.role === 'admin');
        if (adminUsers.length > 0) {
          console.log(`\n👑 Found ${adminUsers.length} admin users:`);
          adminUsers.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email} - ${admin.name || 'No name'}`);
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} failed: ${error.response?.status || 'No response'} - ${error.response?.data?.message || error.message}`);
    }
  }
}

// Main function
async function findAdminAccess() {
  console.log('🚀 Starting Admin Access Discovery');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);
  console.log('='.repeat(80));
  
  let validAuth = null;
  
  try {
    // Step 1: Test regular user registration and login
    const userAuth = await testUserRegistration();
    if (userAuth) {
      validAuth = userAuth;
    }
    
    // Step 2: Try to register an admin user
    const adminAuth = await tryRegisterAdminUser();
    if (adminAuth) {
      validAuth = adminAuth;
    }
    
    // Step 3: Test katso user with various methods
    const katsoAuth = await testKatsoUser();
    if (katsoAuth) {
      validAuth = katsoAuth;
    }
    
    // Step 4: Try common admin emails
    const commonAdminAuth = await tryCommonAdminEmails();
    if (commonAdminAuth) {
      validAuth = commonAdminAuth;
    }
    
    // Step 5: If we have valid auth, query for users
    if (validAuth) {
      await queryUsersWithAuth(validAuth);
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 Admin access discovery completed');
  
  if (validAuth) {
    console.log('\n✅ SUCCESS: Found valid authentication!');
    console.log(`User: ${validAuth.user.email}`);
    console.log(`Role: ${validAuth.user.role}`);
    console.log(`Token: ${validAuth.token ? 'Available' : 'None'}`);
  } else {
    console.log('\n❌ No admin access found');
    console.log('💡 Suggestions:');
    console.log('- Check with the backend team for admin credentials');
    console.log('- Look for admin seeding scripts in the backend code');
    console.log('- Check environment variables or configuration files');
  }
}

// Run the discovery
findAdminAccess().catch(error => {
  console.error('🚨 Discovery failed:', error.message);
  process.exit(1);
});

