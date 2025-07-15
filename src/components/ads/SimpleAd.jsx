import React, { useEffect, useRef, useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';

const SimpleAd = ({ 
  adSlot,
  adFormat = 'auto',
  className = '',
  style = {},
  label = 'Advertisement',
  position = 'content'
}) => {
  const { showAds } = useSubscription();
  const { isDark } = useTheme();
  const adRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const shouldShowAds = showAds() && adSlot;

  useEffect(() => {
    if (!shouldShowAds || !adRef.current) return;

    // Skip ads if AdSense script not loaded
    if (!window.adsbygoogle) {
      // AdSense script not loaded yet, will retry on next render
      return;
    }

    // Initialize AdSense
    window.adsbygoogle = window.adsbygoogle || [];
    
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle.push({});
        setIsLoaded(true);
      } catch (error) {
        // Log errors in production for debugging
        if (import.meta.env.PROD) {
          console.error('AdSense initialization error:', error);
        }
        setHasError(true);
      }
    }, 500); // Increased delay for better loading

    return () => clearTimeout(timer);
  }, [adSlot, shouldShowAds]);

  // Minimal container styles - no large wrappers
  const getContainerStyles = () => {
    return {
      width: '100%',
      maxWidth: '100%',
      margin: '8px 0',
      padding: '0',
      display: 'block',
      ...style
    };
  };

  // Don't render if ads are disabled, no ad slot, or has error
  if (!shouldShowAds || hasError) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        minHeight: '90px',
        height: 'auto',
        border: 'none',
        margin: '8px 0',
        padding: '0',
        overflow: 'visible',
        position: 'relative',
        boxSizing: 'border-box',
        ...style
      }}
      data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
      data-ad-test={import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? 'on' : 'off'}
    />
  );
};

export default SimpleAd;
