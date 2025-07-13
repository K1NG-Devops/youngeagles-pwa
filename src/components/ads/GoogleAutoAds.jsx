import React, { useEffect } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const GoogleAutoAds = () => {
  const { showAds } = useSubscription();
  
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const isEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';

  useEffect(() => {
    // Don't show ads if user has premium subscription
    if (!showAds() || !isEnabled || !publisherId) {
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    
    if (!existingScript) {
      // Load AdSense script with auto-ads enabled
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', publisherId);
      
      // Enable auto ads
      script.onload = () => {
        // Push auto-ads configuration
        (window.adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: publisherId,
          enable_page_level_ads: true,
          overlays: {
            bottom: true // Enable anchor/overlay ads at bottom
          }
        });
      };

      document.head.appendChild(script);
    }
  }, [showAds, isEnabled, publisherId]);

  // This component doesn't render anything visible
  return null;
};

export default GoogleAutoAds;
