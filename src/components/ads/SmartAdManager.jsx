import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import LazyAd from './LazyAd';

// Enhanced ad strategies per page
const AD_STRATEGIES = {
  'dashboard': {
    maxAdsPerView: 2,
    cooldownMinutes: 30,
    priority: ['header', 'native'],
    mobileMaxAds: 1
  },
  'homework': {
    maxAdsPerView: 1,
    cooldownMinutes: 45,
    priority: ['native'],
    mobileMaxAds: 1
  },
  'activities': {
    maxAdsPerView: 2,
    cooldownMinutes: 20,
    priority: ['header', 'content-middle'],
    mobileMaxAds: 1
  },
  'events': {
    maxAdsPerView: 2,
    cooldownMinutes: 25,
    priority: ['header', 'content-list'],
    mobileMaxAds: 1
  },
  'children': {
    maxAdsPerView: 1,
    cooldownMinutes: 40,
    priority: ['native'],
    mobileMaxAds: 1
  },
  'default': {
    maxAdsPerView: 1,
    cooldownMinutes: 30,
    priority: ['native'],
    mobileMaxAds: 1
  }
};

const SmartAdManager = ({ 
  position = 'content',
  pageType = 'default',
  className = '',
  forceShow = false,
  ...props
}) => {
  const location = useLocation();
  const { showAds, shouldShowAd, recordAdShown } = useSubscription();
  const [canShowAd, setCanShowAd] = useState(false);
  const [adSlot, setAdSlot] = useState(null);
  const [adFormat, setAdFormat] = useState('auto');

  // Check if mobile
  const isMobile = window.innerWidth < 768;

  // Get strategy for current page
  const getPageStrategy = () => {
    const path = location.pathname.replace('/', '');
    return AD_STRATEGIES[path] || AD_STRATEGIES.default;
  };

  // Smart ad slot selection
  const getSmartAdSlot = (position) => {
    const slots = {
      'header': import.meta.env.VITE_ADSENSE_HEADER_BANNER,
      'footer': import.meta.env.VITE_ADSENSE_FOOTER_BANNER,
      'sidebar': import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
      'native': import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
      'content-middle': import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE,
      'content-list': import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
      'mobile': import.meta.env.VITE_ADSENSE_MOBILE_BANNER
    };

    // Mobile-specific slot selection
    if (isMobile && position === 'sidebar') {
      return null; // Don't show sidebar ads on mobile
    }

    return slots[position] || slots['native'];
  };

  // Get ad format based on position
  const getAdFormat = (position) => {
    const formats = {
      'header': 'horizontal',
      'footer': 'horizontal',
      'sidebar': 'rectangle',
      'native': 'fluid',
      'content-middle': 'fluid',
      'content-list': 'rectangle',
      'mobile': 'auto'
    };

    return formats[position] || 'auto';
  };

  // Check ad display conditions
  useEffect(() => {
    if (!showAds() && !forceShow) {
      setCanShowAd(false);
      return;
    }

    const strategy = getPageStrategy();
    const maxAds = isMobile ? strategy.mobileMaxAds : strategy.maxAdsPerView;
    
    // Get current page ad count from session storage
    const pageAdKey = `ads_shown_${location.pathname}_${Date.now()}`;
    const currentPageAds = parseInt(sessionStorage.getItem(pageAdKey) || '0');

    // Check if we've reached the limit
    if (currentPageAds >= maxAds) {
      setCanShowAd(false);
      return;
    }

    // Check if position is in priority list
    if (!strategy.priority.includes(position)) {
      setCanShowAd(false);
      return;
    }

    // Check cooldown
    const shouldShow = shouldShowAd(pageType);
    if (!shouldShow) {
      setCanShowAd(false);
      return;
    }

    // Get ad slot
    const slot = getSmartAdSlot(position);
    if (!slot) {
      setCanShowAd(false);
      return;
    }

    // All checks passed
    setAdSlot(slot);
    setAdFormat(getAdFormat(position));
    setCanShowAd(true);

    // Update page ad count
    sessionStorage.setItem(pageAdKey, String(currentPageAds + 1));
    
    // Record ad shown
    recordAdShown(pageType);

  }, [location.pathname, position, pageType, showAds, shouldShowAd, recordAdShown, forceShow]);

  // Don't render if conditions not met
  if (!canShowAd || !adSlot) {
    return null;
  }

  // Responsive styles based on position
  const getResponsiveStyles = () => {
    const baseStyle = {
      display: 'block',
      margin: '16px 0'
    };

    switch (position) {
    case 'header':
      return { ...baseStyle, minHeight: '50px', maxHeight: '90px' };
    case 'sidebar':
      return { ...baseStyle, minHeight: '250px', maxWidth: '300px' };
    case 'native':
    case 'content-middle':
      return { ...baseStyle, minHeight: '100px', maxHeight: '300px' };
    case 'content-list':
      return { ...baseStyle, minHeight: '200px', maxHeight: '250px' };
    default:
      return baseStyle;
    }
  };

  return (
    <LazyAd
      adSlot={adSlot}
      adFormat={adFormat}
      className={`smart-ad smart-ad-${position} ${className}`}
      style={getResponsiveStyles()}
      threshold={0.2}
      rootMargin="100px"
      {...props}
    />
  );
};

export default SmartAdManager;
