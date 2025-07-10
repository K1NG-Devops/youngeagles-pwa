import React from 'react';
import GoogleAdSense from './GoogleAdSense';
import { ADSENSE_CONFIG } from '../../config/adsense-config';

/**
 * Sidebar Ad Component - Optimized for sidebar placement
 * Responsive and overflow-protected
 */
const SidebarAd = ({ 
  className = '',
  style = {},
  disabled = false
}) => {
  if (disabled) return null;

  return (
    <div className={`w-full max-w-xs mx-auto overflow-hidden ${className}`}>
      <div 
        className="w-full overflow-hidden rounded-lg"
        style={{
          maxWidth: '300px',
          minHeight: '250px',
          boxSizing: 'border-box',
          ...style
        }}
      >
        <GoogleAdSense
          slot={ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_AD}
          size={ADSENSE_CONFIG.AD_SIZES.MEDIUM_RECTANGLE}
          format="vertical"
          className="w-full max-w-full overflow-hidden"
          responsive={true}
        />
      </div>
    </div>
  );
};

export default SidebarAd;
