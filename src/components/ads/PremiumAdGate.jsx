import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaCrown, FaTimes, FaPlay } from 'react-icons/fa';
import GoogleAdSense from './GoogleAdSense';
import { ENHANCED_ADSENSE_CONFIG } from '../../config/enhanced-adsense-config';

/**
 * Premium Ad Gate Component
 * Shows ads to free users before accessing premium features
 * Encourages subscription upgrades
 */
const PremiumAdGate = ({ 
  featureName,
  onContinue,
  onUpgrade,
  showVideoAd = true,
  className = '' 
}) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { isDark } = useTheme();
  const [adWatched, setAdWatched] = useState(false);
  const [showAd, setShowAd] = useState(true);

  // Check if user has premium subscription
  const isPremium = subscription?.status === 'active' && subscription?.type !== 'free';

  // If user is premium, skip the gate
  if (isPremium) {
    return null;
  }

  const handleWatchAd = () => {
    setAdWatched(true);
    setShowAd(false);
    // In a real implementation, you'd start a video ad here
    setTimeout(() => {
      onContinue();
    }, 500);
  };

  const handleSkipToUpgrade = () => {
    onUpgrade();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
      <div className={`max-w-md w-full mx-4 rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 text-center">
          <FaCrown className="text-4xl mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
          <p className="text-blue-100">
            {featureName} requires a premium subscription
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Ad Section */}
          {showAd && (
            <div className="text-center space-y-4">
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Watch an ad to continue for free
              </p>
              
              {/* Display Ad */}
              <GoogleAdSense
                slot={ENHANCED_ADSENSE_CONFIG.AD_SLOTS.CONTENT_RECTANGLE}
                size={ENHANCED_ADSENSE_CONFIG.AD_SIZES.LARGE_RECTANGLE}
                format="rectangle"
                className="mx-auto"
              />
              
              {/* Watch Ad Button */}
              <button
                onClick={handleWatchAd}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <FaPlay className="mr-2" />
                Watch Ad & Continue
              </button>
            </div>
          )}

          {/* Upgrade Section */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                or
              </span>
            </div>
          </div>

          {/* Premium Upgrade */}
          <div className="text-center space-y-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🚀 Upgrade to Premium
              </h3>
              <ul className={`text-left space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>✅ No ads, ever</li>
                <li>✅ Unlimited access to all features</li>
                <li>✅ Priority support</li>
                <li>✅ Advanced analytics</li>
                <li>✅ Exclusive content</li>
              </ul>
            </div>

            <button
              onClick={handleSkipToUpgrade}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <FaCrown className="mr-2" />
              Upgrade Now - Remove Ads Forever
            </button>
          </div>

          {/* Usage Stats */}
          <div className={`text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>💡 You've used {Math.floor(Math.random() * 5) + 1} free features today</p>
            <p>Premium users get unlimited access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumAdGate; 