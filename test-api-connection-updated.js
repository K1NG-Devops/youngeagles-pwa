#!/usr/bin/env node

// Updated API Connection Test
// Tests connectivity to the Young Eagles API server

import http from 'http';
import https from 'https';
import { URL } from 'url';

// API endpoints to test
const endpoints = [
  'https://youngeagles-api-server.up.railway.app/',           // Root server
  'https://youngeagles-api-server.up.railway.app/api',       // API base path
  'https://youngeagles-api-server.up.railway.app/health',    // Health check (if exists)
  'http://localhost:3000/api',                                // Local development
];

function testConnection(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Young Eagles PWA Connection Test',
          'Accept': 'application/json, text/plain, */*'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            url,
            success: true,
            status: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            body: data.substring(0, 500) // First 500 chars only
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          url,
          success: false,
          error: error.message,
          code: error.code
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          success: false,
          error: 'Request timeout (10s)',
          code: 'TIMEOUT'
        });
      });

      req.end();
    } catch (error) {
      resolve({
        url,
        success: false,
        error: error.message,
        code: 'INVALID_URL'
      });
    }
  });
}

async function runTests() {
  console.log('🚀 Young Eagles API Connection Test');
  console.log('='.repeat(50));
  console.log(`📅 Test started at: ${new Date().toISOString()}\n`);

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint}`);
    console.log('-'.repeat(30));
    
    const result = await testConnection(endpoint);
    
    if (result.success) {
      console.log('✅ Connection successful!');
      console.log(`   Status: ${result.status} ${result.statusMessage}`);
      
      // Check for common headers that indicate server type
      const headers = result.headers || {};
      if (headers['content-type']) {
        console.log(`   Content-Type: ${headers['content-type']}`);
      }
      if (headers.server) {
        console.log(`   Server: ${headers.server}`);
      }
      if (headers['x-powered-by']) {
        console.log(`   Powered-By: ${headers['x-powered-by']}`);
      }
      
      // Show first part of response body
      if (result.body) {
        const preview = result.body.trim();
        if (preview.length > 0) {
          console.log(`   Response: ${preview.substring(0, 200)}${preview.length > 200 ? '...' : ''}`);
        }
      }
    } else {
      console.log('❌ Connection failed');
      console.log(`   Error: ${result.error}`);
      if (result.code) {
        console.log(`   Code: ${result.code}`);
      }
    }
    
    console.log(''); // Empty line between tests
  }

  console.log('🏁 Test completed');
}

// Run the tests
runTests().catch(console.error);

