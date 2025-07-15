import React, { useEffect, useRef, useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import adConfig from '../../utils/adConfig';

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
  const [adHeight, setAdHeight] = useState(0);
  const [shouldRender, setShouldRender] = useState(false);
  
  const shouldShowAds = showAds() && adConfig.isEnabled() && adConfig.hasAdUnit(adSlot);

  useEffect(() => {
    if (!shouldShowAds) {
      setHasError(true);
      return;
    }
    
    // Only render if we have all required config
    if (!adSlot || !adConfig.getPublisherId()) {
      setHasError(true);
      return;
    }
    
    setShouldRender(true);
    setHasError(false); // Reset error state
  }, [shouldShowAds, adSlot]);

  useEffect(() => {
    if (!shouldRender || !adRef.current) return;

    // Initialize AdSense first (before any checks)
    if (!window.adsbygoogle) {
      window.adsbygoogle = [];
    }
    
    // Skip ads if AdSense script tag not present
    const hasScriptTag = !!document.querySelector('script[src*="adsbygoogle.js"]');
    if (!hasScriptTag) {
      console.warn('AdSense script tag not found');
      setHasError(true);
      return;
    }
    
    const timer = setTimeout(() => {
      try {
        // Ensure adsbygoogle exists and push
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }
        window.adsbygoogle.push({});
        setIsLoaded(true);
        
        // Check if ad actually loaded after a delay
        setTimeout(() => {
          if (adRef.current) {
            const actualHeight = adRef.current.offsetHeight;
            setAdHeight(actualHeight);
            
            // If ad has no height after loading, still keep it visible
            // AdSense may take time to load or may not fill every request
            if (actualHeight === 0) {
              console.warn('Ad may not have loaded content yet');
              // Don't set error - give AdSense more time
            }
          }
        }, 3000); // Increased delay for better loading
      } catch (error) {
        // Log errors in production for debugging
        console.error('AdSense initialization error:', error);
        setHasError(true);
      }
    }, 1000); // Increased delay for better loading

    return () => clearTimeout(timer);
  }, [shouldRender]);

  // Clean container styles with consistent spacing
  const getContainerStyles = () => {
    return {
      width: '100%',
      maxWidth: '100%',
      margin: hasError ? '0' : '0',
      padding: '0',
      display: hasError ? 'none' : 'block',
      ...style
    };
  };

  // Don't render if ads are disabled, no ad slot, or has error
  if (!shouldShowAds || hasError || !shouldRender) {
    return null;
  }

  // Return the ins element directly without wrapper div
  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        ...style
      }}
      data-ad-client={adConfig.getPublisherId()}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
      data-ad-test={adConfig.isTestMode() ? 'on' : 'off'}
    />
  );
};

export default SimpleAd;
