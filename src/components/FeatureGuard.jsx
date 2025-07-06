import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCrown, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { toast } from 'react-toastify';

const FeatureGuard = ({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true, 
  blockAccess = true,
  requiredPlan = 'premium'
}) => {
  const { isDark } = useTheme();
  const { hasFeature, getCurrentPlan, plans } = useSubscription();
  const navigate = useNavigate();

  const currentPlan = getCurrentPlan();
  const hasAccess = hasFeature(feature);
  const targetPlan = plans[requiredPlan];

  if (hasAccess) {
    return children;
  }

  if (fallback && !blockAccess) {
    return fallback;
  }

  const handleUpgrade = () => {
    navigate(`/checkout?plan=${requiredPlan}`);
  };

  const UpgradePrompt = () => (
    <div className={`p-6 rounded-lg border-2 border-dashed text-center ${
      isDark 
        ? 'border-gray-600 bg-gray-800/50' 
        : 'border-gray-300 bg-gray-50'
    }`}>
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <FaLock className={`text-2xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Upgrade Required
      </h3>
      
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        This feature requires the {targetPlan?.name} plan or higher.
        You're currently on the {currentPlan?.name} plan.
      </p>

      {showUpgrade && (
        <button
          onClick={handleUpgrade}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
        >
          <FaCrown className="w-4 h-4 mr-2" />
          Upgrade to {targetPlan?.name}
          <FaArrowRight className="w-4 h-4 ml-2" />
        </button>
      )}
    </div>
  );

  return blockAccess ? <UpgradePrompt /> : null;
};

// Higher-order component for route protection
export const withFeatureGuard = (Component, feature, requiredPlan = 'premium') => {
  return (props) => (
    <FeatureGuard feature={feature} requiredPlan={requiredPlan}>
      <Component {...props} />
    </FeatureGuard>
  );
};

// Hook for checking feature access
export const useFeatureAccess = () => {
  const { hasFeature, getFeatureLimit, canAddChild, canUploadFile } = useSubscription();
  
  const checkFeatureAccess = (feature, showToast = true) => {
    const access = hasFeature(feature);
    if (!access && showToast) {
      toast.warning('This feature requires a plan upgrade');
    }
    return access;
  };

  const checkFileUpload = (fileSizeInMB, showToast = true) => {
    const canUpload = canUploadFile(fileSizeInMB);
    if (!canUpload && showToast) {
      const maxSize = getFeatureLimit('maxFileSize');
      toast.error(`File size exceeds your plan limit of ${maxSize}MB`);
    }
    return canUpload;
  };

  const checkChildLimit = (showToast = true) => {
    const canAdd = canAddChild();
    if (!canAdd && showToast) {
      const maxChildren = getFeatureLimit('maxChildren');
      toast.error(`You've reached your plan limit of ${maxChildren} children`);
    }
    return canAdd;
  };

  return {
    checkFeatureAccess,
    checkFileUpload,
    checkChildLimit,
    hasFeature,
    getFeatureLimit
  };
};

export default FeatureGuard;
