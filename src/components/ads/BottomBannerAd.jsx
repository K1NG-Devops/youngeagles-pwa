import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { FaTimes, FaGraduationCap, FaBookOpen, FaUsers } from 'react-icons/fa';

const BottomBannerAd = ({ 
  dismissible = true,
  context = 'general',
  className = '' 
}) => {
  const { isDark } = useTheme();
  const { shouldShowAd, recordAdShown } = useSubscription();
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentAd, setCurrentAd] = useState(0);

  // Educational-focused native ads
  const educationalAds = [
    {
      id: 'upgrade-premium',
      title: 'Unlock Premium Features',
      description: 'Remove ads • Unlimited homework • Priority support',
      icon: FaGraduationCap,
      color: 'from-blue-500 to-purple-600',
      cta: 'Upgrade Now',
      action: () => window.location.href = '/checkout'
    },
    {
      id: 'learning-resources',
      title: 'Free Learning Resources',
      description: 'Access educational worksheets and activities',
      icon: FaBookOpen,
      color: 'from-green-500 to-teal-600',
      cta: 'Explore',
      action: () => window.location.href = '/activities'
    },
    {
      id: 'parent-community',
      title: 'Join Parent Community',
      description: 'Connect with other parents and share experiences',
      icon: FaUsers,
      color: 'from-purple-500 to-pink-600',
      cta: 'Join Now',
      action: () => window.open('https://community.youngeagles.com', '_blank')
    }
  ];

  // Check if we should show ad based on context and frequency
  const shouldDisplay = shouldShowAd(context);

  // Record that ad was shown - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    if (shouldDisplay) {
      recordAdShown(context);
    }
  }, [shouldDisplay, context, recordAdShown]);

  // Auto-rotate ads every 30 seconds - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % educationalAds.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [educationalAds.length]);

  // Don't show if dismissed or shouldn't display - MOVED AFTER ALL HOOKS
  if (isDismissed || !shouldDisplay) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleAdClick = () => {
    educationalAds[currentAd].action();
  };

  const ad = educationalAds[currentAd];
  const IconComponent = ad.icon;

  return (
    <div className={`fixed bottom-4 left-0 right-0 z-30 px-2 ${className} sm:bottom-8`}>
      <div 
        className={`mx-auto max-w-sm rounded-lg shadow-lg border cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
        onClick={handleAdClick}
      >
        {/* Native ad content */}
        <div className="p-3">
          <div className="flex items-center space-x-2">
            {/* Icon with gradient background */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ad.color} flex items-center justify-center flex-shrink-0`}>
              <IconComponent className="text-white text-lg" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {ad.title}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {ad.description}
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex-shrink-0">
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${ad.color} text-white`}>
                {ad.cta}
              </div>
            </div>
          </div>
        </div>
        
        {/* Dismiss button positioned outside content area */}
        {dismissible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            } shadow-md`}
            title="Dismiss ad"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
        
        {/* Subtle ad indicator */}
        <div className={`px-3 pb-1 flex items-center justify-between ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <span className="text-[10px]">Sponsored</span>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center pb-1 space-x-1">
          {educationalAds.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-colors ${
                index === currentAd 
                  ? 'bg-blue-500' 
                  : (isDark ? 'bg-gray-600' : 'bg-gray-300')
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomBannerAd;
