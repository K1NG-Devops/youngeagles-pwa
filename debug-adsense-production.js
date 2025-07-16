// AdSense Production Debug Script
// Add this to browser console on https://youngeagles.org.za

console.log('=== AdSense Debug Information ===');

// Check if AdSense script is loaded
console.log('AdSense script loaded:', typeof window.adsbygoogle !== 'undefined');
console.log('AdSense array:', window.adsbygoogle);

// Check for AdSense elements
const adElements = document.querySelectorAll('ins[data-ad-client]');
console.log('AdSense elements found:', adElements.length);

adElements.forEach((ad, index) => {
  console.log(`Ad ${index + 1}:`, {
    client: ad.dataset.adClient,
    slot: ad.dataset.adSlot,
    format: ad.dataset.adFormat,
    status: ad.dataset.adStatus,
    element: ad
  });
});

// Check environment variables (if exposed)
console.log('Environment check:');
console.log('- Production mode:', typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown');

// Check for placeholder elements
const placeholders = document.querySelectorAll('.adsense-placeholder');
console.log('AdSense placeholders found:', placeholders.length);

// Check for malicious ad scripts (updated to be more specific)
const actualSuspiciousScripts = document.querySelectorAll('script[src*="doubleclick"]:not([src*="googlesyndication"]), script[src*="ads"]:not([src*="google"])');
console.log('Actually suspicious ad scripts:', actualSuspiciousScripts.length);

if (actualSuspiciousScripts.length > 0) {
  console.warn('⚠️ Actually suspicious ad scripts detected:');
  actualSuspiciousScripts.forEach(script => console.log('- ', script.src));
} else {
  console.log('✅ No suspicious ad scripts detected');
}

// Check AdSense status more thoroughly
console.log('\n=== AdSense Status Check ===');
const adElements2 = document.querySelectorAll('ins[data-ad-client]');
adElements2.forEach((ad, index) => {
  console.log(`Ad ${index + 1} detailed status:`, {
    client: ad.dataset.adClient,
    slot: ad.dataset.adSlot,
    format: ad.dataset.adFormat,
    status: ad.dataset.adStatus,
    innerHTML: ad.innerHTML,
    hasContent: ad.innerHTML.trim().length > 0,
    dimensions: {
      width: ad.offsetWidth,
      height: ad.offsetHeight
    }
  });
});

// Check if AdSense is actually trying to serve ads
if (window.adsbygoogle && window.adsbygoogle.pageState) {
  console.log('\n✅ AdSense page state:', window.adsbygoogle.pageState);
} else {
  console.log('\n❌ AdSense page state not available');
}

// Check page source for your AdSense publisher ID
const pageSource = document.documentElement.outerHTML;
const hasYourPublisherId = pageSource.includes('ca-pub-5506438806314781');
console.log('Your AdSense publisher ID found in page:', hasYourPublisherId);

// === FINAL FIX FOR AD CROPPING - IFRAME CONTENT HANDLING ===
console.log('\n=== AdSense Container Width Fix ===');

// Check current ad container widths
const adContainers = document.querySelectorAll('ins[data-ad-client]');
adContainers.forEach((ad, index) => {
  const computedStyle = window.getComputedStyle(ad);
  const parentStyle = window.getComputedStyle(ad.parentElement);
  
  console.log(`Ad ${index + 1} container analysis:`, {
    element: ad,
    currentWidth: ad.offsetWidth,
    currentHeight: ad.offsetHeight,
    computedWidth: computedStyle.width,
    computedHeight: computedStyle.height,
    parentWidth: ad.parentElement.offsetWidth,
    parentComputedWidth: parentStyle.width,
    display: computedStyle.display,
    visibility: computedStyle.visibility,
    position: computedStyle.position
  });
  
  // FINAL Auto-fix for all containers (even if they have width)
  console.log(`🔧 FINAL Auto-fixing Ad ${index + 1} for iframe content`);
  
  // Get ad format for responsive sizing
  const adFormat = ad.dataset.adFormat || 'auto';
  const adSlot = ad.dataset.adSlot;
  
  // Apply responsive sizing based on ad format - NO CROPPING
  if (adFormat === 'rectangle' || adSlot === '1707587859') {
    // Medium Rectangle (300x250) - exact standard size
    ad.style.setProperty('width', '300px', 'important');
    ad.style.setProperty('height', '250px', 'important');
    ad.style.setProperty('max-width', '300px', 'important');
    ad.style.setProperty('max-height', '250px', 'important');
    console.log(`📐 Applied Rectangle sizing: 300x250 (fixed)`);
  } else if (adFormat === 'fluid' || adSlot === '6408733271') {
    // Native/Fluid ads - flexible but not too wide
    ad.style.setProperty('width', '100%', 'important');
    ad.style.setProperty('max-width', '500px', 'important');
    ad.style.setProperty('min-width', '300px', 'important');
    ad.style.setProperty('height', '200px', 'important');
    ad.style.setProperty('min-height', '100px', 'important');
    console.log(`📐 Applied Fluid sizing: responsive (max 500px)`);
  } else {
    // Auto format - responsive banner but not too wide
    ad.style.setProperty('width', '100%', 'important');
    ad.style.setProperty('max-width', '728px', 'important');
    ad.style.setProperty('min-width', '320px', 'important');
    ad.style.setProperty('height', '90px', 'important');
    console.log(`📐 Applied Auto sizing: responsive banner (max 728px)`);
  }
  
  // CLEAN: Styles for proper ad display (no debug borders)
  ad.style.setProperty('display', 'block', 'important');
  ad.style.setProperty('margin', '15px auto', 'important');
  ad.style.setProperty('padding', '0', 'important');
  ad.style.setProperty('box-sizing', 'content-box', 'important');
  ad.style.setProperty('background', 'transparent', 'important');
  ad.style.setProperty('border', 'none', 'important'); // Remove debug border
  ad.style.setProperty('text-align', 'center', 'important');
  ad.style.setProperty('overflow', 'visible', 'important');
  ad.style.setProperty('position', 'relative', 'important');
  
  // Fix iframe content inside ad containers
  const iframes = ad.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    iframe.style.setProperty('width', '100%', 'important');
    iframe.style.setProperty('height', '100%', 'important');
    iframe.style.setProperty('border', 'none', 'important');
    iframe.style.setProperty('margin', '0', 'important');
    iframe.style.setProperty('padding', '0', 'important');
    console.log(`🔧 Fixed iframe in Ad ${index + 1}`);
  });
    
  // Fix parent containers up the chain - PREVENT CROPPING
  let parent = ad.parentElement;
  let level = 0;
  while (parent && level < 3) {
    console.log(`🔧 Fixing parent level ${level}:`, parent);
    parent.style.setProperty('width', '100%', 'important');
    parent.style.setProperty('min-width', '320px', 'important');
    parent.style.setProperty('display', 'block', 'important');
    parent.style.setProperty('padding', '0', 'important');
    parent.style.setProperty('margin', '0', 'important');
    parent.style.setProperty('box-sizing', 'content-box', 'important');
    parent.style.setProperty('overflow', 'visible', 'important'); // Allow content to show
    parent = parent.parentElement;
    level++;
  }
  
  // Force reflow
  ad.offsetHeight;
  
  console.log(`✅ FINAL Fixed Ad ${index + 1} (${adFormat}) - New width: ${ad.offsetWidth}px`);
});

