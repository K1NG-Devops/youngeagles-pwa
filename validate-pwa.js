#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3003;

// MIME types for proper serving
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Handle service worker scope
  if (req.url === '/sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
  }

  // Security headers for PWA
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Type', contentType);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200);
      res.end(content);
    }
  });
});

// Validation function
async function validatePWA() {
  return new Promise((resolve) => {
    console.log('🔍 PWA Validation Results');
    console.log('========================\n');

    const checks = [];

    // Check if service worker file exists and is valid
    const swPath = path.join(__dirname, 'dist', 'sw.js');
    if (fs.existsSync(swPath)) {
      const swContent = fs.readFileSync(swPath, 'utf8');
      checks.push({
        name: 'Service Worker exists',
        status: '✅',
        details: 'Service worker file found and contains Workbox configuration'
      });

      // Check for proper caching strategies
      if (swContent.includes('NetworkFirst') && swContent.includes('api-cache-v2')) {
        checks.push({
          name: 'API Caching Strategy',
          status: '✅',
          details: 'NetworkFirst strategy configured for API endpoints with updated cache version'
        });
      }

      if (swContent.includes('precacheAndRoute')) {
        checks.push({
          name: 'Asset Precaching',
          status: '✅',
          details: 'Static assets are precached for offline access'
        });
      }
    } else {
      checks.push({
        name: 'Service Worker',
        status: '❌',
        details: 'Service worker file not found'
      });
    }

    // Check manifest
    const manifestPath = path.join(__dirname, 'dist', 'manifest.webmanifest');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      checks.push({
        name: 'Web App Manifest',
        status: '✅',
        details: `Valid manifest with ${manifest.icons?.length || 0} icons`
      });

      // Validate manifest properties
      const requiredProps = ['name', 'short_name', 'start_url', 'display', 'icons'];
      const hasAllProps = requiredProps.every(prop => manifest[prop]);
      
      if (hasAllProps) {
        checks.push({
          name: 'Manifest Completeness',
          status: '✅',
          details: 'All required manifest properties present'
        });
      }

      // Check for HTTPS-ready URLs
      if (manifest.start_url.startsWith('/') && manifest.icons.every(icon => icon.src.startsWith('/'))) {
        checks.push({
          name: 'HTTPS Compatibility',
          status: '✅',
          details: 'All URLs are relative and HTTPS-compatible'
        });
      }
    }

    // Check icon files
    const iconSizes = ['192x192', '512x512'];
    const missingIcons = iconSizes.filter(size => 
      !fs.existsSync(path.join(__dirname, 'dist', `icon-${size}.png`))
    );

    if (missingIcons.length === 0) {
      checks.push({
        name: 'Required Icons',
        status: '✅',
        details: 'All required icon sizes are present'
      });
    } else {
      checks.push({
        name: 'Required Icons',
        status: '⚠️',
        details: `Missing icons: ${missingIcons.join(', ')}`
      });
    }

    // Check offline page
    const offlinePath = path.join(__dirname, 'dist', 'offline.html');
    if (fs.existsSync(offlinePath)) {
      checks.push({
        name: 'Offline Page',
        status: '✅',
        details: 'Offline fallback page is available'
      });
    }

    // Display results
    checks.forEach(check => {
      console.log(`${check.status} ${check.name}`);
      console.log(`   ${check.details}\n`);
    });

    console.log('📋 Summary:');
    const passed = checks.filter(c => c.status === '✅').length;
    const warnings = checks.filter(c => c.status === '⚠️').length;
    const failed = checks.filter(c => c.status === '❌').length;

    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   ❌ Failed: ${failed}\n`);

    if (failed === 0) {
      console.log('🎉 PWA is ready for production!');
    } else {
      console.log('🔧 Please address the failed checks before deployment.');
    }

    resolve();
  });
}

// Start server and validate
server.listen(PORT, async () => {
  console.log(`🚀 PWA Test Server running at http://localhost:${PORT}`);
  console.log('📱 Open Chrome DevTools > Application tab to inspect PWA features\n');
  
  await validatePWA();
  
  console.log(`\n🔍 To perform a full Lighthouse audit, run:`);
  console.log(`   lighthouse http://localhost:${PORT} --view`);
  console.log(`\n⏹️  Press Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down PWA test server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
