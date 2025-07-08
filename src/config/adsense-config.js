/**
 * Google AdSense Configuration for Young Eagles PWA
 * 
 * PRODUCTION SETUP GUIDE:
 * 1. Sign up for Google AdSense at https://adsense.google.com/
 * 2. Add your domain and get approval
 * 3. Create ad units in your AdSense dashboard
 * 4. Replace the PUBLISHER_ID below with your actual publisher ID
 * 5. Replace the AD_SLOTS with your actual slot IDs
 * 6. Set TEST_MODE to false for production
 * 7. Add the AdSense script to your index.html
 */

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID - Get this from AdSense dashboard
  PUBLISHER_ID: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad slot IDs - Create these in your AdSense dashboard
  AD_SLOTS: {
    DISPLAY_AD: import.meta.env.VITE_ADSENSE_DISPLAY_SLOT || '1234567890',
    BANNER_AD: import.meta.env.VITE_ADSENSE_BANNER_SLOT || '0987654321',
    SIDEBAR_AD: import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT || '1122334455'
  },
  
  // Standard ad sizes (optimized for Young Eagles PWA)
  AD_SIZES: {
    BANNER: [728, 90],          // Desktop header/footer
    LEADERBOARD: [728, 90],     // Large banner
    RECTANGLE: [300, 250],      // Medium rectangle
    SIDEBAR: [160, 600],        // Sidebar skyscraper
    MOBILE_BANNER: [320, 50],   // Mobile banner
    SQUARE: [250, 250]         // Square ad
  },
  
  // Environment settings
  TEST_MODE: import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' || import.meta.env.MODE === 'development',
  
  // AdSense script URL
  SCRIPT_URL: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
};

/**
 * Environment Variables to set in your .env file:
 * 
 * VITE_ADSENSE_PUBLISHER_ID=ca-pub-your-publisher-id
 * VITE_ADSENSE_DISPLAY_SLOT=your-display-slot-id
 * VITE_ADSENSE_BANNER_SLOT=your-banner-slot-id
 * VITE_ADSENSE_SIDEBAR_SLOT=your-sidebar-slot-id
 * VITE_ADSENSE_TEST_MODE=false
 */
