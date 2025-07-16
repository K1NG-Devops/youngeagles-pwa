import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Configuration for interstitial ads
const INTERSTITIAL_CONFIG = {
  // Show interstitial ad after this many page navigations
  navigationThreshold: 3,
  // Minimum time between interstitial ads (in milliseconds)
  cooldownTime: 5 * 60 * 1000, // 5 minutes
  // Delay before showing close button (in milliseconds)
  closeButtonDelay: 3000, // 3 seconds
  // Pages where interstitial ads should not be shown
  excludedPaths: ['/login', '/register', '/checkout', '/payment-success', '/payment-cancel'],
  // Only show ads to these user roles
  allowedRoles: ['parent', 'teacher'] // Don't show to admin users
};

const useInterstitialAd = (user) => {
  const location = useLocation();
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [navigationCount, setNavigationCount] = useState(0);
  const [lastInterstitialTime, setLastInterstitialTime] = useState(0);

  // Check if ads are enabled
  const isAdsEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  // Check if current conditions allow showing interstitial
  const shouldShowInterstitial = useCallback(() => {
    // Don't show if ads are disabled and not in test mode
    if (!isAdsEnabled && !isTestMode) {
      return false;
    }

    // Don't show if user is not logged in
    if (!user) {
      return false;
    }

    // Don't show to admin users (unless in test mode)
    if (!isTestMode && user.role === 'admin') {
      return false;
    }

    // Don't show on excluded paths
    if (INTERSTITIAL_CONFIG.excludedPaths.includes(location.pathname)) {
      return false;
    }

    // Don't show if still in cooldown period
    const now = Date.now();
    if (now - lastInterstitialTime < INTERSTITIAL_CONFIG.cooldownTime) {
      return false;
    }

    // Don't show if haven't reached navigation threshold
    if (navigationCount < INTERSTITIAL_CONFIG.navigationThreshold) {
      return false;
    }

    return true;
  }, [isAdsEnabled, isTestMode, user, location.pathname, lastInterstitialTime, navigationCount]);

  // Track navigation changes
  useEffect(() => {
    // Don't count initial page load
    if (navigationCount === 0) {
      setNavigationCount(1);
      return;
    }

    // Increment navigation count
    setNavigationCount(prev => prev + 1);

    // Check if we should show interstitial
    if (shouldShowInterstitial()) {
      // Small delay to let page transition complete
      const timer = setTimeout(() => {
        setShowInterstitial(true);
        setLastInterstitialTime(Date.now());
        setNavigationCount(0); // Reset counter
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, shouldShowInterstitial]);

  // Function to close interstitial
  const closeInterstitial = useCallback(() => {
    setShowInterstitial(false);
  }, []);

  // Function to manually trigger interstitial (for testing)
  const triggerInterstitial = useCallback(() => {
    if (user) {
      setShowInterstitial(true);
      setLastInterstitialTime(Date.now());
      setNavigationCount(0);
    }
  }, [user]);

  // Debug info (available in development)
  const debugInfo = {
    navigationCount,
    lastInterstitialTime,
    cooldownRemaining: Math.max(0, INTERSTITIAL_CONFIG.cooldownTime - (Date.now() - lastInterstitialTime)),
    shouldShow: shouldShowInterstitial(),
    currentPath: location.pathname,
    isExcluded: INTERSTITIAL_CONFIG.excludedPaths.includes(location.pathname)
  };

  return {
    showInterstitial,
    closeInterstitial,
    triggerInterstitial,
    debugInfo,
    config: INTERSTITIAL_CONFIG
  };
};

export default useInterstitialAd;
