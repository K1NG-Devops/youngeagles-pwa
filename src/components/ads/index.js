/**
 * Young Eagles PWA - Ads Module Exports
 * 
 * This file exports all ad-related components and utilities
 * for easy importing throughout the application.
 */

// Export ad components
export { default as GoogleAdSense } from './GoogleAdSense';
export { default as BannerAd } from './BannerAd';
export { default as SidebarAd } from './SidebarAd';
export { default as YoungEaglesMainDisplay } from './YoungEaglesMainDisplay';
export { default as FlexibleAdSense } from './FlexibleAdSense';
export { default as AdPlacement } from './AdPlacement';
export { default as SmartAdManager } from './SmartAdManager';

// Export hooks
export { useAdSense } from '../../hooks/useAdSense';

// Export configuration
export { ADSENSE_CONFIG } from '../../config/adsense-config';
export { ADMOB_CONFIG } from '../../config/admob-config';
