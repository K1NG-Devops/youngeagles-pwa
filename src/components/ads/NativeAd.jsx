import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const NativeAd = ({ type = 'banner' }) => {
  const { isDark } = useTheme();
  const adRef = useRef(null);
  
  // AdSense configuration
  const isAdsEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-5506438806314781';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';
  
  // Initialize AdSense
  useEffect(() => {
    if (isAdsEnabled && adRef.current) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          // Ensure adsbygoogle is available and is an array
          if (typeof window !== 'undefined') {
            window.adsbygoogle = window.adsbygoogle || [];
            if (Array.isArray(window.adsbygoogle)) {
              window.adsbygoogle.push({});
            } else {
              console.warn('adsbygoogle is not an array, reinitializing...');
              window.adsbygoogle = [];
              window.adsbygoogle.push({});
            }
          }
        } catch (error) {
          console.error('AdSense error:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAdsEnabled]);
  
  // If ads are disabled, show placeholder
  if (!isAdsEnabled) {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Advertisement (Disabled)
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">AdSense is disabled in environment settings</p>
          </div>
        </div>
      </div>
    );
  }

  // Google AdSense integration
  if (type === 'banner') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Advertisement
            </span>
          </div>
          <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '90px' }}
            data-ad-client={publisherId}
            data-ad-slot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-ad-test={isTestMode ? 'on' : 'off'}
          />
        </div>
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored Content
            </span>
          </div>
          <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '120px' }}
            data-ad-client={publisherId}
            data-ad-slot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
            data-ad-format="fluid"
            data-ad-layout-key="-6t+ed+2i-1n-4w"
            data-ad-test={isTestMode ? 'on' : 'off'}
          />
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Advertisement
            </span>
          </div>
          <ins 
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '200px' }}
            data-ad-client={publisherId}
            data-ad-slot={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-ad-test={isTestMode ? 'on' : 'off'}
          />
        </div>
      </div>
    );
  }

  // Default banner style with AdSense
  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Advertisement
          </span>
        </div>
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={publisherId}
          data-ad-slot={import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-ad-test={isTestMode ? 'on' : 'off'}
        />
      </div>
    </div>
  );
};

export default NativeAd;
