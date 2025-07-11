import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import BannerAd from './BannerAd';
import RectangleAd from './RectangleAd';
import NativeAd from './NativeAd';
import InterstitialAd from './InterstitialAd';
import GoogleAdSense from './GoogleAdSense';

const AdManager = ({ 
  type = 'banner', 
  position = 'top',
  context = 'general',
  className = '',
  userContext = {},
  ...props 
}) => {
  const { showAds, getCurrentPlan, isLoading } = useSubscription();
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Don't show ads if subscription is still loading or user has premium subscription
  if (isLoading || !showAds()) {
    return null;
  }

  // Get user context for ad targeting
  const adContext = {
    userRole: user?.role || 'parent',
    planType: getCurrentPlan()?.id || 'free',
    theme: isDark ? 'dark' : 'light',
    context,
    ...userContext
  };

  // Check if Google AdSense is enabled and configured
  const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const bannerAdUnit = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT;
  const sidebarAdUnit = import.meta.env.VITE_ADSENSE_SIDEBAR_AD_UNIT;
  
  // Render appropriate ad component based on type
  const renderAd = () => {
    // Prefer Google AdSense if available and configured
    if (isAdSenseEnabled && publisherId) {
      switch (type) {
      case 'banner':
        if (bannerAdUnit && bannerAdUnit !== 'your-banner-ad-unit-id-here') {
          return (
            <GoogleAdSense 
              adSlot={bannerAdUnit}
              adFormat="horizontal"
              className={`w-full ${className}`}
              style={{ height: '90px' }}
              {...props}
            />
          );
        }
        break;
      case 'rectangle':
        if (sidebarAdUnit && sidebarAdUnit !== 'your-sidebar-ad-unit-id-here') {
          return (
            <GoogleAdSense 
              adSlot={sidebarAdUnit}
              adFormat="rectangle"
              className={`w-full ${className}`}
              style={{ height: '250px' }}
              {...props}
            />
          );
        }
        break;
      }
    }
    
    // Fallback to custom ad components
    switch (type) {
    case 'banner':
      return <BannerAd position={position} context={adContext} {...props} />;
    case 'rectangle':
      return <RectangleAd context={adContext} {...props} />;
    case 'native':
      return <NativeAd context={adContext} {...props} />;
    case 'interstitial':
      return <InterstitialAd context={adContext} {...props} />;
    default:
      return <BannerAd position={position} context={adContext} {...props} />;
    }
  };

  const adComponent = renderAd();
  
  // Don't render wrapper if no ad to show
  if (!adComponent) {
    return null;
  }
  
  return adComponent;
};

export default AdManager;
