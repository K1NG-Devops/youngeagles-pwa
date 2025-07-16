// AdSense Production Fixes - Persistent Monitoring
// This file handles AdSense container width issues and cropping prevention

(function() {
  'use strict';
  
  console.log('🚀 AdSense Production Fixes Loading...');
  
  // Configuration
  const CONFIG = {
    monitoringInterval: 2000, // Check every 2 seconds
    monitoringDuration: 30000, // Monitor for 30 seconds
    publisher: 'ca-pub-5506438806314781'
  };
  
  // AdSense Container Fix Function
  function fixAdSenseContainers() {
    const ads = document.querySelectorAll(`ins[data-ad-client="${CONFIG.publisher}"]`);
    
    ads.forEach((ad, index) => {
      const adFormat = ad.dataset.adFormat || 'auto';
      const adSlot = ad.dataset.adSlot;
      
      // Apply format-specific fixes
      if (adFormat === 'rectangle' || adSlot === '1707587859') {
        // Rectangle ads (300x250)
        ad.style.setProperty('width', '300px', 'important');
        ad.style.setProperty('height', '250px', 'important');
        ad.style.setProperty('max-width', '300px', 'important');
        ad.style.setProperty('max-height', '250px', 'important');
        ad.expectedWidth = 300;
        ad.expectedHeight = 250;
      } else if (adFormat === 'fluid' || adSlot === '6408733271') {
        // Fluid ads - responsive
        ad.style.setProperty('width', '100%', 'important');
        ad.style.setProperty('max-width', '500px', 'important');
        ad.style.setProperty('min-width', '300px', 'important');
        ad.style.setProperty('height', '200px', 'important');
        ad.style.setProperty('min-height', '100px', 'important');
        ad.expectedWidth = Math.min(500, ad.parentElement.offsetWidth);
        ad.expectedHeight = 200;
      } else {
        // Auto ads - responsive banner
        ad.style.setProperty('width', '100%', 'important');
        ad.style.setProperty('max-width', '728px', 'important');
        ad.style.setProperty('min-width', '320px', 'important');
        ad.style.setProperty('height', '90px', 'important');
        ad.expectedWidth = Math.min(728, ad.parentElement.offsetWidth);
        ad.expectedHeight = 90;
      }
      
      // Apply common styles
      ad.style.setProperty('display', 'block', 'important');
      ad.style.setProperty('margin', '15px auto', 'important');
      ad.style.setProperty('padding', '0', 'important');
      ad.style.setProperty('box-sizing', 'content-box', 'important');
      ad.style.setProperty('background', 'transparent', 'important');
      ad.style.setProperty('border', 'none', 'important');
      ad.style.setProperty('text-align', 'center', 'important');
      ad.style.setProperty('overflow', 'visible', 'important');
      ad.style.setProperty('position', 'relative', 'important');
      
      // Fix iframes
      const iframes = ad.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        iframe.style.setProperty('width', '100%', 'important');
        iframe.style.setProperty('height', '100%', 'important');
        iframe.style.setProperty('border', 'none', 'important');
        iframe.style.setProperty('margin', '0', 'important');
        iframe.style.setProperty('padding', '0', 'important');
      });
      
      // Fix parent containers
      let parent = ad.parentElement;
      let level = 0;
      while (parent && level < 3) {
        parent.style.setProperty('width', '100%', 'important');
        parent.style.setProperty('min-width', '320px', 'important');
        parent.style.setProperty('display', 'block', 'important');
        parent.style.setProperty('padding', '0', 'important');
        parent.style.setProperty('margin', '0', 'important');
        parent.style.setProperty('box-sizing', 'content-box', 'important');
        parent.style.setProperty('overflow', 'visible', 'important');
        parent = parent.parentElement;
        level++;
      }
    });
    
    return ads.length;
  }
  
  // Persistent monitoring function
  function startPersistentMonitoring() {
    console.log('🔄 Starting AdSense persistent monitoring...');
    
    const monitoringInterval = setInterval(() => {
      const adsFixed = fixAdSenseContainers();
      if (adsFixed > 0) {
        console.log(`✅ Monitored ${adsFixed} AdSense containers`);
      }
    }, CONFIG.monitoringInterval);
    
    // Stop monitoring after duration
    setTimeout(() => {
      clearInterval(monitoringInterval);
      console.log('✅ AdSense monitoring completed');
    }, CONFIG.monitoringDuration);
  }
  
  // Initialize when DOM is ready
  function initialize() {
    // Initial fix
    const initialAds = fixAdSenseContainers();
    console.log(`🎯 Initial AdSense fix applied to ${initialAds} containers`);
    
    // Start persistent monitoring
    startPersistentMonitoring();
  }
  
  // Wait for DOM and AdSense to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, wait a bit for AdSense
    setTimeout(initialize, 1000);
  }
  
  // Also run when page becomes visible (for mobile)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(fixAdSenseContainers, 500);
    }
  });
  
  console.log('✅ AdSense Production Fixes Loaded');
})();
