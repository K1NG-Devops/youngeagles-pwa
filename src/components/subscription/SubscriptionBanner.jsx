import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaTimes, FaCrown, FaGraduationCap, FaInfinity, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SubscriptionBanner = () => {
  const { subscription, loading } = useSubscription();
  const { isDark } = useTheme();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if loading, has premium subscription, or dismissed
  if (loading || subscription?.status === 'active' || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className={`w-full border-b ${isDark ? 'bg-gradient-to-r from-purple-900 to-blue-900 border-gray-700' : 'bg-gradient-to-r from-purple-600 to-blue-600 border-blue-700'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaCrown className="text-yellow-400 text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">
                🚀 Upgrade to Premium - Remove All Ads!
              </h3>
              <p className="text-blue-100 text-xs mt-1">
                Ad-free experience • Unlimited features • Priority support
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/checkout"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
            >
              Upgrade Now
            </Link>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-1 rounded transition-colors"
              title="Dismiss"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner; 