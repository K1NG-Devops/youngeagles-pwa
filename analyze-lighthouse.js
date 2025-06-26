#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Lighthouse report
const reportPath = path.join(__dirname, 'lighthouse-full-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('❌ Lighthouse report not found. Please run the audit first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('🔍 LIGHTHOUSE PWA AUDIT ANALYSIS');
console.log('=================================\n');

// Display overall scores
console.log('📊 OVERALL SCORES');
console.log('------------------');
const categories = report.categories;
Object.keys(categories).forEach(categoryId => {
  const category = categories[categoryId];
  const score = Math.round(category.score * 100);
  const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
  console.log(`${emoji} ${category.title}: ${score}%`);
});

console.log('\n🔧 PWA-SPECIFIC AUDITS');
console.log('------------------------');

// PWA-relevant audit IDs
const pwaAudits = [
  'service-worker',
  'works-offline',
  'is-on-https',
  'viewport',
  'installable-manifest',
  'splash-screen',
  'themed-omnibox',
  'content-width',
  'apple-touch-icon',
  'pwa-cross-browser',
  'pwa-page-transitions',
  'pwa-each-page-has-url'
];

const audits = report.audits;
let pwaScore = 0;
let pwaTotal = 0;

pwaAudits.forEach(auditId => {
  if (audits[auditId]) {
    const audit = audits[auditId];
    const passed = audit.score === 1;
    const emoji = passed ? '✅' : (audit.score === null ? '⚠️' : '❌');
    const score = audit.score !== null ? Math.round(audit.score * 100) + '%' : 'N/A';
    
    console.log(`${emoji} ${audit.title}`);
    console.log(`   Score: ${score}`);
    
    if (audit.description) {
      console.log(`   ${audit.description}`);
    }
    
    if (audit.details && audit.details.items && audit.details.items.length > 0) {
      console.log(`   Details: ${audit.details.items.length} items found`);
    }
    
    if (!passed && audit.explanation) {
      console.log(`   Issue: ${audit.explanation}`);
    }
    
    console.log('');
    
    if (audit.score !== null) {
      pwaScore += audit.score;
      pwaTotal++;
    }
  }
});

// Calculate PWA readiness score
const pwaReadiness = pwaTotal > 0 ? Math.round((pwaScore / pwaTotal) * 100) : 0;
console.log(`📱 PWA Readiness: ${pwaReadiness}%\n`);

// Service Worker specific analysis
console.log('🔧 SERVICE WORKER ANALYSIS');
console.log('---------------------------');

if (audits['service-worker']) {
  const swAudit = audits['service-worker'];
  console.log(`Status: ${swAudit.score === 1 ? '✅ Registered' : '❌ Not found'}`);
  if (swAudit.details && swAudit.details.items) {
    swAudit.details.items.forEach(item => {
      console.log(`URL: ${item.url}`);
      console.log(`Status: ${item.status}`);
    });
  }
}

// Manifest analysis
console.log('\n📋 WEB APP MANIFEST ANALYSIS');
console.log('-----------------------------');

if (audits['installable-manifest']) {
  const manifestAudit = audits['installable-manifest'];
  console.log(`Status: ${manifestAudit.score === 1 ? '✅ Valid' : '❌ Issues found'}`);
  
  if (manifestAudit.details && manifestAudit.details.items) {
    manifestAudit.details.items.forEach(item => {
      if (item.failures && item.failures.length > 0) {
        console.log('Issues:');
        item.failures.forEach(failure => {
          console.log(`- ${failure}`);
        });
      }
    });
  }
}

// Performance impact on PWA
console.log('\n⚡ PERFORMANCE IMPACT');
console.log('---------------------');

const performanceMetrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'total-blocking-time',
  'cumulative-layout-shift'
];

performanceMetrics.forEach(metricId => {
  if (audits[metricId]) {
    const metric = audits[metricId];
    const score = Math.round(metric.score * 100);
    const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    console.log(`${emoji} ${metric.title}: ${metric.displayValue} (${score}%)`);
  }
});

// Network requests analysis
console.log('\n🌐 NETWORK ANALYSIS');
console.log('-------------------');

if (audits['network-requests'] && audits['network-requests'].details) {
  const networkDetails = audits['network-requests'].details;
  if (networkDetails.items) {
    const requests = networkDetails.items;
    const swRequests = requests.filter(req => req.url.includes('/sw.js'));
    const manifestRequests = requests.filter(req => req.url.includes('manifest'));
    const iconRequests = requests.filter(req => req.url.includes('icon-'));
    
    console.log(`Total requests: ${requests.length}`);
    console.log(`Service Worker requests: ${swRequests.length}`);
    console.log(`Manifest requests: ${manifestRequests.length}`);
    console.log(`Icon requests: ${iconRequests.length}`);
    
    // Check if service worker loaded successfully
    swRequests.forEach(req => {
      const status = req.statusCode === 200 ? '✅' : '❌';
      console.log(`${status} Service Worker: ${req.statusCode} - ${req.url}`);
    });
  }
}

// Recommendations
console.log('\n🎯 RECOMMENDATIONS');
console.log('------------------');

const recommendations = [];

if (audits['service-worker'] && audits['service-worker'].score !== 1) {
  recommendations.push('Fix service worker registration issues');
}

if (audits['works-offline'] && audits['works-offline'].score !== 1) {
  recommendations.push('Ensure app works offline');
}

if (audits['installable-manifest'] && audits['installable-manifest'].score !== 1) {
  recommendations.push('Fix web app manifest issues');
}

if (categories.performance && categories.performance.score < 0.9) {
  recommendations.push('Improve performance scores for better PWA experience');
}

if (recommendations.length === 0) {
  console.log('🎉 Excellent! Your PWA meets all major requirements.');
} else {
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

console.log('\n✨ SUMMARY');
console.log('----------');
console.log(`Overall PWA Readiness: ${pwaReadiness >= 80 ? '🟢' : pwaReadiness >= 60 ? '🟡' : '🔴'} ${pwaReadiness}%`);

if (pwaReadiness >= 90) {
  console.log('🚀 Excellent! Your PWA is production-ready.');
} else if (pwaReadiness >= 70) {
  console.log('✅ Good! Minor improvements needed.');
} else {
  console.log('🔧 Needs work before production deployment.');
}

console.log('\n📖 View full report: lighthouse-full-report.json');
