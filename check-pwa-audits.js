import fs from 'fs';

const report = JSON.parse(fs.readFileSync('./lighthouse-pwa-specific.json', 'utf8'));

console.log('🔍 PWA-SPECIFIC LIGHTHOUSE AUDITS');
console.log('==================================\n');

Object.keys(report.audits).forEach(auditId => {
  const audit = report.audits[auditId];
  const score = audit.score !== null ? Math.round(audit.score * 100) + '%' : 'N/A';
  const emoji = audit.score === 1 ? '✅' : audit.score === null ? '⚠️' : '❌';
  
  console.log(`${emoji} ${audit.title}: ${score}`);
  
  if (audit.score !== 1 && audit.explanation) {
    console.log(`   Issue: ${audit.explanation}`);
  }
  
  if (audit.details && audit.details.items && audit.details.items.length > 0) {
    console.log(`   Details found: ${audit.details.items.length} items`);
  }
  
  console.log('');
});
