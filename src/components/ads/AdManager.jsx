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
  // Map to existing Vercel environment variables
  const headerBannerAdUnit = import.meta.env.VITE_ADSENSE_HEADER_BANNER;
  const footerBannerAdUnit = import.meta.env.VITE_ADSENSE_FOOTER_BANNER;
  const mobileBannerAdUnit = import.meta.env.VITE_ADSENSE_MOBILE_BANNER;
  const sidebarSkyscraperAdUnit = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER;
  const contentRectangleAdUnit = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE;
  const inFeedNativeAdUnit = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE;
  const inArticleNativeAdUnit = import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE;
  
  // Render appropriate ad component based on type
  const renderAd = () => {
    // Prefer Google AdSense if available and configured
    if (isAdSenseEnabled && publisherId) {
      switch (type) {
      case 'banner':
        // Use mobile banner for smaller screens, header banner for larger
        const bannerUnit = window.innerWidth < 768 ? mobileBannerAdUnit : headerBannerAdUnit;
        if (bannerUnit) {
          return (
            <div className="w-full" style={{ minHeight: '90px', maxHeight: '90px' }}>
              <GoogleAdSense 
                adSlot={bannerUnit}
                adFormat="horizontal"
                className={`w-full ${className}`}
                style={{ height: '90px', maxHeight: '90px' }}
                {...props}
              />
            </div>
          );
        }
        break;
      case 'rectangle':
      case 'sidebar':
        if (sidebarSkyscraperAdUnit) {
          return (
            <div className="w-full" style={{ minHeight: '250px', maxHeight: '600px' }}>
              <GoogleAdSense 
                adSlot={sidebarSkyscraperAdUnit}
                adFormat="vertical"
                className={`w-full ${className}`}
                style={{ height: '250px', maxHeight: '600px' }}
                {...props}
              />
            </div>
          );
        }
        break;
      case 'footer':
        if (footerBannerAdUnit) {
          return (
            <div className="w-full" style={{ minHeight: '90px', maxHeight: '90px' }}>
              <GoogleAdSense 
                adSlot={footerBannerAdUnit}
                adFormat="horizontal"
                className={`w-full ${className}`}
                style={{ height: '90px', maxHeight: '90px' }}
                {...props}
              />
            </div>
          );
        }
        break;
      case 'header':
        if (headerBannerAdUnit) {
          return (
            <div className="w-full" style={{ minHeight: '90px', maxHeight: '90px' }}>
              <GoogleAdSense 
                adSlot={headerBannerAdUnit}
                adFormat="horizontal"
                className={`w-full ${className}`}
                style={{ height: '90px', maxHeight: '90px' }}
                {...props}
              />
            </div>
          );
        }
        break;
      case 'content':
        if (contentRectangleAdUnit) {
          return (
            <div className="w-full" style={{ minHeight: '250px', maxHeight: '250px' }}>
              <GoogleAdSense 
                adSlot={contentRectangleAdUnit}
                adFormat="rectangle"
                className={`w-full ${className}`}
                style={{ height: '250px', maxHeight: '250px' }}
                {...props}
              />
            </div>
          );
        }
        break;
      case 'native':
      case 'in-feed':
        if (inFeedNativeAdUnit) {
          return (
            <GoogleAdSense 
              adSlot={inFeedNativeAdUnit}
              adFormat="fluid"
              adLayoutKey="-fb+5w+4e-db+86"
              className={`w-full ${className}`}
              {...props}
            />
          );
        }
        break;
      case 'in-article':
        if (inArticleNativeAdUnit) {
          return (
            <GoogleAdSense 
              adSlot={inArticleNativeAdUnit}
              adFormat="fluid"
              adLayoutKey="-fg+5n+6t-e7+r"
              className={`w-full ${className}`}
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
