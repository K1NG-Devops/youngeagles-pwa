import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Header Ad Component
export const HeaderAd = ({ className = '' }) => {
  const { isDark } = useTheme();

  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4 ${className}`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Advertisement
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            AdBlock? Consider supporting us
          </span>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">🎓 Educational Excellence</h3>
              <p className="text-sm opacity-90">Unlock your child's potential with premium learning tools</p>
            </div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content Ad Component
export const ContentAd = ({ className = '' }) => {
  const { isDark } = useTheme();
  const adRef = useRef(null);
  
  // AdSense configuration
  const isAdsEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-5506438806314781';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';
  
  // Initialize AdSense
  useEffect(() => {
    if (isAdsEnabled) {
      const timer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && adRef.current) {
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
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAdsEnabled]);
  
  if (!isAdsEnabled) {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} my-4 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored Content (Disabled)
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">AdSense is disabled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} my-4 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Sponsored Content
          </span>
        </div>
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '150px' }}
          data-ad-client={publisherId}
          data-ad-slot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-ad-test={isTestMode ? 'on' : 'off'}
        />
      </div>
    </div>
  );
};

// Note: NativeAd component has been moved to its own file (NativeAd.jsx)
// Import NativeAd from '../components/ads/NativeAd' instead of using this file

// Banner Ad Component with AdSense integration
export const BannerAd = ({ position = 'top', className = '' }) => {
  const { isDark } = useTheme();
  const adRef = useRef(null);
  
  // AdSense configuration
  const isAdsEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-5506438806314781';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';
  
  // Initialize AdSense
  useEffect(() => {
    if (isAdsEnabled) {
      const timer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && adRef.current) {
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
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAdsEnabled, position]);
  
  // Choose ad slot based on position
  const getAdSlot = () => {
    switch (position) {
      case 'top':
        return import.meta.env.VITE_ADSENSE_HEADER_BANNER;
      case 'bottom':
        return import.meta.env.VITE_ADSENSE_FOOTER_BANNER;
      default:
        return import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT;
    }
  };
  
  const marginClass = position === 'top' ? 'mb-6' : position === 'bottom' ? 'mt-6' : 'my-4';
  
  if (!isAdsEnabled) {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} ${marginClass} ${className}`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Advertisement (Disabled)
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">AdSense is disabled</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} ${marginClass} ${className}`}>
      <div className="p-3">
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
          data-ad-slot={getAdSlot()}
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-ad-test={isTestMode ? 'on' : 'off'}
        />
      </div>
    </div>
  );
};

// Interstitial Ad Component (for modal/popup ads)
export const InterstitialAd = ({ isOpen, onClose, className = '' }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored Content
            </span>
            <button 
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 text-xl ${isDark ? 'hover:text-gray-300' : ''}`}
            >
              ×
            </button>
          </div>
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white p-6 rounded-lg text-center">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-bold text-xl mb-2">Special Offer!</h3>
            <p className="text-sm mb-4 opacity-90">
              Get 50% off premium educational content for your child
            </p>
            <div className="space-y-2">
              <button className="w-full bg-white text-purple-600 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Claim Offer
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-transparent border border-white text-white py-2 rounded-md text-sm hover:bg-white hover:text-purple-600 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default export of all components
// Note: NativeAd is now in its own file (NativeAd.jsx)
export default {
  HeaderAd,
  ContentAd,
  BannerAd,
  InterstitialAd
};
