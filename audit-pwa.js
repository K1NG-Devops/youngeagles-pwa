#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 PWA Audit Report for Young Eagles Home Care Centre');
console.log('================================================\n');

// 1. Check Service Worker Configuration
console.log('1. Service Worker Analysis');
console.log('-------------------------');

const swPath = path.join(__dirname, 'dist', 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  console.log('✅ Service Worker exists at /sw.js');
  
  // Check for precaching
  if (swContent.includes('precacheAndRoute')) {
    console.log('✅ Service Worker implements precaching strategy');
  } else {
    console.log('❌ Service Worker missing precaching configuration');
  }
  
  // Check for NetworkFirst strategy for API calls
  if (swContent.includes('NetworkFirst') && swContent.includes('youngeagles-api-server')) {
    console.log('✅ NetworkFirst strategy configured for API calls');
  } else {
    console.log('❌ NetworkFirst strategy not properly configured for API calls');
  }
  
  // Check for offline navigation routing
  if (swContent.includes('NavigationRoute')) {
    console.log('✅ Navigation routing configured for offline pages');
  } else {
    console.log('❌ Navigation routing missing for offline functionality');
  }
  
  // Check for skipWaiting and clientsClaim
  if (swContent.includes('skipWaiting') && swContent.includes('clientsClaim')) {
    console.log('✅ Service Worker lifecycle properly configured');
  } else {
    console.log('⚠️  Service Worker lifecycle might need optimization');
  }
  
} else {
  console.log('❌ Service Worker not found');
}

console.log('\n2. Web App Manifest Analysis');
console.log('-----------------------------');

const manifestPath = path.join(__dirname, 'dist', 'manifest.webmanifest');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('✅ Web App Manifest exists');
  
  // Check start_url
  if (manifest.start_url && manifest.start_url.startsWith('/')) {
    console.log(`✅ start_url configured: ${manifest.start_url}`);
  } else {
    console.log('❌ start_url not properly configured');
  }
  
  // Check icons
  if (manifest.icons && manifest.icons.length >= 2) {
    console.log(`✅ Icons configured (${manifest.icons.length} icons)`);
    
    const hasRequiredSizes = manifest.icons.some(icon => icon.sizes === '192x192') &&
                             manifest.icons.some(icon => icon.sizes === '512x512');
    
    if (hasRequiredSizes) {
      console.log('✅ Required icon sizes (192x192, 512x512) present');
    } else {
      console.log('⚠️  Missing required icon sizes');
    }
  } else {
    console.log('❌ Insufficient icons configured');
  }
  
  // Check display mode
  if (manifest.display === 'standalone') {
    console.log('✅ Display mode set to standalone');
  } else {
    console.log('⚠️  Display mode not optimized for PWA');
  }
  
  // Check theme colors
  if (manifest.theme_color && manifest.background_color) {
    console.log('✅ Theme and background colors configured');
  } else {
    console.log('⚠️  Theme colors missing');
  }
  
} else {
  console.log('❌ Web App Manifest not found');
}

console.log('\n3. Icon Files Verification');
console.log('---------------------------');

const iconSizes = ['48x48', '72x72', '96x96', '144x144', '192x192', '512x512'];
const distPath = path.join(__dirname, 'dist');

iconSizes.forEach(size => {
  const iconPath = path.join(distPath, `icon-${size}.png`);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`✅ Icon ${size} exists (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ Icon ${size} missing`);
  }
});

console.log('\n4. Offline Page Analysis');
console.log('-------------------------');

const offlinePage = path.join(__dirname, 'dist', 'offline.html');
if (fs.existsSync(offlinePage)) {
  console.log('✅ Offline page exists');
  
  const offlineContent = fs.readFileSync(offlinePage, 'utf8');
  if (offlineContent.includes('Young Eagles')) {
    console.log('✅ Offline page contains branding');
  }
  
  if (offlineContent.includes('refresh') || offlineContent.includes('reload')) {
    console.log('✅ Offline page has retry functionality');
  }
} else {
  console.log('❌ Offline page missing');
}

console.log('\n5. Build Configuration Analysis');
console.log('--------------------------------');

const viteConfigPath = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (viteConfig.includes('VitePWA')) {
    console.log('✅ VitePWA plugin configured');
  }
  
  if (viteConfig.includes('NetworkFirst')) {
    console.log('✅ NetworkFirst strategy configured in build');
  }
  
  if (viteConfig.includes('runtimeCaching')) {
    console.log('✅ Runtime caching configured');
  }
  
  if (viteConfig.includes('registerType: \'autoUpdate\'')) {
    console.log('✅ Auto-update enabled');
  }
}

console.log('\n📋 Recommendations:');
console.log('-------------------');
console.log('1. Test service worker installation in Chrome DevTools');
console.log('2. Verify API caching works in Network tab');
console.log('3. Test offline functionality by disabling network');
console.log('4. Check console for any service worker errors');
console.log('5. Verify manifest validates with Chrome DevTools');
console.log('6. Test PWA installation prompt');

console.log('\n✨ Audit completed! Check Chrome DevTools > Application tab for detailed PWA analysis.');
