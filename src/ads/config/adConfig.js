const adConfig = {
  // AdSense Configuration
  publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-test',
  
  // Ad Unit IDs
  adUnits: {
    banner: import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT || 'test-banner',
    sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_AD_UNIT || 'test-sidebar',
    footer: import.meta.env.VITE_ADSENSE_FOOTER_AD_UNIT || 'test-footer',
  },
  
  // Settings
  enabled: import.meta.env.VITE_ADSENSE_ENABLED === 'true',
  testMode: import.meta.env.VITE_ADSENSE_TEST_MODE === 'true',
  
  // Ad Sizes
  sizes: {
    banner: [[728, 90], [320, 50]], // Desktop and mobile banner
    sidebar: [[300, 250], [300, 600]], // Medium rectangle and large rectangle
    footer: [[728, 90], [320, 50]], // Same as banner
    responsive: 'auto',
  },
  
  // Ad Formats
  formats: {
    display: 'auto',
    responsive: 'auto',
    fixed: 'rectangle',
  },
  
  // Development settings
  development: {
    showPlaceholders: import.meta.env.DEV,
    debugMode: import.meta.env.DEV,
  },
};

export default adConfig;