// Clear existing AdSense and re-initialize with persistent monitoring
setTimeout(() => {
  if (window.adsbygoogle) {
    console.log('🔄 CLEARING AND RE-INITIALIZING AdSense...');
    
    // Clear all ad containers completely
    const ads = document.querySelectorAll('ins[data-ad-client]');
    ads.forEach(ad => {
      ad.innerHTML = '';
      ad.removeAttribute('data-adsbygoogle-status');
      ad.removeAttribute('data-ad-status');
      ad.removeAttribute('data-ad-slot');
      
      // Remove any debug styling
      ad.style.removeProperty('background');
      ad.style.removeProperty('border');
    });
    
    // Wait a moment for cleanup
    setTimeout(() => {
      // Re-trigger AdSense for containers with width
      ads.forEach((ad, index) => {
        if (ad.offsetWidth > 0) {
          console.log(`🔄 Re-triggering Ad ${index + 1} with width ${ad.offsetWidth}px`);
          try {
            (adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.log('AdSense re-trigger attempt:', e.message);
          }
        } else {
          console.log(`❌ Skipping Ad ${index + 1} - still has 0 width`);
        }
      });
      
      // PERSISTENT MONITORING: Keep fixing dimensions every 2 seconds
      const persistentFix = setInterval(() => {
        const allAds = document.querySelectorAll('ins[data-ad-client]');
        allAds.forEach((ad, index) => {
          const adFormat = ad.dataset.adFormat || 'auto';
          const adSlot = ad.dataset.adSlot;
          
          // Check if dimensions have been reset and fix them
          if (ad.offsetWidth !== ad.expectedWidth || ad.offsetHeight !== ad.expectedHeight) {
            console.log(`🔄 Re-fixing Ad ${index + 1} dimensions...`);
            
            // Reapply size fixes
            if (adFormat === 'rectangle' || adSlot === '1707587859') {
              ad.style.setProperty('width', '300px', 'important');
              ad.style.setProperty('height', '250px', 'important');
              ad.style.setProperty('max-width', '300px', 'important');
              ad.style.setProperty('max-height', '250px', 'important');
              ad.expectedWidth = 300;
              ad.expectedHeight = 250;
            } else if (adFormat === 'fluid' || adSlot === '6408733271') {
              ad.style.setProperty('width', '100%', 'important');
              ad.style.setProperty('max-width', '500px', 'important');
              ad.style.setProperty('min-width', '300px', 'important');
              ad.style.setProperty('height', '200px', 'important');
              ad.style.setProperty('min-height', '100px', 'important');
              ad.expectedWidth = Math.min(500, ad.parentElement.offsetWidth);
              ad.expectedHeight = 200;
            } else {
              ad.style.setProperty('width', '100%', 'important');
              ad.style.setProperty('max-width', '728px', 'important');
              ad.style.setProperty('min-width', '320px', 'important');
              ad.style.setProperty('height', '90px', 'important');
              ad.expectedWidth = Math.min(728, ad.parentElement.offsetWidth);
              ad.expectedHeight = 90;
            }
            
            // Reapply clean styles
            ad.style.setProperty('display', 'block', 'important');
            ad.style.setProperty('margin', '15px auto', 'important');
            ad.style.setProperty('padding', '0', 'important');
            ad.style.setProperty('box-sizing', 'content-box', 'important');
            ad.style.setProperty('background', 'transparent', 'important');
            ad.style.setProperty('border', 'none', 'important');
            ad.style.setProperty('text-align', 'center', 'important');
            ad.style.setProperty('overflow', 'visible', 'important');
            ad.style.setProperty('position', 'relative', 'important');
            
            // Fix iframes again
            const iframes = ad.querySelectorAll('iframe');
            iframes.forEach(iframe => {
              iframe.style.setProperty('width', '100%', 'important');
              iframe.style.setProperty('height', '100%', 'important');
              iframe.style.setProperty('border', 'none', 'important');
              iframe.style.setProperty('margin', '0', 'important');
              iframe.style.setProperty('padding', '0', 'important');
            });
          }
        });
      }, 2000);
      
      // Stop monitoring after 30 seconds
      setTimeout(() => {
        clearInterval(persistentFix);
        console.log('✅ AdSense persistent monitoring stopped');
      }, 30000);
      
    }, 500);
  }
}, 2000);

console.log('=== End Debug Information ===');