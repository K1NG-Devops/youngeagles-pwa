import React from 'react';
import GoogleAdSense from './GoogleAdSense';
import { ADSENSE_CONFIG } from '../../config/adsense-config';

/**
 * Sidebar Ad Component - Production Ready
 * Vertical sidebar ad for desktop layouts
 * Optimized for Young Eagles PWA
 */
const SidebarAd = ({ 
  className = '',
  position = 'right',
  showLabel = true 
}) => {
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="mb-4">
        {showLabel && (
          <p className="text-xs text-gray-500 mb-2 text-center">
            Advertisement
          </p>
        )}
        <GoogleAdSense
          slot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_AD}
          size={ADSENSE_CONFIG.AD_SIZES.SIDEBAR}
          format="vertical"
          className="mx-auto"
          responsive={true}
        />
      </div>
    </div>
  );
};

export default SidebarAd;
