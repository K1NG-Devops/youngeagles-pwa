import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaExclamationTriangle, FaCreditCard } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const SubscriptionExpiredModal = () => {
  const { isDark } = useTheme();
  const { isTrialExpired, isSubscriptionExpired, subscription, plans } = useSubscription();
  const navigate = useNavigate();

  // Don't show modal if subscription is active
  if (!isTrialExpired() && !isSubscriptionExpired()) {
    return null;
  }

  const isTrialExp = isTrialExpired();
  const currentPlan = plans[subscription?.plan_id] || plans.free;

  const handleUpgrade = () => {
    navigate('/management?tab=subscription');
  };

  const handleViewPlans = () => {
    navigate('/management?tab=subscription');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-2xl shadow-2xl transform transition-all ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${
              isTrialExp 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {isTrialExp ? <FaCrown size={24} /> : <FaExclamationTriangle size={24} />}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isTrialExp ? 'Trial Period Ended' : 'Subscription Expired'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isTrialExp 
                  ? 'Your 7-day free trial has ended' 
                  : 'Your subscription has expired'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`rounded-lg p-4 mb-6 ${
            isTrialExp 
              ? isDark ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'
              : isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {isTrialExp ? (
                <>
                  Thank you for trying Young Eagles PWA! To continue using all features, 
                  please choose a subscription plan that works best for you.
                </>
              ) : (
                <>
                  Your {currentPlan.name} subscription has expired. Please renew your 
                  subscription to continue accessing all features.
                </>
              )}
            </p>
          </div>

          {/* Limited Access Notice */}
          <div className={`rounded-lg p-4 mb-6 ${
            isDark ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Limited Access Mode
            </h4>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• View existing data only</li>
              <li>• No new children can be added</li>
              <li>• File uploads disabled</li>
              <li>• Messaging features limited</li>
            </ul>
          </div>

          {/* Current Plan Info */}
          <div className={`rounded-lg p-4 mb-6 border ${
            isDark ? 'bg-purple-900/20 border-purple-700/30' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPlan.name} Plan
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentPlan.description}
                </p>
              </div>
              <div className="text-right">
                <div className={`font-bold text-lg ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  R{currentPlan.price}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  per month
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <FaCreditCard />
              <span>
                {isTrialExp ? 'Choose Your Plan' : 'Renew Subscription'}
              </span>
            </button>
            
            <button
              onClick={handleViewPlans}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all border ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              View All Plans
            </button>
          </div>
          
          <p className={`text-xs mt-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You can continue with limited access or upgrade anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredModal;
