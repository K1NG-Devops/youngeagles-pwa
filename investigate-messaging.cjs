#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 INVESTIGATING MESSAGING FUNCTIONALITY AND PRODUCTION READINESS\n');

// Function to analyze file content
function analyzeFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`✅ ${description}: EXISTS`);
      return { exists: true, content, lines: content.split('\n').length };
    } else {
      console.log(`❌ ${description}: MISSING`);
      return { exists: false };
    }
  } catch (error) {
    console.log(`⚠️  ${description}: ERROR - ${error.message}`);
    return { exists: false, error: error.message };
  }
}

// Function to check specific patterns in content
function checkPatterns(content, patterns, description) {
  console.log(`\n📋 Checking ${description}:`);
  patterns.forEach(({ pattern, label, critical = false }) => {
    const found = content.includes(pattern);
    const icon = found ? (critical ? '🟢' : '✅') : (critical ? '🔴' : '⚠️');
    console.log(`  ${icon} ${label}: ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// 1. MESSAGING FUNCTIONALITY ANALYSIS
console.log('📱 MESSAGING FUNCTIONALITY ANALYSIS\n');
console.log('=' .repeat(50));

// Check main messaging components
const messagingFiles = [
  { path: 'src/components/MessagingCenter.jsx', name: 'MessagingCenter' },
  { path: 'src/components/MessagingSystem/WhatsAppMessaging.jsx', name: 'WhatsApp Messaging' },
  { path: 'src/services/messagingService.js', name: 'Messaging Service' },
  { path: 'src/services/parentService.js', name: 'Parent Service' },
  { path: 'src/components/PWALayout.jsx', name: 'PWA Layout (Routing)' }
];

const messagingAnalysis = {};
messagingFiles.forEach(file => {
  const analysis = analyzeFile(file.path, file.name);
  messagingAnalysis[file.name] = analysis;
});

// Check routing configuration
console.log('\n🚀 ROUTING ANALYSIS\n');
if (messagingAnalysis['PWA Layout (Routing)'].exists) {
  const routingContent = messagingAnalysis['PWA Layout (Routing)'].content;
  
  checkPatterns(routingContent, [
    { pattern: 'path="/messages"', label: 'Messages Route Defined', critical: true },
    { pattern: 'WhatsAppMessaging', label: 'WhatsApp Component Route', critical: true },
    { pattern: 'MessagingCenter', label: 'Messaging Center Route' },
    { pattern: 'PrivateRoutePWA', label: 'Protected Route', critical: true },
    { pattern: 'Navigate', label: 'Navigation Logic' }
  ], 'Routing Configuration');
}

// Check messaging service integration
console.log('\n💬 MESSAGING SERVICE ANALYSIS\n');
if (messagingAnalysis['Messaging Service'].exists) {
  const messagingServiceContent = messagingAnalysis['Messaging Service'].content;
  
  checkPatterns(messagingServiceContent, [
    { pattern: 'websocketService', label: 'WebSocket Integration', critical: true },
    { pattern: 'parentService', label: 'Backend API Integration', critical: true },
    { pattern: 'sendMessage', label: 'Send Message Function', critical: true },
    { pattern: 'loadConversations', label: 'Load Conversations', critical: true },
    { pattern: 'handleNewMessage', label: 'Real-time Message Handling', critical: true }
  ], 'Messaging Service Features');
}

// Check authentication integration
console.log('\n🔐 AUTHENTICATION ANALYSIS\n');
const authFiles = [
  { path: 'src/components/PWA/PrivateRoutePWA.jsx', name: 'Private Route' },
  { path: 'src/hooks/useAuth.js', name: 'Auth Hook' }
];

authFiles.forEach(file => {
  analyzeFile(file.path, file.name);
});

// 2. PRODUCTION READINESS ASSESSMENT
console.log('\n🏭 PRODUCTION READINESS ASSESSMENT\n');
console.log('=' .repeat(50));

// Check PWA features
console.log('\n📱 PWA FEATURES\n');
const pwaFiles = [
  { path: 'dist/manifest.json', name: 'App Manifest' },
  { path: 'dist/sw.js', name: 'Service Worker' },
  { path: 'dist/offline.html', name: 'Offline Page' },
  { path: 'dist/firebase-messaging-sw.js', name: 'Push Notifications SW' }
];

const pwaAnalysis = {};
pwaFiles.forEach(file => {
  const analysis = analyzeFile(file.path, file.name);
  pwaAnalysis[file.name] = analysis;
});

// Check configuration files
console.log('\n⚙️  CONFIGURATION FILES\n');
const configFiles = [
  { path: 'package.json', name: 'Package Configuration' },
  { path: 'vite.config.js', name: 'Vite Configuration' },
  { path: '.env', name: 'Environment Variables' },
  { path: '.env.production', name: 'Production Environment' }
];

const configAnalysis = {};
configFiles.forEach(file => {
  const analysis = analyzeFile(file.path, file.name);
  configAnalysis[file.name] = analysis;
});

// Check security and performance
console.log('\n🔒 SECURITY & PERFORMANCE\n');
if (configAnalysis['Package Configuration'].exists) {
  const packageContent = configAnalysis['Package Configuration'].content;
  
  checkPatterns(packageContent, [
    { pattern: '"build":', label: 'Build Script', critical: true },
    { pattern: '"preview":', label: 'Preview Script' },
    { pattern: '"test":', label: 'Test Scripts' },
    { pattern: 'vite-plugin-pwa', label: 'PWA Plugin', critical: true },
    { pattern: 'firebase', label: 'Firebase Integration' },
    { pattern: 'react-router-dom', label: 'Routing Library', critical: true }
  ], 'Dependencies & Scripts');
}

// Check environment configuration
console.log('\n🌍 ENVIRONMENT CONFIGURATION\n');
if (configAnalysis['Environment Variables'].exists) {
  const envContent = configAnalysis['Environment Variables'].content;
  
  checkPatterns(envContent, [
    { pattern: 'VITE_API_BASE_URL', label: 'API Base URL' },
    { pattern: 'VITE_FIREBASE', label: 'Firebase Config' },
    { pattern: 'VITE_WEBSOCKET', label: 'WebSocket Config' }
  ], 'Environment Variables');
}

// 3. POTENTIAL ISSUES ANALYSIS
console.log('\n🚨 POTENTIAL ISSUES ANALYSIS\n');
console.log('=' .repeat(50));

const issues = [];

// Check for common redirect issues
if (messagingAnalysis['PWA Layout (Routing)'].exists) {
  const routingContent = messagingAnalysis['PWA Layout (Routing)'].content;
  
  if (!routingContent.includes('path="/messages"')) {
    issues.push({
      severity: 'HIGH',
      category: 'Routing',
      issue: 'Messages route not properly defined',
      solution: 'Add /messages route to PWALayout.jsx routing configuration'
    });
  }
  
  if (routingContent.includes('Navigate to="/login"') && routingContent.includes('/*')) {
    issues.push({
      severity: 'MEDIUM',
      category: 'Routing',
      issue: 'Catch-all route may redirect authenticated users to login',
      solution: 'Review catch-all route logic and authentication checks'
    });
  }
}

// Check authentication flow
if (messagingAnalysis['Private Route'].exists) {
  const privateRouteContent = fs.readFileSync('src/components/PWA/PrivateRoutePWA.jsx', 'utf8');
  
  if (privateRouteContent.includes('Navigate to="/login"')) {
    issues.push({
      severity: 'MEDIUM',
      category: 'Authentication',
      issue: 'Private route redirects to login - may affect messaging access',
      solution: 'Verify authentication state management and token validation'
    });
  }
}

// Check for missing backend integration
if (!fs.existsSync('src/config/api.js')) {
  issues.push({
    severity: 'HIGH',
    category: 'Backend',
    issue: 'Missing API configuration file',
    solution: 'Create API configuration with proper backend endpoints'
  });
}

// 4. PRODUCTION READINESS SCORE
console.log('\n📊 PRODUCTION READINESS SCORE\n');
console.log('=' .repeat(50));

let score = 0;
let maxScore = 0;

// PWA Features (25 points)
maxScore += 25;
if (pwaAnalysis['App Manifest']?.exists) score += 7;
if (pwaAnalysis['Service Worker']?.exists) score += 8;
if (pwaAnalysis['Offline Page']?.exists) score += 5;
if (pwaAnalysis['Push Notifications SW']?.exists) score += 5;

// Core Functionality (25 points)
maxScore += 25;
if (messagingAnalysis['MessagingCenter']?.exists) score += 5;
if (messagingAnalysis['WhatsApp Messaging']?.exists) score += 8;
if (messagingAnalysis['Messaging Service']?.exists) score += 7;
if (messagingAnalysis['Parent Service']?.exists) score += 5;

// Configuration & Build (25 points)
maxScore += 25;
if (configAnalysis['Package Configuration']?.exists) score += 8;
if (configAnalysis['Vite Configuration']?.exists) score += 7;
if (configAnalysis['Environment Variables']?.exists) score += 5;
if (fs.existsSync('dist/index.html')) score += 5;

// Security & Performance (25 points)
maxScore += 25;
if (fs.existsSync('src/hooks/useAuth.js')) score += 8;
if (configAnalysis['Package Configuration']?.content?.includes('eslint')) score += 5;
if (configAnalysis['Package Configuration']?.content?.includes('vitest')) score += 5;
if (fs.existsSync('.gitignore')) score += 3;
if (fs.existsSync('README.md')) score += 4;

const percentage = Math.round((score / maxScore) * 100);

console.log(`Overall Score: ${score}/${maxScore} (${percentage}%)\n`);

// Score interpretation
let rating, recommendation;
if (percentage >= 90) {
  rating = "🟢 EXCELLENT";
  recommendation = "Ready for production deployment";
} else if (percentage >= 80) {
  rating = "🟡 GOOD";
  recommendation = "Minor issues to address before production";
} else if (percentage >= 70) {
  rating = "🟠 FAIR";
  recommendation = "Several issues need fixing before production";
} else if (percentage >= 60) {
  rating = "🔴 POOR";
  recommendation = "Major issues must be resolved before production";
} else {
  rating = "🚫 CRITICAL";
  recommendation = "Significant development work required";
}

console.log(`Production Readiness: ${rating}`);
console.log(`Recommendation: ${recommendation}\n`);

// 5. DETAILED ISSUES AND SOLUTIONS
if (issues.length > 0) {
  console.log('\n🔧 ISSUES FOUND AND SOLUTIONS\n');
  console.log('=' .repeat(50));
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.severity}] ${issue.category}: ${issue.issue}`);
    console.log(`   Solution: ${issue.solution}\n`);
  });
}

// 6. RECOMMENDATIONS
console.log('\n💡 PRODUCTION RECOMMENDATIONS\n');
console.log('=' .repeat(50));

console.log('🚀 Immediate Actions:');
console.log('1. Test messaging functionality with backend API');
console.log('2. Verify authentication flow and token management');
console.log('3. Test offline functionality and service worker');
console.log('4. Validate PWA installation on different devices');
console.log('5. Set up proper environment variables for production');

console.log('\n🔧 Technical Improvements:');
console.log('1. Implement proper error handling and user feedback');
console.log('2. Add loading states and skeleton screens');
console.log('3. Optimize bundle size (currently >1MB)');
console.log('4. Add comprehensive test coverage');
console.log('5. Implement proper logging and monitoring');

console.log('\n📱 User Experience:');
console.log('1. Test cross-platform compatibility');
console.log('2. Verify responsive design on all screen sizes');
console.log('3. Test push notifications on real devices');
console.log('4. Validate accessibility features');
console.log('5. Optimize performance for low-end devices');

console.log('\n🏁 ANALYSIS COMPLETE\n');
console.log(`Production Readiness Rating: ${Math.round(percentage/10)}/10`);
