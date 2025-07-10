#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 YoungEagles PWA - Pre-Deployment Verification\n');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let totalChecks = 0;
let passedChecks = 0;

function checkPassed(message) {
  totalChecks++;
  passedChecks++;
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function checkFailed(message) {
  totalChecks++;
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function checkWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function checkInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Check if dist folder exists
function checkBuildExists() {
  console.log('📦 Checking Build Status...');
  
  if (fs.existsSync('dist')) {
    checkPassed('Build directory exists');
    
    // Check build files
    const buildFiles = fs.readdirSync('dist');
    if (buildFiles.length > 0) {
      checkPassed(`Build contains ${buildFiles.length} files`);
    } else {
      checkFailed('Build directory is empty');
    }
  } else {
    checkFailed('Build directory does not exist - run npm run build first');
    return false;
  }
  return true;
}

// Check PWA manifest
function checkPWAManifest() {
  console.log('\n📱 Checking PWA Manifest...');
  
  const manifestPath = 'dist/manifest.webmanifest';
  if (fs.existsSync(manifestPath)) {
    checkPassed('PWA manifest exists');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Check required fields
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color'];
      requiredFields.forEach(field => {
        if (manifest[field]) {
          checkPassed(`Manifest has ${field}: ${manifest[field]}`);
        } else {
          checkFailed(`Manifest missing required field: ${field}`);
        }
      });
      
      // Check icons
      if (manifest.icons && manifest.icons.length > 0) {
        checkPassed(`Manifest has ${manifest.icons.length} icons`);
        manifest.icons.forEach(icon => {
          checkInfo(`Icon: ${icon.sizes} - ${icon.src}`);
        });
      } else {
        checkFailed('Manifest missing icons');
      }
      
    } catch (error) {
      checkFailed(`Error reading manifest: ${error.message}`);
    }
  } else {
    checkFailed('PWA manifest not found');
  }
}

// Check service worker
function checkServiceWorker() {
  console.log('\n🔧 Checking Service Worker...');
  
  if (fs.existsSync('dist/sw.js')) {
    checkPassed('Service worker exists');
    
    const swContent = fs.readFileSync('dist/sw.js', 'utf8');
    if (swContent.includes('workbox') || swContent.includes('precache')) {
      checkPassed('Service worker appears to have caching logic');
    } else {
      checkWarning('Service worker may not have caching logic');
    }
  } else {
    checkFailed('Service worker not found');
  }
}

// Check bundle sizes
function checkBundleSize() {
  console.log('\n📊 Checking Bundle Sizes...');
  
  try {
    const distPath = 'dist';
    const files = fs.readdirSync(distPath, { withFileTypes: true });
    
    let totalSize = 0;
    const jsFiles = [];
    const cssFiles = [];
    
    files.forEach(file => {
      if (file.isFile()) {
        const filePath = path.join(distPath, file.name);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        
        if (file.name.endsWith('.js')) {
          jsFiles.push({ name: file.name, size: stats.size });
        } else if (file.name.endsWith('.css')) {
          cssFiles.push({ name: file.name, size: stats.size });
        }
      }
    });
    
    // Check total bundle size
    const totalSizeMB = totalSize / (1024 * 1024);
    checkInfo(`Total bundle size: ${totalSizeMB.toFixed(2)} MB`);
    
    if (totalSizeMB < 2) {
      checkPassed('Bundle size is under 2MB');
    } else {
      checkWarning('Bundle size exceeds 2MB - consider optimization');
    }
    
    // Show largest files
    console.log('\n📈 Largest JavaScript files:');
    jsFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach(file => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        checkInfo(`${file.name}: ${sizeMB} MB`);
      });
    
    console.log('\n🎨 CSS files:');
    cssFiles.forEach(file => {
      const sizeKB = (file.size / 1024).toFixed(2);
      checkInfo(`${file.name}: ${sizeKB} KB`);
    });
    
  } catch (error) {
    checkFailed(`Error checking bundle sizes: ${error.message}`);
  }
}

