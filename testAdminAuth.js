import https from 'https';

const API_BASE = 'https://youngeagles-api-server.up.railway.app/api';

// Admin credentials from user
const adminCredentials = {
  email: 'king@youngeagles.org.za',
  password: '#Olivia@17'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsedBody, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login');
  console.log('Email:', adminCredentials.email);
  console.log('Password:', adminCredentials.password.replace(/./g, '*'));
  console.log('============================================================\n');

  const url = new URL(`${API_BASE}/auth/login`);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, adminCredentials);
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.token) {
      console.log('✅ Admin login successful!');
      console.log('🎫 Token received:', response.data.token.substring(0, 20) + '...');
      
      // Test a protected endpoint with the token
      console.log('\n🔒 Testing protected endpoint with token...');
      const protectedOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: '/api/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${response.data.token}`,
          'Accept': 'application/json'
        }
      };
      
      const protectedResponse = await makeRequest(protectedOptions);
      console.log('Protected endpoint status:', protectedResponse.status);
      console.log('Protected endpoint data:', JSON.stringify(protectedResponse.data, null, 2));
      
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('🚨 Request failed:', error.message);
  }
}

testAdminLogin();

