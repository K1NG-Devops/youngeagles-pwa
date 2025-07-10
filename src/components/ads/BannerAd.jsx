import React, { useState, useEffect } from 'react';
import GoogleAdSense from './GoogleAdSense';
import { ADSENSE_CONFIG } from '../../config/adsense-config';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Banner Ad Component - Production Ready with Simulated Ad Option
 * Responsive design for mobile and desktop
 * Optimized for Young Eagles PWA
 */
const BannerAd = ({ 
  className = '',
  showOnMobile = true,
  showOnDesktop = true,
  useSimulated = true // Set to false for real ads
}) => {
  const { isDark } = useTheme();
  const [currentAd, setCurrentAd] = useState(0);

  // Simulated ad data
  const simulatedAds = [
    {
      title: 'Learn Coding for Kids 👩‍💻',
      description: 'Fun programming courses for ages 6-16. Start your coding journey today!',
      cta: 'Start Free Trial',
      color: 'from-purple-500 to-pink-500',
      website: 'CodeForKids.com'
    },
    {
      title: 'Educational Games 🎮',
      description: 'Math & Science games that make learning fun and engaging',
      cta: 'Play Now',
      color: 'from-green-500 to-blue-500',
      website: 'EduGames.net'
    },
    {
      title: 'Online Tutoring 🎓',
      description: '1-on-1 sessions with certified teachers. Improve grades fast!',
      cta: 'Book Session',
      color: 'from-orange-500 to-red-500',
      website: 'TutorConnect.co.za'
    },
    {
      title: 'Study Apps 📱',
      description: 'Download the best study companion app for students',
      cta: 'Download Free',
      color: 'from-blue-500 to-purple-500',
      website: 'StudyBuddy.app'
    }
  ];

  // Rotate ads every 6 seconds
  useEffect(() => {
    if (useSimulated) {
      const interval = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % simulatedAds.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [useSimulated, simulatedAds.length]);

  const currentSimulatedAd = simulatedAds[currentAd];

  if (useSimulated) {
    return (
      <div className={`w-full flex justify-center my-4 px-2 sm:px-4 overflow-hidden ${className}`}>
        <div className={`max-w-2xl w-full ${isDark ? 'text-white' : 'text-white'}`}>
          <div className={`bg-gradient-to-r ${currentSimulatedAd.color} p-3 sm:p-4 rounded-xl shadow-lg border border-white/20 relative overflow-hidden w-full`}>
            {/* Sponsored label */}
            <div className="absolute top-2 right-2 bg-white text-gray-600 text-xs px-3 py-1 rounded-full font-medium shadow-lg">
              Sponsored
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full">
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold mb-1 truncate">{currentSimulatedAd.title}</div>
                <div className="text-sm opacity-90 mb-2 line-clamp-2">{currentSimulatedAd.description}</div>
                <div className="text-xs opacity-75 truncate">{currentSimulatedAd.website}</div>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg flex-shrink-0">
                {currentSimulatedAd.cta}
              </button>
            </div>
            
            {/* Ad indicators */}
            <div className="flex justify-center mt-3 space-x-2">
              {simulatedAds.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAd ? 'bg-white scale-110' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center my-4 px-2 sm:px-4 overflow-hidden ${className}`}>
      {/* Desktop Banner */}
      {showOnDesktop && (
        <div className="hidden md:block w-full max-w-4xl overflow-hidden">
          <div className="w-full overflow-hidden rounded-lg">
            <GoogleAdSense
              slot={ADSENSE_CONFIG.AD_SLOTS.BANNER_AD}
              size={ADSENSE_CONFIG.AD_SIZES.LEADERBOARD}
              format="horizontal"
              className="w-full max-w-full overflow-hidden"
              responsive={true}
            />
          </div>
        </div>
      )}
      
      {/* Mobile Banner */}
      {showOnMobile && (
        <div className="block md:hidden w-full max-w-2xl overflow-hidden">
          <div className="w-full overflow-hidden rounded-lg">
            <GoogleAdSense
              slot={ADSENSE_CONFIG.AD_SLOTS.BANNER_AD}
              size={ADSENSE_CONFIG.AD_SIZES.MOBILE_BANNER}
              format="horizontal"
              className="w-full max-w-full overflow-hidden"
              responsive={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerAd;
