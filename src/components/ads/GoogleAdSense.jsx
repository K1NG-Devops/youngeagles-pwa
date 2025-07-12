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

    // Load Google AdSense script if not already loaded
    if (!isScriptLoaded.current && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXX');
      document.head.appendChild(script);
      isScriptLoaded.current = true;
    }

    // Initialize adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];

    // Push ads to Google AdSense after a short delay to ensure script is loaded
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle && adRef.current) {
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

  return (
    <div className={`google-adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXX'}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive}
        data-ad-test={import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? 'on' : dataAdTest}
      />
    </div>
  );
};

export default GoogleAdSense;
