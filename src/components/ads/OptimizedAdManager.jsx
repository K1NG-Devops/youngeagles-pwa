import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import LazyAd from './LazyAd';

const OptimizedAdManager = ({ 
  position = 'content', 
  pageType = 'general',
  className = '',
  priority = 'medium',
  maxAdsPerPage = 3,
  forceShow = false
}) => {
  const location = useLocation();
  const { showAds } = useSubscription();
  const { isDark } = useTheme();
  const [adsShownOnPage, setAdsShownOnPage] = useState(0);
  const [canShowAd, setCanShowAd] = useState(false);
  const [adSlot, setAdSlot] = useState(null);

  // Page-specific ad strategies - SMART AD PLACEMENT
  const pageStrategies = useMemo(() => ({
    dashboard: {
      maxAds: 2,
      allowedPositions: ['header', 'content-middle'],
      cooldownMinutes: 30,
      priority: ['content-middle']
    },
    homework: {
      maxAds: 1,
      allowedPositions: ['native'],
      cooldownMinutes: 45,
      priority: ['native']
    },
    activities: {
      maxAds: 2,
      allowedPositions: ['header', 'content-middle'],
      cooldownMinutes: 20,
      priority: ['content-middle']
    },
    events: {
      maxAds: 2,
      allowedPositions: ['header', 'content-list'],
      cooldownMinutes: 25,
      priority: ['content-list']
    },
    default: {
      maxAds: 3,
      allowedPositions: ['header', 'content-middle', 'sidebar'],
      cooldownMinutes: 15,
      priority: ['content-middle']
    }
  }), []);

  // Get strategy for current page
  const getPageStrategy = useCallback(() => {
    const pathName = location.pathname.substring(1) || 'dashboard';
    return pageStrategies[pathName] || pageStrategies.default;
  }, [location.pathname, pageStrategies]);

  // Check if ad should be shown - PERFORMANCE OPTIMIZED
  useEffect(() => {
    if (!showAds() && !forceShow) {
      setCanShowAd(false);
      return;
    }

    const strategy = getPageStrategy();
    const sessionKey = `ads_${location.pathname}_${new Date().getTime()}`;
    const currentAdsShown = parseInt(sessionStorage.getItem(sessionKey) || '0');

    // Check ad limits
    if (currentAdsShown >= strategy.maxAds) {
      setCanShowAd(false);
      return;
    }

    // Check if position is allowed
    if (!strategy.allowedPositions.includes(position)) {
      setCanShowAd(false);
      return;
    }

    // Check cooldown
    const lastAdTime = localStorage.getItem(`lastAd_${position}`);
    const cooldownMs = strategy.cooldownMinutes * 60 * 1000;
    
    if (lastAdTime && (Date.now() - parseInt(lastAdTime)) < cooldownMs) {
      setCanShowAd(false);
      return;
    }

    // Get appropriate ad slot
    const slot = getAdSlot();
    if (!slot) {
      setCanShowAd(false);
      return;
    }

    // All checks passed
    setCanShowAd(true);
    setAdSlot(slot);
    
    // Update counters
    sessionStorage.setItem(sessionKey, String(currentAdsShown + 1));
    localStorage.setItem(`lastAd_${position}`, String(Date.now()));
    
  }, [location.pathname, position, showAds, forceShow, getPageStrategy]);

  // Get ad slot based on position - ENVIRONMENT VARIABLE MAPPING
  const getAdSlot = useCallback(() => {
    const slots = {
      header: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
      'content-middle': import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
      sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
      native: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE,
      'content-list': import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
      footer: import.meta.env.VITE_ADSENSE_FOOTER_BANNER,
      mobile: import.meta.env.VITE_ADSENSE_MOBILE_BANNER
    };
    return slots[position] || slots.header;
  }, [position]);

  // Get ad format based on position
  const getAdFormat = useCallback(() => {
    const formats = {
      header: 'auto',
      'content-middle': 'rectangle',
      sidebar: 'rectangle',
      native: 'fluid',
      'content-list': 'fluid',
      footer: 'auto',
      mobile: 'auto'
    };
    return formats[position] || 'auto';
  }, [position]);

  // Don't render if can't show ad
  if (!canShowAd || !adSlot) {
    return null;
  }

  return (
    <div className={`optimized-ad-container w-full overflow-hidden ${className}`}>
      <LazyAd
        adSlot={adSlot}
        adFormat={getAdFormat()}
        className={`w-full max-w-full`}
        showPlaceholderWhenEmpty={false}
        rootMargin="100px"
        threshold={0.1}
        style={{
          width: '100%',
          maxWidth: '100%',
          minHeight: position === 'header' ? '50px' : position === 'sidebar' ? '200px' : '90px',
          overflow: 'visible',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};

export default OptimizedAdManager;
