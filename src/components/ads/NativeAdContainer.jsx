import React, { useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import LazyAd from './LazyAd';

const NativeAdContainer = ({ 
  position = 'feed',
  contentType = 'general',
  spacing = 'medium',
  maxWidth = 'full',
  className = '',
  onAdLoaded = null,
  onAdError = null
}) => {
  const { isDark } = useTheme();
  const { showAds } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Don't show ads if disabled
  if (!showAds()) return null;

  // Get ad slot based on position
  const getAdSlotForPosition = (pos) => {
    const slots = {
      feed: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
      banner: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
      native: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE,
      sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
      rectangle: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
      bottom: import.meta.env.VITE_ADSENSE_FOOTER_BANNER
    };
    return slots[pos] || slots.native;
  };

  // Get ad format based on position
  const getFormatForPosition = (pos) => {
    const formats = {
      feed: 'fluid',
      banner: 'auto',
      native: 'fluid',
      sidebar: 'rectangle',
      rectangle: 'rectangle',
      bottom: 'auto'
    };
    return formats[pos] || 'auto';
  };

  // Get container styles based on position and spacing
  const getContainerStyles = () => {
    const baseStyles = 'ad-container transition-opacity duration-300';
    
    const positionStyles = {
      feed: 'my-6 mx-auto max-w-lg rounded-lg',
      banner: 'w-full py-2',
      native: `rounded-lg p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`,
      sidebar: 'max-w-sm mx-auto',
      rectangle: 'max-w-md mx-auto',
      bottom: 'w-full'
    };

    const spacingStyles = {
      small: 'my-2',
      medium: 'my-4',
      large: 'my-8',
      none: ''
    };

    const maxWidthStyles = {
      full: 'w-full',
      lg: 'max-w-lg',
      md: 'max-w-md',
      sm: 'max-w-sm'
    };

    return `${baseStyles} ${positionStyles[position]} ${spacingStyles[spacing]} ${maxWidthStyles[maxWidth]} ${className}`;
  };

  // Ad placeholder component
  const AdPlaceholder = ({ type }) => {
    if (hasError) return null;

    const placeholderText = {
      feed: 'Sponsored Content',
      banner: 'Advertisement',
      native: 'Sponsored',
      sidebar: 'Ad',
      rectangle: 'Advertisement',
      bottom: 'Sponsored'
    };

    return (
      <div className={`
        flex items-center justify-center text-xs text-gray-400 
        ${type === 'banner' ? 'h-16' : 'h-24'}
        ${isDark ? 'bg-gray-800/30' : 'bg-gray-100/30'}
        rounded border-2 border-dashed 
        ${isDark ? 'border-gray-700' : 'border-gray-300'}
      `}>
        {placeholderText[type]}
      </div>
    );
  };

  const handleAdLoaded = useCallback(() => {
    setIsVisible(true);
    setHasError(false);
    onAdLoaded?.();
  }, [onAdLoaded]);

  const handleAdError = useCallback(() => {
    setHasError(true);
    setIsVisible(false);
    onAdError?.();
  }, [onAdError]);

  return (
    <div className={getContainerStyles()}>
      {/* Ad label for transparency */}
      {(isVisible || position === 'native') && (
        <div className={`text-xs text-gray-400 mb-2 ${position === 'native' ? 'text-center' : ''}`}>
          {position === 'native' ? 'Sponsored Content' : 'Advertisement'}
        </div>
      )}
      
      <LazyAd 
        adSlot={getAdSlotForPosition(position)}
        adFormat={getFormatForPosition(position)}
        className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onAdLoaded={handleAdLoaded}
        onAdError={handleAdError}
        placeholder={<AdPlaceholder type={position} />}
        showPlaceholderWhenEmpty={!hasError}
        threshold={0.2}
        rootMargin="100px"
      />

      {/* Native content styling for native ads */}
      {position === 'native' && isVisible && (
        <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center`}>
          Learn more about our partners
        </div>
      )}
    </div>
  );
};

export default NativeAdContainer;
