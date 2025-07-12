import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaCrown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SubscriptionBanner = () => {
  const { subscription, loading } = useSubscription();
  const { isDark } = useTheme();

  // Don't show if loading or has premium subscription
  if (loading || subscription?.status === 'active') {
    return null;
  }

  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <FaCrown className="text-yellow-500 text-sm md:text-base flex-shrink-0" />
            <p className={`text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <span className="font-medium">Go Premium</span>
              <span className="hidden sm:inline"> • Ad-free experience</span>
            </p>
          </div>
          
          <Link 
            to="/checkout"
            className={`text-xs md:text-sm px-3 py-1 rounded transition-colors flex-shrink-0 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner; 