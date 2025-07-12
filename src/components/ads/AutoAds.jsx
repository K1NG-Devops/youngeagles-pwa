import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const AutoAds = ({ 
  enableAutoAds = true,
  enablePageLevelAds = true,
  enableAnchorAds = true,
  enableVignetteAds = true,
  enableMultiplexAds = true,
  enableInFeedAds = true,
  enableInArticleAds = true,
  enableMatchedContentAds = true
}) => {
  const { showAds } = useSubscription();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Don't load auto ads if user has premium subscription
    if (!showAds()) {
      return;
    }

    // Prevent multiple initializations
    if (isInitialized.current) {
      return;
    }

    // Check if AdSense script is already loaded
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      // Load Google AdSense Auto Ads script
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXX');
      document.head.appendChild(script);
    }

    // Initialize adsbygoogle array if not exists
    window.adsbygoogle = window.adsbygoogle || [];
    
    // Only configure Auto Ads once
    if (enableAutoAds && enablePageLevelAds) {
      try {
        window.adsbygoogle.push({
          google_ad_client: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXX',
          enable_page_level_ads: true,
          overlays: {
            bottom: enableAnchorAds
          },
          vignette: {
            enable: enableVignetteAds
          }
        });
        
        // Mark as initialized to prevent duplicate calls
        isInitialized.current = true;
        console.log('✅ Google Auto Ads initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Google Auto Ads:', error);
      }
    }

  }, [showAds, enableAutoAds, enablePageLevelAds, enableAnchorAds, enableVignetteAds]);

  // Don't render anything if ads are disabled
  if (!showAds()) {
    return null;
  }

  return (
    <>
      {/* Auto Ads will be automatically placed by Google */}
      <div 
        className="auto-ads-container" 
        style={{ display: 'none' }}
        data-auto-ads-enabled={enableAutoAds}
        data-page-level-ads={enablePageLevelAds}
        data-anchor-ads={enableAnchorAds}
        data-vignette-ads={enableVignetteAds}
        data-multiplex-ads={enableMultiplexAds}
        data-in-feed-ads={enableInFeedAds}
        data-in-article-ads={enableInArticleAds}
        data-matched-content-ads={enableMatchedContentAds}
      />
    </>
  );
};

export default AutoAds; 