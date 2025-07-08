import React, { useEffect, useRef } from 'react';

const FlexibleAdSense = ({ 
  className = "",
  style = {},
  disabled = false,
  adType = 'banner', // 'banner', 'sidebar', 'footer'
  format = 'auto', // 'auto', 'rectangle', 'vertical', 'horizontal'
  responsive = true,
  showPlaceholder = true
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
    if ((testMode || import.meta.env.DEV) && showPlaceholder) {
      const placeholderHeight = format === 'vertical' ? '600px' : format === 'horizontal' ? '90px' : '250px';
      
      return (
        <div className={`adsense-container ${className}`} style={style}>
          <div 
            style={{ 
              minHeight: placeholderHeight,
              backgroundColor: '#f8fafc', 
              border: '2px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              margin: '10px 0',
              ...style 
            }}
          >
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold' }}>
                📢 AdSense {adType.charAt(0).toUpperCase() + adType.slice(1)} Ad
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>
                Real ads will appear here when deployed
              </p>
              {!adsEnabled && <p style={{ fontSize: '10px', color: '#ef4444' }}>❌ Ads disabled in config</p>}
              {!publisherId && <p style={{ fontSize: '10px', color: '#ef4444' }}>❌ Publisher ID missing</p>}
              {!adSlot && <p style={{ fontSize: '10px', color: '#ef4444' }}>❌ Ad slot missing</p>}
              <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '10px' }}>
                Slot: {adSlot || 'Not configured'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', margin: '10px 0' }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default FlexibleAdSense;
