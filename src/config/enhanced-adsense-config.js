/**
 * Enhanced Google AdSense Configuration for Young Eagles PWA
 * 
 * REVENUE MAXIMIZATION SETUP:
 * 1. Enable Auto Ads in AdSense dashboard
 * 2. Create all ad units listed below
 * 3. Update environment variables with actual slot IDs
 * 4. Set TEST_MODE to false for production
 * 5. Monitor performance and optimize
 */

export const ENHANCED_ADSENSE_CONFIG = {
  // Your AdSense Publisher ID
  PUBLISHER_ID: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad slot IDs - Create these in your AdSense dashboard
  AD_SLOTS: {
    // Display Ads
    MAIN_DISPLAY: import.meta.env.VITE_ADSENSE_MAIN_DISPLAY || '2894237519',
    HEADER_BANNER: import.meta.env.VITE_ADSENSE_HEADER_BANNER || '1234567890',
    FOOTER_BANNER: import.meta.env.VITE_ADSENSE_FOOTER_BANNER || '0987654321',
    
    // Sidebar Ads
    SIDEBAR_SKYSCRAPER: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER || '1122334455',
    SIDEBAR_RECTANGLE: import.meta.env.VITE_ADSENSE_SIDEBAR_RECTANGLE || '5544332211',
    
    // Mobile Ads
    MOBILE_BANNER: import.meta.env.VITE_ADSENSE_MOBILE_BANNER || '6677889900',
    MOBILE_STICKY: import.meta.env.VITE_ADSENSE_MOBILE_STICKY || '0099887766',
    
    // Native Ads (Highest RPM)
    IN_FEED_NATIVE: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE || '1357924680',
    IN_ARTICLE_NATIVE: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE || '2468135792',
    
    // Video Ads
    VIDEO_OVERLAY: import.meta.env.VITE_ADSENSE_VIDEO_OVERLAY || '3691472583',
    VIDEO_REWARD: import.meta.env.VITE_ADSENSE_VIDEO_REWARD || '4815926374',
    
    // Premium Feature Ads
    PREMIUM_GATE: import.meta.env.VITE_ADSENSE_PREMIUM_GATE || '5927384615',
    UPGRADE_PROMPT: import.meta.env.VITE_ADSENSE_UPGRADE_PROMPT || '6148372695'
  },
  
  // Standard ad sizes optimized for revenue
  AD_SIZES: {
    // Banner Ads
    LEADERBOARD: [728, 90],        // Desktop header/footer - High RPM
    BANNER: [468, 60],             // Standard banner
    MOBILE_BANNER: [320, 50],      // Mobile banner
    
    // Rectangle Ads (Best Performance)
    LARGE_RECTANGLE: [336, 280],   // Large rectangle - Highest RPM
    MEDIUM_RECTANGLE: [300, 250],  // Medium rectangle - Most popular
    SMALL_RECTANGLE: [250, 250],   // Small rectangle
    
    // Skyscraper Ads
    WIDE_SKYSCRAPER: [160, 600],   // Wide skyscraper - Good for sidebar
    SKYSCRAPER: [120, 600],        // Standard skyscraper
    
    // Square Ads
    LARGE_SQUARE: [336, 280],      // Large square
    SMALL_SQUARE: [200, 200],      // Small square
    
    // Native Ad Sizes
    NATIVE_RESPONSIVE: 'fluid',    // Responsive native ads
    
    // Video Ad Sizes
    VIDEO_PLAYER: [640, 360],      // Video player size
    VIDEO_MOBILE: [320, 180]       // Mobile video size
  },
  
  // Ad placement strategies based on user behavior
  PLACEMENT_STRATEGIES: {
    FREE_TIER: {
      frequency: 'high',
      positions: ['header', 'content', 'sidebar', 'footer', 'inline'],
      adTypes: ['display', 'native', 'video'],
      adsPerSession: 5,
      upgradePrompts: true
    },
    TRIAL_USER: {
      frequency: 'medium',
      positions: ['content', 'sidebar'],
      adTypes: ['display', 'premium_teaser'],
      adsPerSession: 3,
      upgradePrompts: true
    },
    PREMIUM: {
      frequency: 'none',
      positions: [],
      adTypes: [],
      adsPerSession: 0,
      upgradePrompts: false
    }
  },
  
  // Page-specific ad configurations
  PAGE_CONFIGS: {
    dashboard: {
      priority: 'high',
      adLimit: 3,
      positions: ['header', 'sidebar', 'content'],
      nativeAds: true
    },
    homework: {
      priority: 'high',
      adLimit: 4,
      positions: ['header', 'inline', 'sidebar', 'bottom'],
      nativeAds: true,
      videoAds: true
    },
    classes: {
      priority: 'medium',
      adLimit: 2,
      positions: ['content', 'sidebar'],
      nativeAds: true
    },
    activities: {
      priority: 'medium',
      adLimit: 2,
      positions: ['content', 'footer'],
      videoAds: true
    },
    login: {
      priority: 'low',
      adLimit: 1,
      positions: ['footer'],
      nativeAds: false
    }
  },
  
  // Mobile-specific configurations
  MOBILE_CONFIG: {
    stickyBottom: true,
    interstitialFrequency: 'medium',
    videoRewards: true,
    nativeInFeed: true,
    maxAdsPerScreen: 2
  },
  
  // Revenue optimization settings
  REVENUE_OPTIMIZATION: {
    // Enable different ad formats
    enableAutoAds: true,
    enableNativeAds: true,
    enableVideoAds: true,
    enableInterstitialAds: true,
    
    // A/B testing
    enableABTesting: true,
    testAdPositions: true,
    testAdFrequency: true,
    
    // User segmentation
    enableUserSegmentation: true,
    trackUserBehavior: true,
    personalizeAdExperience: true
  },
  
  // Environment settings
  TEST_MODE: import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' || import.meta.env.MODE === 'development',
  ENABLED: import.meta.env.VITE_ADSENSE_ENABLED === 'true',
  
  // AdSense script URL
  SCRIPT_URL: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  
  // Analytics and tracking
  ANALYTICS: {
    trackAdViews: true,
    trackAdClicks: true,
    trackUserInteraction: true,
    trackRevenue: true,
    sendToGA: true
  },
  
  // Performance settings
  PERFORMANCE: {
    lazyLoadAds: true,
    deferNonCriticalAds: true,
    optimizeForMobile: true,
    enableCaching: true
  },
  
  // User experience settings
  USER_EXPERIENCE: {
    respectUserPreferences: true,
    showAdLabels: true,
    preventAdBlockDetection: false,
    gracefulFallbacks: true
  },
  
  // Subscription integration
  SUBSCRIPTION_INTEGRATION: {
    showUpgradePrompts: true,
    upgradePromptFrequency: 'medium',
    freeUserLimitations: true,
    adRemovalUpsell: true
  }
};

