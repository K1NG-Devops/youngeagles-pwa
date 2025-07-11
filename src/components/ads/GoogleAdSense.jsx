import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const GoogleAdSense = ({ 
  adSlot, 
  adFormat = 'auto',
  adLayoutKey,
  className = '',
  style = {},
  responsive = true
}) => {
  const { showAds } = useSubscription();
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const isEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  useEffect(() => {
    // Don't show ads if user has premium subscription
    if (!showAds() || !isEnabled || !publisherId) {
      return;
    }

    // Load AdSense script if not already loaded
    if (!window.adsbygoogle && !isLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', publisherId);
      
      script.onload = () => {
        isLoaded.current = true;
        // Initialize ads after script loads
        if (adRef.current) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (error) {
            console.error('AdSense error:', error);
          }
        }
      };

      script.onerror = () => {
        console.warn('Failed to load AdSense script');
      };

      document.head.appendChild(script);
    } else if (window.adsbygoogle && adRef.current) {
      // Script already loaded, just push the ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }

    return () => {
      // Cleanup if needed
    };
  }, [showAds, isEnabled, publisherId, adSlot]);

  // Don't render if ads are disabled
  if (!showAds() || !isEnabled || !publisherId) {
    return null;
  }

  const adStyle = {
    display: 'block',
    ...style
  };

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-adtest={isTestMode ? 'on' : 'off'}
      />
    </div>
  );
};

export default GoogleAdSense;
