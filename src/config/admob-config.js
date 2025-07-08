/**
 * AdMob Configuration for React Native Implementation
 * 
 * Note: These IDs are for mobile apps only (React Native)
 * For web/PWA, use Google AdSense instead
 */

export const ADMOB_CONFIG = {
  // App ID for AdMob
  APP_ID: 'ca-app-pub-2808416461095370~5549139256',
  
  // Ad Unit IDs
  AD_UNITS: {
    APP_OPEN: 'ca-app-pub-2808416461095370/5230123792'
    // Add more ad units here as you create them
    // BANNER: 'ca-app-pub-2808416461095370/XXXXXXXXXX',
    // INTERSTITIAL: 'ca-app-pub-2808416461095370/XXXXXXXXXX',
    // REWARDED: 'ca-app-pub-2808416461095370/XXXXXXXXXX',
  },
  
  // Test IDs for development (use these during development)
  TEST_IDS: {
    APP_OPEN: 'ca-app-pub-3940256099942544/5662855259',
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917'
  }
};

/**
 * React Native AdMob Implementation Guide:
 * 
 * 1. Install react-native-google-mobile-ads:
 *    npm install react-native-google-mobile-ads
 * 
 * 2. Initialize AdMob in your App.js:
 *    import mobileAds from 'react-native-google-mobile-ads';
 *    mobileAds().initialize();
 * 
 * 3. App Open Ad Example:
 *    import { AppOpenAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
 *    
 *    const appOpenAd = AppOpenAd.createForAdRequest(ADMOB_CONFIG.AD_UNITS.APP_OPEN);
 *    appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
 *      appOpenAd.show();
 *    });
 *    appOpenAd.load();
 */
