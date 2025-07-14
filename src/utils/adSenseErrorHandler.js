/* eslint-env browser */
/* global CustomEvent */
// AdSense Error Handler and Fallback System
// Addresses 403 errors and provides graceful degradation

class AdSenseErrorHandler {
  constructor() {
    this.errorCount = 0;
    this.maxErrors = 5;
    this.fallbackMode = false;
    this.retryDelays = [1000, 3000, 5000, 10000, 30000]; // Progressive retry delays
    this.blockedDomains = new Set();
    this.adBlockDetected = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return; // Prevent double initialization
    
    this.detectAdBlocker();
    this.setupErrorHandling();
    this.monitorAdSenseStatus();
    this.initialized = true;
  }

  // Detect ad blockers
  detectAdBlocker() {
    // Create a test element that ad blockers typically block
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-9999px';
    testAd.style.fontSize = '1px';
    
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      if (isBlocked) {
        this.adBlockDetected = true;
        console.log('🚫 Ad blocker detected');
        this.handleAdBlocker();
      }
      document.body.removeChild(testAd);
    }, 100);
  }

  // Handle ad blocker detection
  handleAdBlocker() {
    // Store ad blocker status
    localStorage.setItem('adBlockDetected', 'true');
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('adBlockDetected', {
      detail: { detected: true }
    }));
  }

  // Setup comprehensive error handling
  setupErrorHandling() {
    // Monitor script loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target.src) {
        const src = event.target.src;
        if (this.isAdSenseRelated(src)) {
          this.handleAdSenseError('script_load_error', { src, error: event.error });
        }
      }
    });

    // Monitor fetch/XHR errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for AdSense related requests
        if (args[0] && this.isAdSenseRelated(args[0])) {
          if (response.status === 403) {
            this.handleAdSenseError('fetch_403', { url: args[0], status: response.status });
          } else if (!response.ok) {
            this.handleAdSenseError('fetch_error', { url: args[0], status: response.status });
          }
        }
        
        return response;
      } catch (error) {
        if (args[0] && this.isAdSenseRelated(args[0])) {
          this.handleAdSenseError('fetch_exception', { url: args[0], error: error.message });
        }
        throw error;
      }
    };

    // Monitor AdSense specific errors
    window.addEventListener('adsbygoogle-error', (event) => {
      this.handleAdSenseError('adsbygoogle_error', event.detail);
    });
  }

  // Check if URL/resource is AdSense related
  isAdSenseRelated(url) {
    const adSenseDomains = [
      'googlesyndication.com',
      'doubleclick.net',
      'googleadservices.com',
      'google.com/ads',
      'adtrafficquality.google',
      'googletagservices.com'
    ];
    
    return adSenseDomains.some(domain => url.includes(domain));
  }

  // Handle AdSense errors
  handleAdSenseError(errorType, details = {}) {
    this.errorCount++;
    
    const errorInfo = {
      type: errorType,
      timestamp: new Date().toISOString(),
      count: this.errorCount,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.warn('🚨 AdSense Error:', errorInfo);

    // Store error in localStorage for debugging
    const errors = JSON.parse(localStorage.getItem('adSenseErrors') || '[]');
    errors.push(errorInfo);
    
    // Keep only last 20 errors
    if (errors.length > 20) {
      errors.splice(0, errors.length - 20);
    }
    
    localStorage.setItem('adSenseErrors', JSON.stringify(errors));

    // Handle specific error types
    switch (errorType) {
    case 'fetch_403':
      this.handle403Error(details);
      break;
    case 'script_load_error':
      this.handleScriptError(details);
      break;
    case 'adsbygoogle_error':
      this.handleAdSenseSpecificError(details);
      break;
    }

    // Enable fallback mode if too many errors
    if (this.errorCount >= this.maxErrors && !this.fallbackMode) {
      this.enableFallbackMode();
    }

    // Dispatch error event for other components
    window.dispatchEvent(new CustomEvent('adSenseError', {
      detail: errorInfo
    }));
  }

  // Handle 403 Forbidden errors
  handle403Error(details) {
    console.warn('🚫 AdSense 403 Error - likely due to policy violation or invalid configuration:', details);
    
    // Mark domain as problematic
    if (details.url) {
      const domain = new URL(details.url).hostname;
      this.blockedDomains.add(domain);
    }

    // Suggest fixes
    const suggestions = [
      'Check AdSense account status',
      'Verify site is approved for AdSense',
      'Check ad placement policies',
      'Verify CSP allows AdSense domains',
      'Check for invalid ad unit IDs'
    ];

    console.log('💡 Suggested fixes:', suggestions);
  }

  // Handle script loading errors
  handleScriptError(details) {
    console.warn('📜 AdSense Script Error:', details);
    
    // Try to reload the script with a delay
    const retryDelay = this.retryDelays[Math.min(this.errorCount - 1, this.retryDelays.length - 1)];
    
    setTimeout(() => {
      this.retryAdSenseScript(details.src);
    }, retryDelay);
  }

  // Handle AdSense specific errors
  handleAdSenseSpecificError(details) {
    console.warn('📊 AdSense Specific Error:', details);
    
    // Common AdSense error codes and their meanings
    const errorMeanings = {
      'no_ad_found': 'No ads available for this request',
      'ad_blocked': 'Ad was blocked by ad blocker',
      'invalid_slot': 'Invalid ad slot ID',
      'policy_violation': 'Content policy violation detected'
    };

    if (details.code && errorMeanings[details.code]) {
      console.log('📋 Error meaning:', errorMeanings[details.code]);
    }
  }

  // Retry loading AdSense script
  retryAdSenseScript(originalSrc) {
    // Remove existing script
    const existingScript = document.querySelector(`script[src="${originalSrc}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new script
    const script = document.createElement('script');
    script.src = originalSrc;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('✅ AdSense script retry successful');
    };
    
    script.onerror = () => {
      console.error('❌ AdSense script retry failed');
    };

    document.head.appendChild(script);
  }

  // Enable fallback mode
  enableFallbackMode() {
    this.fallbackMode = true;
    console.warn('🔄 Enabling AdSense fallback mode');
    
    // Store fallback status
    localStorage.setItem('adSenseFallbackMode', 'true');
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('adSenseFallbackMode', {
      detail: { enabled: true, reason: 'too_many_errors' }
    }));
  }

  // Monitor AdSense status
  monitorAdSenseStatus() {
    setInterval(() => {
      this.checkAdSenseHealth();
    }, 30000); // Check every 30 seconds
  }

  // Check AdSense health
  checkAdSenseHealth() {
    // Check if AdSense script is loaded
    const adSenseScript = document.querySelector('script[src*="googlesyndication.com"]');
    const adSenseLoaded = !!window.adsbygoogle;
    
    // Check for ad elements
    const adElements = document.querySelectorAll('.adsbygoogle');
    const loadedAds = Array.from(adElements).filter(ad => ad.offsetHeight > 0).length;
    
    const healthStatus = {
      scriptLoaded: !!adSenseScript,
      adSenseInitialized: adSenseLoaded,
      totalAdSlots: adElements.length,
      loadedAds: loadedAds,
      errorCount: this.errorCount,
      fallbackMode: this.fallbackMode,
      adBlockDetected: this.adBlockDetected
    };

    // Log health status periodically
    if (process.env.NODE_ENV === 'development') {
      console.log('🏥 AdSense Health Check:', healthStatus);
    }

    // Store health status
    localStorage.setItem('adSenseHealth', JSON.stringify(healthStatus));
  }

  // Get error statistics
  getErrorStats() {
    const errors = JSON.parse(localStorage.getItem('adSenseErrors') || '[]');
    const errorTypes = {};
    
    errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorTypes,
      fallbackMode: this.fallbackMode,
      adBlockDetected: this.adBlockDetected,
      blockedDomains: Array.from(this.blockedDomains)
    };
  }

  // Clear error history
  clearErrors() {
    localStorage.removeItem('adSenseErrors');
    localStorage.removeItem('adSenseFallbackMode');
    this.errorCount = 0;
    this.fallbackMode = false;
    this.blockedDomains.clear();
  }

  // Reset to normal mode
  resetToNormalMode() {
    this.clearErrors();
    console.log('🔄 AdSense reset to normal mode');
    
    window.dispatchEvent(new CustomEvent('adSenseReset', {
      detail: { mode: 'normal' }
    }));
  }
}

// Create global instance
const adSenseErrorHandler = new AdSenseErrorHandler();

// Export for use in other modules
export default adSenseErrorHandler;
