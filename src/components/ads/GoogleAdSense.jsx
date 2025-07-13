import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const GoogleAdSense = ({
  adSlot,
  adFormat = 'auto',
  adLayout = '',
  adLayoutKey = '',
  fullWidthResponsive = true,
  className = '',
  style = {},
  dataAdTest = 'off' // Set to 'on' for testing
}) => {
  const { showAds } = useSubscription();
  const adRef = useRef(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    // Don't load script if ads shouldn't be shown
    if (!showAds() || !adSlot) {
      return;
    }

    // AdSense script is already loaded globally in index.html
    // Just ensure adsbygoogle array is initialized
    window.adsbygoogle = window.adsbygoogle || [];

    // Push ads to Google AdSense after a short delay to ensure script is loaded
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle && adRef.current) {
          // Push the ad configuration (matches official snippet behavior)
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [adSlot, showAds]);

  // Don't render ads if user has premium subscription
  if (!showAds()) {
    return null;
  }

  // Don't render if no ad slot provided
  if (!adSlot) {
    return null;
  }

  // Don't render if ad slot is placeholder text
  if (adSlot.includes('your-') || adSlot.includes('XXXXXXXXX')) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', width: '100%', ...style }}
      data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXX'}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-ad-layout={adLayout}
      data-ad-layout-key={adLayoutKey}
      data-full-width-responsive={fullWidthResponsive}
      data-ad-test={import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? 'on' : dataAdTest}
    />
  );
};

export default GoogleAdSense;