// Helper functions for ad management
export const AdHelpers = {
  // Get ad configuration based on user type
  getAdConfig: (userType, page) => {
    const strategy = ENHANCED_ADSENSE_CONFIG.PLACEMENT_STRATEGIES[userType] || 
                    ENHANCED_ADSENSE_CONFIG.PLACEMENT_STRATEGIES.FREE_TIER;
    const pageConfig = ENHANCED_ADSENSE_CONFIG.PAGE_CONFIGS[page] || 
                      ENHANCED_ADSENSE_CONFIG.PAGE_CONFIGS.dashboard;
    
    return {
      ...strategy,
      ...pageConfig
    };
  },
  
  // Check if ad should be shown
  shouldShowAd: (userType, position, page, userBehavior) => {
    if (userType === 'PREMIUM') return false;
    
    const config = AdHelpers.getAdConfig(userType, page);
    
    // Check position allowed
    if (!config.positions.includes(position)) return false;
    
    // Check ad limit
    if (userBehavior.adsViewed >= config.adsPerSession) return false;
    
    return true;
  },
  
  // Get optimal ad size for position
  getOptimalSize: (position, isMobile) => {
    if (isMobile) {
      return position === 'banner' ? 
        ENHANCED_ADSENSE_CONFIG.AD_SIZES.MOBILE_BANNER :
        ENHANCED_ADSENSE_CONFIG.AD_SIZES.MEDIUM_RECTANGLE;
    }
    
    const sizeMap = {
      header: ENHANCED_ADSENSE_CONFIG.AD_SIZES.LEADERBOARD,
      footer: ENHANCED_ADSENSE_CONFIG.AD_SIZES.LEADERBOARD,
      sidebar: ENHANCED_ADSENSE_CONFIG.AD_SIZES.WIDE_SKYSCRAPER,
      content: ENHANCED_ADSENSE_CONFIG.AD_SIZES.LARGE_RECTANGLE,
      inline: ENHANCED_ADSENSE_CONFIG.AD_SIZES.MEDIUM_RECTANGLE
    };
    
    return sizeMap[position] || ENHANCED_ADSENSE_CONFIG.AD_SIZES.MEDIUM_RECTANGLE;
  },
  
  // Track ad performance
  trackAdPerformance: (adId, event, value) => {
    if (!ENHANCED_ADSENSE_CONFIG.ANALYTICS.trackAdViews) return;
    
    // Track with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        event_category: 'ads',
        event_label: adId,
        value: value
      });
    }
    
    // Store in localStorage for local analytics
    const adData = JSON.parse(localStorage.getItem('adPerformance') || '{}');
    adData[adId] = adData[adId] || { views: 0, clicks: 0 };
    adData[adId][event] = (adData[adId][event] || 0) + 1;
    localStorage.setItem('adPerformance', JSON.stringify(adData));
  }
};

export default ENHANCED_ADSENSE_CONFIG; 