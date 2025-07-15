// Ad configuration utility
export const adConfig = {
  // Check if ads are enabled
  isEnabled: () => {
    return import.meta.env.VITE_ADSENSE_ENABLED === 'true' && 
           import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  },
  
  // Check if specific ad unit is configured
  hasAdUnit: (adUnit) => {
    return adUnit && adUnit.length > 0;
  },
  
  // Get publisher ID
  getPublisherId: () => {
    return import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  },
  
  // Get ad units
  getAdUnits: () => {
    return {
      header: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
      footer: import.meta.env.VITE_ADSENSE_FOOTER_BANNER,
      sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
      content: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
      native: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
      mobile: import.meta.env.VITE_ADSENSE_MOBILE_BANNER
    };
  },
  
  // Check if AdSense script is loaded
  isScriptLoaded: () => {
    return typeof window !== 'undefined' && 
           window.adsbygoogle && 
           Array.isArray(window.adsbygoogle);
  },
  
  // Initialize AdSense if not already initialized
  initializeAdSense: () => {
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      window.adsbygoogle = [];
    }
  },
  
  // Check if we're in test mode
  isTestMode: () => {
    return import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';
  }
};

export default adConfig;
