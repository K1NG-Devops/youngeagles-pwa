import React, { useEffect, useRef } from 'react';

const GoogleAd = ({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  responsive = true,
  className = '' 
}) => {
  const adRef = useRef(null);
  const isProduction = import.meta.env.PROD;
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const adSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  useEffect(() => {
    // Only load ads if AdSense is enabled and we have the required data
    if (!adSenseEnabled || !publisherId || !slot) {
      console.warn('AdSense disabled or missing publisher ID/slot');
      return;
    }

    // Load the ad in production or when test mode is enabled
    if (isProduction || testMode) {
      try {
        if (window.adsbygoogle && adRef.current) {
          // Check if ad is already loaded
          const existingAd = adRef.current.querySelector('.adsbygoogle');
          if (existingAd && existingAd.dataset.adStatus) {
            console.log('Ad already loaded for slot:', slot);
            return;
          }

          // Push to AdSense queue
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log('AdSense ad loaded for slot:', slot);
        }
      } catch (error) {
        console.error('Error loading AdSense ad:', error);
      }
    }
  }, [publisherId, slot, adSenseEnabled, isProduction, testMode]);

  // Don't render anything if ads are disabled
  if (!adSenseEnabled) {
    return null;
  }

  // Show placeholder only in development when test mode is disabled
  if (!isProduction && !testMode) {
    return (
      <div className={`adsense-placeholder ${className}`} style={{ 
        ...style, 
        backgroundColor: '#f3f4f6',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        <div>🔧 AdSense Placeholder</div>
        <div>Slot: {slot}</div>
        <div>Publisher: {publisherId}</div>
        <div>(Enable test mode to see ads in development)</div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

export default GoogleAd;
