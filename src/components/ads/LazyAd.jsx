import React, { useState, useEffect, useRef, forwardRef } from 'react';
import GoogleAdSense from './GoogleAdSense';
import { useSubscription } from '../../contexts/SubscriptionContext';

const LazyAd = ({ 
  adSlot,
  adFormat = 'auto',
  className = '',
  style = {},
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = null,
  showPlaceholderWhenEmpty = true,
  preventLayoutShift = true,
  minHeight = '100px',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [adDimensions, setAdDimensions] = useState({ width: '100%', height: minHeight });
  const adRef = useRef(null);
  const observerRef = useRef(null);
  const { showAds } = useSubscription();

  useEffect(() => {
    if (!adRef.current) return;

    // Create intersection observer with better performance
    observerRef.current = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        threshold,
        rootMargin // Start loading when ad is 50px away from viewport
      }
    );

    observerRef.current.observe(adRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // Enhanced ad loading monitoring with layout shift prevention
  useEffect(() => {
    if (isVisible && adSlot) {
      const checkAdLoaded = () => {
        const adElement = adRef.current?.querySelector('.adsbygoogle');
        if (adElement) {
          const adHeight = adElement.offsetHeight;
          const adWidth = adElement.offsetWidth;
          
          // Check if ad actually loaded content (not just empty space)
          if (adHeight > 0 && adWidth > 0) {
            setAdLoaded(true);
            setAdError(false);
            
            // Update dimensions for layout shift prevention
            if (preventLayoutShift) {
              setAdDimensions({
                width: `${adWidth}px`,
                height: `${adHeight}px`
              });
            }
          } else {
            // Ad slot exists but no content loaded
            setTimeout(() => {
              if (adElement.offsetHeight === 0) {
                setAdError(true);
              }
            }, 3000); // Wait 3 seconds for ad to load
          }
        }
      };

      // Multiple checks to ensure ad loading is detected
      const timer1 = setTimeout(checkAdLoaded, 500);
      const timer2 = setTimeout(checkAdLoaded, 1500);
      const timer3 = setTimeout(checkAdLoaded, 3000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, adSlot, preventLayoutShift]);

  // Don't render anything if ads are disabled or no ad slot
  if (!showAds() || !adSlot) {
    return showPlaceholderWhenEmpty && placeholder ? placeholder : null;
  }

  // Get responsive dimensions based on format and screen size
  const getResponsiveDimensions = () => {
    const isSmall = window.innerWidth < 640;
    const isMedium = window.innerWidth < 1024;
    
    const dimensions = {
      display: 'block',
      width: '100%',
      margin: 0,
      padding: 0,
      ...style
    };
    
    // Set responsive height based on format
    switch (adFormat) {
    case 'horizontal':
    case 'banner':
      dimensions.minHeight = isSmall ? '50px' : '90px';
      dimensions.maxHeight = isSmall ? '100px' : '120px';
      break;
    case 'rectangle':
      dimensions.minHeight = isSmall ? '200px' : '250px';
      dimensions.width = isSmall ? '100%' : 'auto';
      break;
    case 'fluid':
      dimensions.minHeight = isSmall ? '100px' : '150px';
      break;
    default:
      dimensions.minHeight = isSmall ? '50px' : (style.minHeight || '90px');
    }
    
    return dimensions;
  };

  if (!isVisible) {
    // Return placeholder or loading state without wrapper div
    if (placeholder) {
      return React.cloneElement(placeholder, {
        ref: adRef,
        style: getResponsiveDimensions()
      });
    }
    
    // Default loading placeholder
    return (
      <div 
        ref={adRef}
        className={className}
        style={getResponsiveDimensions()}
      />
    );
  }

  // Show error state if ad failed to load
  if (adError && showPlaceholderWhenEmpty) {
    return (
      <div 
        ref={adRef}
        className={className}
        style={{
          ...getResponsiveDimensions(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '12px',
          fontStyle: 'italic',
          backgroundColor: 'transparent'
        }}
      >
        {placeholder || 'Advertisement space'}
      </div>
    );
  }

  // Return the ad directly without wrapper div
  const adProps = {
    adSlot,
    adFormat,
    className,
    style: getResponsiveDimensions(),
    ...props
  };

  return (
    <div ref={adRef} style={{ display: 'contents' }}>
      <GoogleAdSense {...adProps} />
    </div>
  );
};

export default LazyAd;
