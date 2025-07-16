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
    if (isAdsEnabled && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
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

// Native Ad Component
export const NativeAd = ({ type = 'feed', className = '' }) => {
  const { isDark } = useTheme();

  if (type === 'banner') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </span>
          </div>
          <div className="bg-blue-500 text-white p-6 rounded-lg text-center">
            <h3 className="font-bold text-lg mb-2">📖 Educational Resources</h3>
            <p className="text-sm mb-4">Discover premium learning materials for your child</p>
            <button className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default feed type
  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4 ${className}`}>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">YE</span>
          </div>
          <div>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Young Eagles Education
            </h4>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-red-500 p-4 rounded-lg text-white mb-3">
          <h3 className="font-bold mb-1">🚀 Accelerate Learning</h3>
          <p className="text-sm">AI-powered personalized education for every child</p>
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors">
            Get Started
          </button>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Free for 30 days
          </span>
        </div>
      </div>
    </div>
  );
};

// Legacy Banner Ad Component for backward compatibility
export const BannerAd = ({ position = 'top', className = '' }) => {
  const { isDark } = useTheme();

  if (position === 'top') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-6 ${className}`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Advertisement
            </span>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">🎮 Educational Games</h3>
                <p className="text-sm opacity-90">Fun learning activities for kids</p>
              </div>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors">
                Play Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (position === 'bottom') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-6 ${className}`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </span>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">📚 Learning Resources</h3>
                <p className="text-sm opacity-90">Premium educational materials</p>
              </div>
              <button className="bg-white text-green-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-green-100 transition-colors">
                Browse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default middle position
  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} my-4 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Advertisement
          </span>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">✨ Unlock Potential</h3>
          <p className="text-sm mb-4">Personalized learning paths for every student</p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            Discover More
          </button>
        </div>
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
export default {
  HeaderAd,
  ContentAd,
  NativeAd,
  BannerAd,
  InterstitialAd
};
