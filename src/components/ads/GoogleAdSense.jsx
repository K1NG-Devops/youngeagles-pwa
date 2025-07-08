import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_CONFIG } from '../../config/adsense-config';

/**
 * Production-Ready Google AdSense Component for Young Eagles PWA
 * 
 * Features:
 * - Environment-based configuration
 * - Error handling and fallbacks
 * - Responsive design
 * - Development mode with placeholders
 * - Performance optimized
 */
const GoogleAdSense = ({ 
  slot = ADSENSE_CONFIG.AD_SLOTS.DISPLAY_AD,
  size = ADSENSE_CONFIG.AD_SIZES.RECTANGLE,
  format = 'auto',
  className = '',
  style = {},
  responsive = true
}) => {
  const adRef = useRef(null);
  const [adError, setAdError] = useState(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Skip ad loading in test mode
    if (ADSENSE_CONFIG.TEST_MODE) {
      return;
    }

    // Check if AdSense is available
    if (typeof window === 'undefined' || !window.adsbygoogle) {
      setAdError('AdSense script not loaded');
      return;
    }

    // Load the ad
    const loadAd = () => {
      if (adRef.current && !isAdLoaded) {
        try {
          // Clear any existing content
          if (adRef.current.innerHTML.trim() !== '') {
            return;
          }

          // Push ad to AdSense
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsAdLoaded(true);
          setAdError(null);
        } catch (error) {
          console.error('AdSense loading error:', error);
          setAdError(error.message);
        }
      }
    };

    // Load ad with a small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, [isAdLoaded]);

  // Calculate responsive styles
  const getAdStyles = () => {
    const baseStyles = {
      display: 'inline-block',
      ...style
    };

    if (responsive) {
      return {
        ...baseStyles,
        width: '100%',
        maxWidth: size[0] + 'px',
        height: size[1] + 'px'
      };
    }

    return {
      ...baseStyles,
      width: size[0] + 'px',
      height: size[1] + 'px'
    };
  };

  // Development mode placeholder
  if (ADSENSE_CONFIG.TEST_MODE) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div 
          className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 flex items-center justify-center rounded-lg shadow-sm"
          style={{ 
            width: responsive ? '100%' : size[0] + 'px',
            maxWidth: size[0] + 'px',
            height: size[1] + 'px',
            minHeight: '100px'
          }}
        >
          <div className="text-center p-4">
            <div className="mb-2">
              <span className="inline-block w-8 h-8 bg-blue-500 rounded-full text-white text-sm flex items-center justify-center font-bold">
                Ad
              </span>
            </div>
            <p className="text-blue-700 text-sm font-medium">Young Eagles PWA</p>
            <p className="text-xs text-blue-500 mt-1">AdSense Placeholder</p>
            <p className="text-xs text-blue-400">Size: {size[0]}×{size[1]}</p>
            <p className="text-xs text-blue-300">Test Mode Active</p>
          </div>
        </div>
      </div>
    );
  }

  // Error fallback
  if (adError) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div 
          className="bg-gray-50 border border-gray-200 flex items-center justify-center rounded-lg"
          style={{ 
            width: responsive ? '100%' : size[0] + 'px',
            maxWidth: size[0] + 'px',
            height: size[1] + 'px',
            minHeight: '100px'
          }}
        >
          <div className="text-center p-4">
            <p className="text-gray-500 text-sm">Ad content unavailable</p>
          </div>
        </div>
      </div>
    );
  }

  // Production ad
  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins 
        className="adsbygoogle"
        style={getAdStyles()}
        data-ad-client={ADSENSE_CONFIG.PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAdSense;
