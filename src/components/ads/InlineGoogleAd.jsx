import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const InlineGoogleAd = ({ 
  adSlot, 
  adFormat = 'auto',
  style = {},
  className = ''
}) => {
  const { showAds } = useSubscription();
  const adRef = useRef(null);
  const isInitialized = useRef(false);

  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const isEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  useEffect(() => {
    if (!showAds() || !isEnabled || !publisherId || !adSlot || isInitialized.current) {
      return;
    }

    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isInitialized.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [showAds, isEnabled, publisherId, adSlot]);

  if (!showAds() || !isEnabled || !publisherId || !adSlot) {
    return null;
  }

  // Render the ad directly without wrapper
  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{
        display: 'block',
        ...style
      }}
      data-ad-client={publisherId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
      data-adtest={isTestMode ? 'on' : 'off'}
    />
  );
};

export default InlineGoogleAd;
