import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { FaTimes, FaExternalLinkAlt, FaGift, FaStar, FaArrowUp } from 'react-icons/fa';
import GoogleAdSense from './GoogleAdSense';

const BottomBannerAd = ({ 
  dismissible = true,
  autoRotate = true,
  className = '' 
}) => {
  const { isDark } = useTheme();
  const { showAds } = useSubscription();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if Google AdSense is enabled
  const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const bannerAdUnit = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT;

  // Custom ads configuration
  const ads = [
    {
      id: 'upgrade-1',
      title: 'Upgrade to Premium',
      description: 'Remove ads and unlock all features!',
      cta: 'Upgrade',
      bgColor: 'bg-gradient-to-r from-blue-500 to-purple-600',
      textColor: 'text-white',
      icon: FaStar,
      action: () => {
        // Navigate to upgrade page
        window.location.href = '/pricing';
      }
    },
    {
      id: 'education-1',
      title: 'Free Learning Resources',
      description: 'Discover educational content for your child',
      cta: 'Explore',
      bgColor: 'bg-gradient-to-r from-green-500 to-blue-500',
      textColor: 'text-white',
      icon: FaGift,
      action: () => {
        window.open('https://example.com/resources', '_blank');
      }
    },
    {
      id: 'feedback-1',
      title: 'Love the App?',
      description: 'Rate us 5 stars and help other families!',
      cta: 'Rate Now',
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      textColor: 'text-white',
      icon: FaStar,
      action: () => {
        // Open app store rating
        console.log('Open app store rating');
      }
    }
  ];

  // Auto-rotate ads every 45 seconds
  useEffect(() => {
    if (!autoRotate || ads.length <= 1 || !showAds()) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 45000);

    return () => clearInterval(interval);
  }, [autoRotate, ads.length, showAds]);

  const handleAdClick = () => {
    const currentAd = ads[currentAdIndex];
    console.log('Bottom banner ad clicked:', currentAd.id);
    currentAd.action();
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    console.log('Bottom banner ad dismissed:', ads[currentAdIndex].id);
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  // Don't show if user has premium subscription or ad is dismissed
  if (!showAds() || isDismissed) {
    return null;
  }

  // If AdSense is properly configured, use that
  if (isAdSenseEnabled && publisherId && bannerAdUnit && bannerAdUnit !== 'your-banner-ad-unit-id-here') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
        <div className={`relative ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t shadow-lg`}>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={`absolute top-1 right-1 p-1 rounded-full transition-colors z-10 ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <FaTimes className="text-xs" />
            </button>
          )}
          
          <GoogleAdSense 
            adSlot={bannerAdUnit}
            adFormat="horizontal"
            className="w-full"
            style={{ height: '50px', minHeight: '50px' }}
          />
        </div>
      </div>
    );
  }

  // Fallback to custom ads
  const currentAd = ads[currentAdIndex];
  const IconComponent = currentAd.icon;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transform transition-all duration-300 translate-y-0 opacity-100 ${className}`}>
      <div 
        className={`relative transition-all duration-300 cursor-pointer ${
          isMinimized ? 'h-12' : 'h-16'
        } ${currentAd.bgColor} ${currentAd.textColor} shadow-lg`}
        onClick={handleAdClick}
      >
        {/* Ad Content */}
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Icon and Text */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <IconComponent className={`${isMinimized ? 'text-lg' : 'text-xl'} opacity-90`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`font-semibold ${isMinimized ? 'text-sm' : 'text-base'} truncate`}>
                {currentAd.title}
              </div>
              {!isMinimized && (
                <div className="text-xs opacity-80 truncate">
                  {currentAd.description}
                </div>
              )}
            </div>
          </div>

          {/* Right: CTA and Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm
            `}>
              {currentAd.cta}
              <FaExternalLinkAlt className="ml-1 text-xs" />
            </button>
            
            {/* Minimize/Maximize Button */}
            <button
              onClick={toggleMinimize}
              className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <FaArrowUp className={`text-xs transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dismiss Button */}
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        {ads.length > 1 && autoRotate && !isMinimized && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`
                  w-1 h-1 rounded-full transition-all duration-300
                  ${index === currentAdIndex 
                ? 'bg-white bg-opacity-80' 
                : 'bg-white bg-opacity-30'
              }
                `}
              />
            ))}
          </div>
        )}

        {/* Ad Label */}
        <div className="absolute top-1 left-2 text-xs opacity-60">
          Ad
        </div>
      </div>
    </div>
  );
};

export default BottomBannerAd;
