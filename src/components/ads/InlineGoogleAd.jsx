import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';

const InlineGoogleAd = ({ 
  adSlot, 
  adFormat = 'auto',
  style = {},
  className = '',
  size = 'medium' // small, medium, large
}) => {
  const { showAds } = useSubscription();
  const { isDark } = useTheme();
  const adRef = useRef(null);
  const isInitialized = useRef(false);

  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const isEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  // Responsive size configurations
  const sizeConfig = {
    small: {
      height: { mobile: '100px', tablet: '120px', desktop: '150px' },
      maxWidth: '320px'
    },
    medium: {
      height: { mobile: '150px', tablet: '200px', desktop: '250px' },
      maxWidth: '728px'
    },
    large: {
      height: { mobile: '200px', tablet: '250px', desktop: '300px' },
      maxWidth: '970px'
    }
  };

  useEffect(() => {
    if (!showAds() || !isEnabled || !publisherId || !adSlot || isInitialized.current) {
      return;
    }

    const loadAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          window.adsbygoogle.push({});
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('Error loading inline ad:', error);
      }
    };

    // Load ad after a short delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    
    return () => clearTimeout(timer);
  }, [showAds, isEnabled, publisherId, adSlot]);

  // Don't render if ads shouldn't be shown
  if (!showAds() || !isEnabled || !publisherId || !adSlot) {
    return null;
  }

  const config = sizeConfig[size];

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <div 
        className="w-full relative"
        style={{ maxWidth: config.maxWidth }}
      >
        {/* Ad Label */}
        <div className="flex justify-center mb-2">
          <span className={`text-xs font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Advertisement
          </span>
        </div>
        
        {/* Responsive Ad Container */}
        <div className="w-full">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              height: config.height.mobile,
              minHeight: config.height.mobile,
              ...style
            }}
            data-ad-client={publisherId}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
            data-adtest={isTestMode ? 'on' : 'off'}
          />
        </div>
        
        {/* Responsive height adjustments via CSS */}
        <style jsx>{`
          @media (min-width: 640px) {
            .adsbygoogle {
              height: ${config.height.tablet} !important;
              min-height: ${config.height.tablet} !important;
            }
          }
          @media (min-width: 1024px) {
            .adsbygoogle {
              height: ${config.height.desktop} !important;
              min-height: ${config.height.desktop} !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InlineGoogleAd;
