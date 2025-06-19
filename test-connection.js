import https from 'https';

const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

console.log('Testing API connection to:', API_BASE_URL);

// Test health endpoint
const testUrl = `${API_BASE_URL}/health`;

https.get(testUrl, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ API connection successful!');
    } else {
      console.log('❌ API connection failed - unexpected status code');
    }
  });
}).on('error', (err) => {
  console.log('❌ API connection failed:', err.message);
  
  // Also test if the issue is with the specific endpoint by trying the base URL
  console.log('\nTrying base URL without /health...');
  
  https.get(API_BASE_URL.replace('/api', ''), (res) => {
    console.log(`Base URL Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Base URL Response:', data);
    });
  }).on('error', (baseErr) => {
    console.log('❌ Base URL also failed:', baseErr.message);
    console.log('\n📝 This suggests the Railway backend may not be deployed or accessible.');
  });
});

// Also test without /api path
setTimeout(() => {
  console.log('\n--- Testing without /api path ---');
  const baseTestUrl = API_BASE_URL.replace('/api', '/health');
  
  https.get(baseTestUrl, (res) => {
    console.log(`Alternative URL Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Alternative URL Response:', data);
    });
  }).on('error', (err) => {
    console.log('❌ Alternative URL failed:', err.message);
  });
}, 2000);

