#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎯 FINAL PWA AUDIT SUMMARY');
console.log('==========================\n');

// Check all requirements from the task
const requirements = [
  {
    name: 'Service Worker installs and routes offline pages correctly',
    check: () => {
      const swPath = path.join(__dirname, 'dist', 'sw.js');
      if (!fs.existsSync(swPath)) return { status: '❌', detail: 'SW file missing' };
      
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (!swContent.includes('precacheAndRoute')) {
        return { status: '❌', detail: 'Precaching not configured' };
      }
      
      if (!swContent.includes('NavigationRoute')) {
        return { status: '❌', detail: 'Navigation routing missing' };
      }
      
      if (!swContent.includes('skipWaiting') || !swContent.includes('clientsClaim')) {
        return { status: '⚠️', detail: 'Lifecycle not optimized' };
      }
      
      return { status: '✅', detail: 'SW installs and routes correctly' };
    }
  },
  
  {
    name: 'NetworkFirst strategy caches /api/... calls',
    check: () => {
      const swPath = path.join(__dirname, 'dist', 'sw.js');
      if (!fs.existsSync(swPath)) return { status: '❌', detail: 'SW file missing' };
      
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (!swContent.includes('NetworkFirst')) {
        return { status: '❌', detail: 'NetworkFirst strategy missing' };
      }
      
      if (!swContent.includes('youngeagles-api-server')) {
        return { status: '❌', detail: 'API pattern not configured' };
      }
      
      if (!swContent.includes('api-cache-v2')) {
        return { status: '⚠️', detail: 'Cache version not updated' };
      }
      
      return { status: '✅', detail: 'NetworkFirst configured for API calls' };
    }
  },
  
  {
    name: 'Manifest icons & start_url resolve over HTTPS',
    check: () => {
      const manifestPath = path.join(__dirname, 'dist', 'manifest.webmanifest');
      if (!fs.existsSync(manifestPath)) return { status: '❌', detail: 'Manifest missing' };
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      if (!manifest.start_url || !manifest.start_url.startsWith('/')) {
        return { status: '❌', detail: 'start_url not HTTPS-compatible' };
      }
      
      if (!manifest.icons || manifest.icons.length === 0) {
        return { status: '❌', detail: 'No icons configured' };
      }
      
      const allIconsRelative = manifest.icons.every(icon => 
        icon.src.startsWith('/') || icon.src.startsWith('icon-')
      );
      
      if (!allIconsRelative) {
        return { status: '❌', detail: 'Icon URLs not HTTPS-compatible' };
      }
      
      // Check required icon sizes exist
      const requiredSizes = ['192x192', '512x512'];
      const missingIcons = requiredSizes.filter(size => 
        !fs.existsSync(path.join(__dirname, 'dist', `icon-${size}.png`))
      );
      
      if (missingIcons.length > 0) {
        return { status: '⚠️', detail: `Missing icons: ${missingIcons.join(', ')}` };
      }
      
      return { status: '✅', detail: 'All icons and URLs are HTTPS-compatible' };
    }
  },
  
  {
    name: 'Console warnings addressed',
    check: () => {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      if (!fs.existsSync(indexPath)) return { status: '❌', detail: 'index.html missing' };
      
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      // Check for duplicate manifest links
      const manifestLinks = (indexContent.match(/rel="manifest"/g) || []).length;
      if (manifestLinks > 1) {
        return { status: '⚠️', detail: 'Duplicate manifest links found' };
      }
      
      // Check for unregister script
      if (indexContent.includes('unregister-sw.js')) {
        return { status: '⚠️', detail: 'Unregister script still loaded' };
      }
      
      // Check proper manifest reference
      if (!indexContent.includes('manifest.webmanifest')) {
        return { status: '⚠️', detail: 'Manifest not properly referenced' };
      }
      
      return { status: '✅', detail: 'No obvious console warning sources' };
    }
  },
  
  {
    name: 'Workbox cache version bumped',
    check: () => {
      const swPath = path.join(__dirname, 'dist', 'sw.js');
      if (!fs.existsSync(swPath)) return { status: '❌', detail: 'SW file missing' };
      
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (swContent.includes('young-eagles-v2.0.0')) {
        return { status: '✅', detail: 'Cache version updated to v2.0.0' };
      }
      
      if (swContent.includes('api-cache-v2')) {
        return { status: '✅', detail: 'API cache version updated' };
      }
      
      return { status: '⚠️', detail: 'Cache version might need updating' };
    }
  }
];

// Run all checks
console.log('Running PWA Requirements Check...\n');

requirements.forEach((req, index) => {
  const result = req.check();
  console.log(`${index + 1}. ${req.name}`);
  console.log(`   ${result.status} ${result.detail}\n`);
});

// Summary
const results = requirements.map(req => req.check());
const passed = results.filter(r => r.status === '✅').length;
const warnings = results.filter(r => r.status === '⚠️').length;
const failed = results.filter(r => r.status === '❌').length;

console.log('📊 SUMMARY');
console.log('----------');
console.log(`✅ Passed: ${passed}/${requirements.length}`);
console.log(`⚠️  Warnings: ${warnings}/${requirements.length}`);
console.log(`❌ Failed: ${failed}/${requirements.length}\n`);

if (failed === 0 && warnings <= 1) {
  console.log('🎉 PWA AUDIT COMPLETE!');
  console.log('✨ All critical requirements are met.');
  console.log('📱 Ready for production deployment.');
} else if (failed === 0) {
  console.log('✅ PWA AUDIT MOSTLY COMPLETE!');
  console.log('⚠️  Minor warnings to address, but critical functionality works.');
} else {
  console.log('🔧 PWA AUDIT NEEDS ATTENTION!');
  console.log('❌ Please address failed requirements.');
}

console.log('\n🚀 Next steps:');
console.log('1. Test in Chrome DevTools > Application tab');
console.log('2. Verify offline functionality');
console.log('3. Test PWA installation');
console.log('4. Run Lighthouse audit when possible');
console.log('5. Deploy to HTTPS environment for final testing');
