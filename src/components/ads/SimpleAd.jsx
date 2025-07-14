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

  // Don't render if ads are disabled or no ad slot
  if (!showAds() || !adSlot) {
    return null;
  }

  useEffect(() => {
    if (!adRef.current) return;

    // Initialize AdSense
    window.adsbygoogle = window.adsbygoogle || [];
    
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle.push({});
        setIsLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
        setHasError(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [adSlot]);

  // Get responsive styles based on position - Mobile-optimized
  const getContainerStyles = () => {
    const baseStyles = {
      width: '100%',
      textAlign: 'center',
      margin: '16px 0',
      padding: '0',
      overflow: 'visible',
      ...style
    };

    // Position-specific adjustments - Mobile-friendly
    switch (position) {
    case 'header':
      return { 
        ...baseStyles, 
        marginTop: '8px', 
        marginBottom: '16px',
        width: '100%',
        maxWidth: '100%'
      };
    case 'footer': 
      return { 
        ...baseStyles, 
        marginTop: '16px', 
        marginBottom: '8px',
        width: '100%',
        maxWidth: '100%'
      };
    case 'sidebar':
      return { 
        ...baseStyles, 
        margin: '16px 0',
        width: '100%',
        maxWidth: '100%'
      };
    case 'content':
      return { 
        ...baseStyles,
        margin: '16px 0',
        width: '100%',
        maxWidth: '100%'
      };
    default:
      return baseStyles;
    }
  };

  if (hasError) {
    return null; // Fail silently
  }

  return (
    <div className={`simple-ad ${className}`} style={getContainerStyles()}>
      {/* Ad Label - Minimal styling */}
      {label && (
        <div className={`text-xs mb-2 font-medium tracking-wide uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {label}
        </div>
      )}
      
      {/* AdSense Ad Unit - Mobile-optimized */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '100%',
          minHeight: '50px',
          height: 'auto',
          border: 'none',
          margin: '0',
          padding: '0',
          overflow: 'visible',
          position: 'relative',
          boxSizing: 'border-box'
        }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-test={import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? 'on' : 'off'}
      />
    </div>
  );
};

export default SimpleAd;
