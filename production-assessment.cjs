#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 YOUNG EAGLES PWA - PRODUCTION READINESS ASSESSMENT\n');
console.log('=' .repeat(60));

// Core analysis functions
function checkFile(path, name) {
  const exists = fs.existsSync(path);
  console.log(`${exists ? '✅' : '❌'} ${name}: ${exists ? 'EXISTS' : 'MISSING'}`);
  return exists;
}

function analyzeContent(path, patterns, name) {
  if (!fs.existsSync(path)) return false;
  
  const content = fs.readFileSync(path, 'utf8');
  console.log(`\n📋 ${name} Analysis:`);
  
  let foundAll = true;
  patterns.forEach(({ pattern, label, critical = false }) => {
    const found = content.includes(pattern);
    const icon = found ? (critical ? '🟢' : '✅') : (critical ? '🔴' : '⚠️');
    console.log(`  ${icon} ${label}: ${found ? 'FOUND' : 'MISSING'}`);
    if (critical && !found) foundAll = false;
  });
  
  return foundAll;
}

// 1. MESSAGING FUNCTIONALITY CHECK
console.log('\n📱 MESSAGING FUNCTIONALITY\n');

const messagingScore = [];
messagingScore.push(checkFile('src/components/MessagingCenter.jsx', 'Messaging Center Component'));
messagingScore.push(checkFile('src/components/MessagingSystem/WhatsAppMessaging.jsx', 'WhatsApp Messaging Component'));
messagingScore.push(checkFile('src/services/messagingService.js', 'Messaging Service'));
messagingScore.push(checkFile('src/services/parentService.js', 'Parent Service API'));

// Check routing
const routingOK = analyzeContent('src/components/PWALayout.jsx', [
  { pattern: 'path="/messages"', label: 'Messages Route', critical: true },
  { pattern: 'WhatsAppMessaging', label: 'WhatsApp Component Route', critical: true },
  { pattern: 'PrivateRoutePWA', label: 'Authentication Protection', critical: true }
], 'Routing Configuration');

messagingScore.push(routingOK);

// 2. PWA FEATURES CHECK
console.log('\n📱 PWA FEATURES\n');

const pwaScore = [];
pwaScore.push(checkFile('dist/manifest.json', 'App Manifest'));
pwaScore.push(checkFile('dist/sw.js', 'Service Worker'));
pwaScore.push(checkFile('dist/offline.html', 'Offline Fallback'));
pwaScore.push(checkFile('dist/firebase-messaging-sw.js', 'Push Notifications'));

// Check manifest content
analyzeContent('dist/manifest.json', [
  { pattern: '"start_url":', label: 'Start URL', critical: true },
  { pattern: '"display": "standalone"', label: 'Standalone Display', critical: true },
  { pattern: '"icons":', label: 'App Icons', critical: true }
], 'App Manifest');

// 3. BUILD AND CONFIGURATION
console.log('\n⚙️  BUILD & CONFIGURATION\n');

const configScore = [];
configScore.push(checkFile('package.json', 'Package Configuration'));
configScore.push(checkFile('vite.config.js', 'Vite Configuration'));
configScore.push(checkFile('dist/index.html', 'Built Application'));
configScore.push(checkFile('.env', 'Environment Variables'));

// Check package.json
analyzeContent('package.json', [
  { pattern: '"build":', label: 'Build Script', critical: true },
  { pattern: 'vite-plugin-pwa', label: 'PWA Plugin', critical: true },
  { pattern: 'react-router-dom', label: 'Routing Library', critical: true },
  { pattern: 'firebase', label: 'Firebase Integration' }
], 'Package Configuration');

// 4. AUTHENTICATION AND SECURITY
console.log('\n🔐 AUTHENTICATION & SECURITY\n');

const securityScore = [];
securityScore.push(checkFile('src/hooks/useAuth.js', 'Authentication Hook'));
securityScore.push(checkFile('src/components/PWA/PrivateRoutePWA.jsx', 'Private Route Protection'));
securityScore.push(checkFile('.gitignore', 'Git Ignore File'));

// Check authentication
analyzeContent('src/hooks/useAuth.js', [
  { pattern: 'isAuthenticated', label: 'Authentication State', critical: true },
  { pattern: 'login', label: 'Login Function', critical: true },
  { pattern: 'logout', label: 'Logout Function', critical: true },
  { pattern: 'token', label: 'Token Management' }
], 'Authentication Hook');

// 5. IDENTIFY MESSAGING REDIRECT ISSUE
console.log('\n🔍 MESSAGING REDIRECT ISSUE ANALYSIS\n');

let redirectIssues = [];

// Check PWALayout routing
if (fs.existsSync('src/components/PWALayout.jsx')) {
  const pwaContent = fs.readFileSync('src/components/PWALayout.jsx', 'utf8');
  
  console.log('📋 Potential Redirect Issues:');
  
  // Check if messages route is properly configured
  if (!pwaContent.includes('<Route path="/messages" element={<WhatsAppMessaging />}')) {
    console.log('  🔴 Messages route not properly configured');
    redirectIssues.push('Messages route configuration issue');
  } else {
    console.log('  ✅ Messages route properly configured');
  }
  
  // Check catch-all route
  if (pwaContent.includes('path="/*"') && pwaContent.includes('Navigate to="/login"')) {
    console.log('  ⚠️  Catch-all route redirects to login - may interfere with navigation');
    redirectIssues.push('Catch-all route may redirect authenticated users');
  }
  
  // Check authentication wrapper
  if (pwaContent.includes('PrivateRoutePWA')) {
    console.log('  ✅ Messages protected by authentication');
  } else {
    console.log('  🔴 Messages not protected by authentication');
    redirectIssues.push('Messages route not protected');
  }
}

