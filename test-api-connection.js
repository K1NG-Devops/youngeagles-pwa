import https from 'https';

const API_BASE_URL = 'https://youngeagles-api-server.up.railway.app/api';

function testAPIConnection() {
  return new Promise((resolve, reject) => {
    console.log('🔗 Testing API connection to:', API_BASE_URL);
    
    const healthUrl = `${API_BASE_URL}/health`;
    
    https.get(healthUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 Response Status:', res.statusCode);
        console.log('📊 Response Headers:', JSON.stringify(res.headers, null, 2));
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log('✅ API Health Check Successful!');
            console.log('📄 Response Data:', JSON.stringify(jsonData, null, 2));
            resolve({
              success: true,
              status: res.statusCode,
              data: jsonData
            });
          } catch (error) {
            console.log('✅ API Reachable (non-JSON response)');
            console.log('📄 Response Data:', data);
            resolve({
              success: true,
              status: res.statusCode,
              data: data
            });
          }
        } else {
          console.log('⚠️ API returned non-200 status');
          console.log('📄 Response Data:', data);
          resolve({
            success: false,
            status: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', (error) => {
      console.error('❌ Connection failed:', error.message);
      reject(error);
    });
  });
}

// Run the test
testAPIConnection()
  .then(result => {
    console.log('\n🎯 Final Result:', result);
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error.message);
  });

