import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const EnhancedNativeAd = ({ 
  position = 'native',
  contentType = 'general',
  spacing = 'medium',
  showControls = true,
  seamless = true,
  priority = 'normal',
  onAdLoaded = null,
  onAdError = null,
  className = ''
}) => {
  const { isDark } = useTheme();
  const { showAds } = useSubscription();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [userHidden, setUserHidden] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const adRef = useRef(null);
  const observerRef = useRef(null);

  // Ad slot configuration
  const adSlots = {
    native: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE,
    feed: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
    banner: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
    content: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
    sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
  };

  const adSlot = adSlots[position] || adSlots.native;

  // Enhanced intersection observer with better timing
  useEffect(() => {
    if (!adRef.current || !showAds() || userHidden) return;

    const options = {
      root: null,
      rootMargin: priority === 'high' ? '100px' : '50px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Disconnect observer after first visibility
        observerRef.current?.disconnect();
      }
    }, options);

    observerRef.current.observe(adRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [showAds, userHidden, priority]);

  // Enhanced ad loading with retry logic
  useEffect(() => {
    if (!isVisible || !adSlot || userHidden || adError) return;

    const loadAd = async () => {
      setIsLoading(true);
      setAdError(false);

      try {
        // Ensure AdSense script is loaded
        if (!window.adsbygoogle) {
          throw new Error('AdSense script not loaded');
        }

        // Wait for DOM to be ready
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve, { once: true });
          }
        });

        // Small delay to ensure proper initialization
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize ad
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});

        // Monitor ad loading
        const checkAdLoaded = () => {
          const adElement = adRef.current?.querySelector('.adsbygoogle');
          if (adElement) {
            const rect = adElement.getBoundingClientRect();
            const hasContent = rect.height > 0 && rect.width > 0;
            
            if (hasContent) {
              setAdLoaded(true);
              setIsLoading(false);
              onAdLoaded?.();
            } else {
              // Check again after delay
              setTimeout(checkAdLoaded, 1000);
            }
          }
        };

        setTimeout(checkAdLoaded, 500);

        // Timeout fallback
        setTimeout(() => {
          if (!adLoaded) {
            setAdError(true);
            setIsLoading(false);
            onAdError?.();
          }
        }, 5000);

      } catch (error) {
        console.error('Ad loading error:', error);
        setAdError(true);
        setIsLoading(false);
        onAdError?.(error);
      }
    };

    loadAd();
  }, [isVisible, adSlot, userHidden, adError, retryCount, adLoaded, onAdLoaded, onAdError]);

  // Retry mechanism
  const handleRetry = () => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setAdError(false);
      setAdLoaded(false);
    }
  };

  // Don't render if conditions not met
  if (!showAds() || !adSlot || userHidden) {
    return null;
  }

  // Get container styles for seamless integration
  const getContainerStyles = () => {
    const baseStyles = `
      transition-all duration-500 ease-in-out
      ${seamless ? 'rounded-lg' : 'rounded-md'}
      ${isLoading ? 'animate-pulse' : ''}
      ${className}
    `;

    const spacingStyles = {
      small: 'my-2',
      medium: 'my-4',
      large: 'my-6',
      none: ''
    };

    const positionStyles = {
      native: `
        ${isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50/30 border-gray-200'}
        border rounded-lg p-3
      `,
      feed: 'rounded-lg overflow-hidden',
      banner: 'w-full',
      content: 'max-w-md mx-auto',
      sidebar: 'max-w-sm'
    };

    return `${baseStyles} ${spacingStyles[spacing]} ${positionStyles[position]}`;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`
      ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
      animate-pulse rounded-lg p-4 space-y-3
    `}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full`}></div>
        <div className="space-y-2 flex-1">
          <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4`}></div>
          <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2`}></div>
        </div>
      </div>
      <div className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
      <div className="flex justify-center">
        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} flex items-center`}>
          <FaSpinner className="animate-spin mr-1" />
          Loading content...
        </div>
      </div>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className={`
      ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}
      border rounded-lg p-4 text-center
    `}>
      <FaExclamationTriangle className={`mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
        Content unavailable
      </p>
      {retryCount < 2 && (
        <button
          onClick={handleRetry}
          className={`
            text-xs px-3 py-1 rounded transition-colors
            ${isDark 
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }
          `}
        >
          Retry
        </button>
      )}
    </div>
  );

  return (
    <div className={getContainerStyles()}>
      {/* User Controls */}
      {showControls && !isLoading && !adError && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setUserHidden(true)}
            className={`
              text-xs px-2 py-1 rounded transition-colors
              ${isDark 
          ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }
            `}
            title="Hide this content"
          >
            <FaEyeSlash className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Ad Content */}
      <div ref={adRef} className={`
        ${isLoading ? 'opacity-0' : 'opacity-100'}
        transition-opacity duration-500
      `}>
        {isLoading && <LoadingSkeleton />}
        {adError && <ErrorState />}
        
        {!adError && (
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: '100%',
              minHeight: position === 'banner' ? '50px' : '100px'
            }}
            data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
            data-ad-slot={adSlot}
            data-ad-format={position === 'banner' ? 'horizontal' : 'fluid'}
            data-full-width-responsive="true"
            data-ad-test={import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? 'on' : 'off'}
          />
        )}
      </div>

      {/* Attribution */}
      {adLoaded && seamless && (
        <div className="text-center mt-2">
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Sponsored
          </span>
        </div>
      )}
    </div>
  );
};

export default EnhancedNativeAd;