// Check authentication logic
if (fs.existsSync('src/components/PWA/PrivateRoutePWA.jsx')) {
  const privateRouteContent = fs.readFileSync('src/components/PWA/PrivateRoutePWA.jsx', 'utf8');
  
  if (privateRouteContent.includes('Navigate to="/login"')) {
    console.log('  ⚠️  Private route redirects unauthenticated users to login');
    console.log('     This is normal behavior but could cause messaging redirect if auth fails');
  }
}

// 6. CALCULATE PRODUCTION READINESS SCORE
console.log('\n📊 PRODUCTION READINESS SCORE\n');
console.log('=' .repeat(50));

const messagingPercent = (messagingScore.filter(Boolean).length / messagingScore.length) * 100;
const pwaPercent = (pwaScore.filter(Boolean).length / pwaScore.length) * 100;
const configPercent = (configScore.filter(Boolean).length / configScore.length) * 100;
const securityPercent = (securityScore.filter(Boolean).length / securityScore.length) * 100;

console.log(`📱 Messaging Functionality: ${messagingPercent.toFixed(0)}%`);
console.log(`🔧 PWA Features: ${pwaPercent.toFixed(0)}%`);
console.log(`⚙️  Configuration: ${configPercent.toFixed(0)}%`);
console.log(`🔐 Security: ${securityPercent.toFixed(0)}%`);

const overallScore = (messagingPercent + pwaPercent + configPercent + securityPercent) / 4;

console.log(`\n🎯 OVERALL SCORE: ${overallScore.toFixed(0)}%`);

// Production readiness rating
let rating, numericRating;
if (overallScore >= 90) {
  rating = '🟢 EXCELLENT (Ready for Production)';
  numericRating = 9;
} else if (overallScore >= 80) {
  rating = '🟡 GOOD (Minor fixes needed)';
  numericRating = 8;
} else if (overallScore >= 70) {
  rating = '🟠 FAIR (Several issues to fix)';
  numericRating = 7;
} else if (overallScore >= 60) {
  rating = '🔴 POOR (Major issues)';
  numericRating = 6;
} else {
  rating = '🚫 CRITICAL (Not ready)';
  numericRating = Math.floor(overallScore / 10);
}

console.log(`\n📈 Production Readiness: ${rating}`);
console.log(`📊 Numeric Rating: ${numericRating}/10`);

// 7. SPECIFIC ISSUES AND RECOMMENDATIONS
console.log('\n🔧 MESSAGING REDIRECT ISSUE\n');
console.log('=' .repeat(50));

if (redirectIssues.length > 0) {
  console.log('🚨 Issues Found:');
  redirectIssues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
} else {
  console.log('✅ No obvious routing issues detected');
}

console.log('\n💡 Recommendations to fix messaging redirect:');
console.log('1. Verify user authentication state before accessing messages');
console.log('2. Check browser developer tools for console errors');
console.log('3. Ensure backend API is running and accessible');
console.log('4. Test with valid user credentials and tokens');
console.log('5. Check network requests in browser dev tools');

// 8. BACKEND VERIFICATION RECOMMENDATIONS
console.log('\n🔗 BACKEND VERIFICATION FOR PRODUCTION\n');
console.log('=' .repeat(50));

console.log('🚀 Pre-Production Checks:');
console.log('1. API Endpoints:');
console.log('   - Verify all messaging endpoints are functional');
console.log('   - Test authentication endpoints');
console.log('   - Check CORS configuration for production domain');

console.log('\n2. Database:');
console.log('   - Verify database connections');
console.log('   - Check data integrity and relationships');
console.log('   - Ensure proper indexing for performance');

console.log('\n3. Security:');
console.log('   - Verify JWT token validation');
console.log('   - Check rate limiting and security headers');
console.log('   - Ensure HTTPS in production');

console.log('\n4. Performance:');
console.log('   - Test with realistic data volumes');
console.log('   - Verify caching strategies');
console.log('   - Check server response times');

console.log('\n5. Monitoring:');
console.log('   - Set up error logging and monitoring');
console.log('   - Configure health checks');
console.log('   - Implement performance metrics');

console.log('\n🏁 SUMMARY\n');
console.log('=' .repeat(50));
console.log(`✨ App Quality: ${numericRating}/10`);
console.log(`🎯 Production Ready: ${overallScore >= 70 ? 'YES' : 'NO'} (with fixes)`);
console.log(`🔧 Critical Issues: ${redirectIssues.length}`);
console.log(`📱 PWA Features: ${pwaPercent >= 80 ? 'Complete' : 'Needs Work'}`);

if (overallScore >= 70) {
  console.log('\n🚀 This app shows good potential for production deployment!');
  console.log('   Focus on fixing the messaging redirect issue and backend integration.');
} else {
  console.log('\n⚠️  App needs more development before production deployment.');
  console.log('   Address the issues identified above first.');
}

console.log('\n📋 Next Steps:');
console.log('1. Fix messaging redirect issue');
console.log('2. Verify backend API connectivity');
console.log('3. Test cross-platform compatibility');
console.log('4. Perform security audit');
console.log('5. Optimize performance and bundle size');
