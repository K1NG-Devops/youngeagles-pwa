import React from 'react';
import GoogleAdSense from './GoogleAdSense';
import { ADSENSE_CONFIG } from '../../config/adsense-config';

/**
 * Banner Ad Component - Production Ready
 * Responsive design for mobile and desktop
 * Optimized for Young Eagles PWA
 */
const BannerAd = ({ 
  className = '',
  showOnMobile = true,
  showOnDesktop = true 
}) => {
  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      {/* Desktop Banner */}
      {showOnDesktop && (
        <div className="hidden md:block w-full">
          <GoogleAdSense
            slot={ADSENSE_CONFIG.AD_SLOTS.BANNER_AD}
            size={ADSENSE_CONFIG.AD_SIZES.LEADERBOARD}
            format="horizontal"
            className="mx-auto"
            responsive={true}
          />
        </div>
      )}
      
      {/* Mobile Banner */}
      {showOnMobile && (
        <div className="block md:hidden w-full">
          <GoogleAdSense
            slot={ADSENSE_CONFIG.AD_SLOTS.BANNER_AD}
            size={ADSENSE_CONFIG.AD_SIZES.MOBILE_BANNER}
            format="horizontal"
            className="mx-auto"
            responsive={true}
          />
        </div>
      )}
    </div>
  );
};

export default BannerAd;