// Check environment variables
function checkEnvironment() {
  console.log('\n🌐 Checking Environment Configuration...');
  
  const envFile = '.env';
  if (fs.existsSync(envFile)) {
    checkPassed('Environment file exists');
    
    const envContent = fs.readFileSync(envFile, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    checkInfo(`Found ${lines.length} environment variables`);
    
    // Check for common variables
    const commonVars = ['VITE_API_URL', 'VITE_APP_NAME'];
    commonVars.forEach(varName => {
      if (envContent.includes(varName)) {
        checkPassed(`Environment variable ${varName} is set`);
      } else {
        checkWarning(`Environment variable ${varName} not found`);
      }
    });
  } else {
    checkWarning('No .env file found');
  }
}

// Check dependencies
function checkDependencies() {
  console.log('\n📦 Checking Dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    checkInfo(`Project name: ${packageJson.name}`);
    checkInfo(`Version: ${packageJson.version}`);
    
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    
    checkInfo(`Dependencies: ${depCount}, Dev Dependencies: ${devDepCount}`);
    
    // Check for security vulnerabilities
    try {
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      checkPassed('No moderate+ security vulnerabilities found');
    } catch (error) {
      checkWarning('Security vulnerabilities detected - run npm audit for details');
    }
    
  } catch (error) {
    checkFailed(`Error checking dependencies: ${error.message}`);
  }
}

// Check build artifacts
function checkBuildArtifacts() {
  console.log('\n🏗️  Checking Build Artifacts...');
  
  const requiredFiles = [
    'index.html',
    'manifest.webmanifest',
    'sw.js'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(`dist/${file}`)) {
      checkPassed(`Required file exists: ${file}`);
    } else {
      checkFailed(`Missing required file: ${file}`);
    }
  });
  
  // Check for index.html content
  if (fs.existsSync('dist/index.html')) {
    const indexContent = fs.readFileSync('dist/index.html', 'utf8');
    
    if (indexContent.includes('YoungEagles')) {
      checkPassed('index.html contains app name');
    } else {
      checkWarning('index.html may not contain app name');
    }
    
    if (indexContent.includes('manifest')) {
      checkPassed('index.html links to manifest');
    } else {
      checkFailed('index.html missing manifest link');
    }
  }
}

// Run all checks
async function runAllChecks() {
  console.log('Starting pre-deployment checks...\n');
  
  if (!checkBuildExists()) {
    console.log(`\n${colors.red}❌ Build not found. Please run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }
  
  checkPWAManifest();
  checkServiceWorker();
  checkBundleSize();
  checkEnvironment();
  checkDependencies();
  checkBuildArtifacts();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 Pre-Deployment Check Summary:`);
  console.log(`${colors.green}✅ Passed: ${passedChecks}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${totalChecks - passedChecks}${colors.reset}`);
  console.log(`📊 Total Checks: ${totalChecks}`);
  
  const successRate = (passedChecks / totalChecks) * 100;
  console.log(`🎉 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 85) {
    console.log(`\n${colors.green}🚀 Ready for deployment!${colors.reset}`);
  } else if (successRate >= 70) {
    console.log(`\n${colors.yellow}⚠️  Nearly ready - address warnings before deployment${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Not ready for deployment - fix critical issues first${colors.reset}`);
  }
  
  // Next steps
  console.log('\n📋 Next Steps:');
  console.log('1. Run Lighthouse audit: lighthouse http://localhost:4173 --view');
  console.log('2. Test on mobile devices');
  console.log('3. Verify all user flows');
  console.log('4. Check cross-browser compatibility');
  console.log('5. Review security checklist');
  
  process.exit(successRate >= 85 ? 0 : 1);
}

// Run the checks
runAllChecks().catch(error => {
  console.error(`${colors.red}Error running checks: ${error.message}${colors.reset}`);
  process.exit(1);
}); 