import React, { useEffect, useRef } from 'react';

const YoungEaglesMainDisplay = ({ 
  className = '',
  style = {},
  disabled = false,
  adType = 'banner' // 'banner', 'sidebar', or 'footer'
}) => {
  const adRef = useRef(null);
  
  // Get environment variables
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const adsEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';
  
  // Get ad unit ID based on type
  const getAdUnitId = () => {
    switch (adType) {
    case 'sidebar':
      return import.meta.env.VITE_ADSENSE_SIDEBAR_AD_UNIT;
    case 'footer':
      return import.meta.env.VITE_ADSENSE_FOOTER_AD_UNIT;
    case 'banner':
    default:
      return import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT;
    }
  };
  
  const adSlot = getAdUnitId();

  useEffect(() => {
    // Only load ads if enabled, not disabled and window.adsbygoogle exists
    if (adsEnabled && !disabled && window.adsbygoogle && adRef.current && publisherId && adSlot) {
      try {
        // Push the ad to adsbygoogle queue
        window.adsbygoogle.push({});
      } catch (error) {
        console.warn('AdSense error:', error);
      }
    }
  }, [disabled, adsEnabled, publisherId, adSlot]);

  // Don't render if ads are disabled or missing required config
  if (!adsEnabled || disabled || !publisherId || !adSlot) {
    // Show placeholder in test mode or development
    if (testMode || import.meta.env.DEV) {
      // Theme-aware placeholder
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return (
        <div className={`youngeagles-ad-container ${className}`} style={style}>
          <div 
            className={`flex items-center justify-center rounded-xl border-2 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
            style={{ minHeight: '160px', ...style }}
          >
            <div className={`text-center w-full ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <p className="text-lg font-bold mb-1">📢 Ad Placeholder</p>
              <p className="text-xs mb-1">Your ad will appear here when live</p>
              <p className="text-xs italic opacity-70">(AdSense approval pending)</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`youngeagles-ad-container ${className}`} style={style}>
      {/* YoungEagles-Main-Display */}
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default YoungEaglesMainDisplay;
