import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import GoogleAdSense from './GoogleAdSense';
import { ADSENSE_CONFIG } from '../../config/adsense-config';

/**
 * Smart Ad Manager Component
 * Intelligently places ads based on user behavior, subscription status, and engagement
 */
const SmartAdManager = ({ 
  position = 'content', // 'header', 'content', 'sidebar', 'footer', 'inline'
  page = 'default',
  userSegment = 'casual',
  className = '',
  children
}) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [adConfig, setAdConfig] = useState(null);
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [userBehavior, setUserBehavior] = useState({
    pageViews: 0,
    timeOnSite: 0,
    adsViewed: 0,
    sessionsThisWeek: 0
  });

  // Check if user has premium subscription
  const isPremium = subscription?.status === 'active' && subscription?.type !== 'free';

  // User behavior tracking
  useEffect(() => {
    // Load user behavior from localStorage
    const savedBehavior = localStorage.getItem('userAdBehavior');
    if (savedBehavior) {
      setUserBehavior(JSON.parse(savedBehavior));
    }

    // Track page view
    const newBehavior = {
      ...userBehavior,
      pageViews: userBehavior.pageViews + 1
    };
    setUserBehavior(newBehavior);
    localStorage.setItem('userAdBehavior', JSON.stringify(newBehavior));

    // Track session time
    const startTime = Date.now();
    return () => {
      const sessionTime = Date.now() - startTime;
      const updatedBehavior = {
        ...newBehavior,
        timeOnSite: newBehavior.timeOnSite + sessionTime
      };
      localStorage.setItem('userAdBehavior', JSON.stringify(updatedBehavior));
    };
  }, [page]);

  // Ad configuration based on user segment and behavior
  useEffect(() => {
    if (isPremium) {
      setShouldShowAd(false);
      return;
    }

    const config = calculateAdConfig(userSegment, userBehavior, position, page);
    setAdConfig(config);
    setShouldShowAd(config.shouldShow);
  }, [userSegment, userBehavior, position, page, isPremium]);

  // Calculate optimal ad configuration
  const calculateAdConfig = (segment, behavior, pos, currentPage) => {
    const baseConfig = {
      shouldShow: true,
      adType: 'display',
      size: ADSENSE_CONFIG.AD_SIZES.RECTANGLE,
      slot: ADSENSE_CONFIG.AD_SLOTS.DISPLAY_AD,
      frequency: 'normal'
    };

    // User segment-based configuration
    const segmentConfigs = {
      heavy: {
        frequency: 'high',
        adType: 'mixed',
        adsPerSession: 6
      },
      casual: {
        frequency: 'normal',
        adType: 'display',
        adsPerSession: 3
      },
      trial: {
        frequency: 'low',
        adType: 'premium_teaser',
        adsPerSession: 2
      }
    };

    // Page-specific configuration
    const pageConfigs = {
      dashboard: {
        priority: 'high',
        positions: ['header', 'sidebar', 'content']
      },
      homework: {
        priority: 'high',
        positions: ['header', 'inline', 'sidebar']
      },
      classes: {
        priority: 'medium',
        positions: ['content', 'sidebar']
      },
      activities: {
        priority: 'medium',
        positions: ['content', 'footer']
      }
    };

    // Position-specific configuration
    const positionConfigs = {
      header: {
        size: ADSENSE_CONFIG.AD_SIZES.LEADERBOARD,
        slot: ADSENSE_CONFIG.AD_SLOTS.BANNER_AD,
        priority: 'high'
      },
      content: {
        size: ADSENSE_CONFIG.AD_SIZES.RECTANGLE,
        slot: ADSENSE_CONFIG.AD_SLOTS.DISPLAY_AD,
        priority: 'medium'
      },
      sidebar: {
        size: ADSENSE_CONFIG.AD_SIZES.SIDEBAR,
        slot: ADSENSE_CONFIG.AD_SLOTS.SIDEBAR_AD,
        priority: 'medium'
      },
      footer: {
        size: ADSENSE_CONFIG.AD_SIZES.BANNER,
        slot: ADSENSE_CONFIG.AD_SLOTS.BANNER_AD,
        priority: 'low'
      }
    };

    // Combine configurations
    const segmentConfig = segmentConfigs[segment] || segmentConfigs.casual;
    const pageConfig = pageConfigs[currentPage] || pageConfigs.default;
    const positionConfig = positionConfigs[pos] || positionConfigs.content;

    // Check if user has seen too many ads
    const adLimit = segmentConfig.adsPerSession;
    if (behavior.adsViewed >= adLimit) {
      return { ...baseConfig, shouldShow: false };
    }

    // Check if position is allowed for this page
    if (pageConfig.positions && !pageConfig.positions.includes(pos)) {
      return { ...baseConfig, shouldShow: false };
    }

    // Apply frequency rules
    if (segmentConfig.frequency === 'low' && behavior.pageViews % 3 !== 0) {
      return { ...baseConfig, shouldShow: false };
    }

    if (segmentConfig.frequency === 'high' && behavior.pageViews % 1 !== 0) {
      return { ...baseConfig, shouldShow: true };
    }

    return {
      ...baseConfig,
      ...positionConfig,
      adType: segmentConfig.adType,
      frequency: segmentConfig.frequency
    };
  };

  // Track ad view
  const handleAdViewed = () => {
    const newBehavior = {
      ...userBehavior,
      adsViewed: userBehavior.adsViewed + 1
    };
    setUserBehavior(newBehavior);
    localStorage.setItem('userAdBehavior', JSON.stringify(newBehavior));
  };

  // Don't show ads to premium users
  if (isPremium) {
    return children || null;
  }

  // Don't show if config says no
  if (!shouldShowAd || !adConfig) {
    return children || null;
  }

  // Render ad with children
  return (
    <div className={`smart-ad-container ${className}`}>
      {/* Ad Content */}
      <div className="ad-wrapper" onLoad={handleAdViewed}>
        {adConfig.adType === 'premium_teaser' ? (
          <PremiumTeaser position={position} />
        ) : (
          <GoogleAdSense
            slot={adConfig.slot}
            size={adConfig.size}
            format={position === 'sidebar' ? 'vertical' : 'auto'}
            className="smart-ad"
            responsive={true}
          />
        )}
      </div>

      {/* Optional children content */}
      {children && (
        <div className="content-wrapper">
          {children}
        </div>
      )}
    </div>
  );
};

// Premium teaser component for trial users
const PremiumTeaser = ({ position }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`p-4 rounded-lg border-2 border-dashed ${
      isDark ? 'border-blue-400 bg-blue-900/20' : 'border-blue-300 bg-blue-50'
    }`}>
      <div className="text-center">
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          🚀 Upgrade to Premium
        </h3>
        <p className={`text-sm mb-3 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
          Remove ads and unlock all features
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default SmartAdManager; 