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
  }, [shouldShowAds, adSlot]);

  useEffect(() => {
    if (!shouldRender || !adRef.current) return;

    // Skip ads if AdSense script not loaded
    if (!adConfig.isScriptLoaded()) {
      // AdSense script not loaded yet, will retry on next render
      console.warn('AdSense script not loaded');
      setHasError(true);
      return;
    }

    // Initialize AdSense
    adConfig.initializeAdSense();
    
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle.push({});
        setIsLoaded(true);
        
        // Check if ad actually loaded after a delay
        setTimeout(() => {
          if (adRef.current) {
            const actualHeight = adRef.current.offsetHeight;
            setAdHeight(actualHeight);
            
            // If ad has no height after loading, consider it failed
            if (actualHeight === 0) {
              console.warn('Ad failed to load - no height');
              setHasError(true);
            }
          }
        }, 2000); // Increased delay for better loading
      } catch (error) {
        // Log errors in production for debugging
        console.error('AdSense initialization error:', error);
        setHasError(true);
      }
    }, 1000); // Increased delay for better loading

    return () => clearTimeout(timer);
  }, [shouldRender]);

  // Minimal container styles - no large wrappers
  const getContainerStyles = () => {
    return {
      width: '100%',
      maxWidth: '100%',
      margin: hasError ? '0' : '8px 0',
      padding: '0',
      display: hasError ? 'none' : 'block',
      ...style
    };
  };

  // Don't render if ads are disabled, no ad slot, or has error
  if (!shouldShowAds || hasError || !shouldRender) {
    return null;
  }

  return (
    <div style={getContainerStyles()}>
      <ins
        ref={adRef}
        className={`adsbygoogle ${className}`}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '100%',
          minHeight: adHeight > 0 ? `${adHeight}px` : '90px',
          height: 'auto',
          border: 'none',
          margin: '0',
          padding: '0',
          overflow: 'visible',
          position: 'relative',
          boxSizing: 'border-box',
          ...style
        }}
        data-ad-client={adConfig.getPublisherId()}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-test={adConfig.isTestMode() ? 'on' : 'off'}
      />
    </div>
  );
};

export default SimpleAd;
