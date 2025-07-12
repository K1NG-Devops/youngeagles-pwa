import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { FaGraduationCap, FaBookOpen, FaUsers } from 'react-icons/fa';

const BottomBannerAd = ({ 
  context = 'general',
  className = '' 
}) => {
  const { isDark } = useTheme();
  const { shouldShowAd, recordAdShown } = useSubscription();

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

  // Record that ad was shown
  useEffect(() => {
    if (shouldDisplay) {
      recordAdShown(context);
    }
  }, [shouldDisplay, context, recordAdShown]);

  // Don't show if shouldn't display
  if (!shouldDisplay) {
    return null;
  }

  // Use the first ad (upgrade premium) as the static ad
  const ad = educationalAds[0];
  const IconComponent = ad.icon;

  const handleAdClick = () => {
    ad.action();
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 ${className}`}>
      <div 
        className={`w-full cursor-pointer transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800 border-t border-gray-700' 
            : 'bg-white border-t border-gray-200'
        } shadow-lg`}
        onClick={handleAdClick}
      >
        {/* Native ad content */}
        <div className="max-w-screen-lg mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center space-x-3">
            {/* Icon with gradient background */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${ad.color} flex items-center justify-center flex-shrink-0`}>
              <IconComponent className="text-white text-sm sm:text-lg" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {ad.title}
              </h3>
              <p className={`text-[10px] sm:text-xs mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {ad.description}
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex-shrink-0">
              <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r ${ad.color} text-white whitespace-nowrap`}>
                {ad.cta}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomBannerAd;
