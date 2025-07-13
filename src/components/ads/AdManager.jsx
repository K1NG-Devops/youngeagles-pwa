import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import GoogleAdSense from './GoogleAdSense';

const AdManager = ({ 
  position = 'content', 
  pageType = 'general',
  className = '',
  priority = 'medium'
}) => {
  const location = useLocation();
  const { showAds, getCurrentPlan } = useSubscription();
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [adFormat, setAdFormat] = useState('banner');
  const [adFrequency, setAdFrequency] = useState('medium');
  const [adSlot, setAdSlot] = useState(null);

  // High-value pages for premium ad placement
  const highValuePages = [
    '/dashboard',
    '/homework',
    '/activities',
    '/children',
    '/management',
    '/checkout'
  ];

  // Medium-value pages for standard ad placement
  const mediumValuePages = [
    '/classes',
    '/notifications',
    '/settings',
    '/events',
    '/submit-work'
  ];

  // Low-value pages for minimal ad placement
  const lowValuePages = [
    '/login',
    '/signup',
    '/register',
    '/privacy-policy',
    '/terms-of-service'
  ];

  // Get appropriate ad slot based on position and format
  const getAdSlot = (format) => {
    switch (format) {
    case 'banner':
      return position === 'header' 
        ? import.meta.env.VITE_ADSENSE_HEADER_BANNER
        : position === 'footer'
          ? import.meta.env.VITE_ADSENSE_FOOTER_BANNER
          : import.meta.env.VITE_ADSENSE_MOBILE_BANNER;
    case 'rectangle':
      return import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE;
    case 'native-article':
      return import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE;
    case 'native-feed':
      return import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE;
    case 'skyscraper':
      return import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER;
    default:
      return import.meta.env.VITE_ADSENSE_MOBILE_BANNER;
    }
  };

  // Revenue optimization strategy
  const getAdStrategy = () => {
    const currentPath = location.pathname;
    const plan = getCurrentPlan();
    
    // Premium users see fewer ads
    if (plan?.name === 'Premium' || plan?.name === 'Enterprise') {
      return {
        frequency: 'low',
        priority: 'low',
        formats: ['native-article']
      };
    }

    // High-value pages get premium ad treatment
    if (highValuePages.includes(currentPath)) {
      return {
        frequency: 'high',
        priority: 'high',
        formats: ['banner', 'rectangle', 'native-article', 'native-feed']
      };
    }

    // Medium-value pages get standard treatment
    if (mediumValuePages.includes(currentPath)) {
      return {
        frequency: 'medium',
        priority: 'medium',
        formats: ['banner', 'native-article']
      };
    }

    // Low-value pages get minimal ads
    if (lowValuePages.includes(currentPath)) {
      return {
        frequency: 'low',
        priority: 'low',
        formats: ['banner']
      };
    }

    // Default strategy
    return {
      frequency: 'medium',
      priority: 'medium',
      formats: ['banner', 'native-article']
    };
  };

  // Position-based ad format selection
  const getAdFormatByPosition = (position, strategy) => {
    switch (position) {
    case 'header':
      return 'banner';
    case 'sidebar':
      return 'rectangle';
    case 'content-top':
      return 'banner';
    case 'content-middle':
      return 'native-article';
    case 'content-bottom':
      return 'native-feed';
    case 'footer':
      return 'banner';
    case 'floating':
      return 'rectangle';
    default:
      return strategy.formats[0];
    }
  };

  // Ad frequency calculation
  const calculateAdFrequency = (strategy) => {
    const baseFrequency = {
      'low': 0.2,    // 20% chance
      'medium': 0.4, // 40% chance
      'high': 0.6    // 60% chance
    };

    // Boost frequency for high-priority positions
    let frequency = baseFrequency[strategy.frequency];
    
    if (priority === 'high') {
      frequency *= 1.5;
    } else if (priority === 'low') {
      frequency *= 0.7;
    }

    // Cap at 80% to avoid ad fatigue
    return Math.min(frequency, 0.8);
  };

  useEffect(() => {
    if (!showAds()) {
      setShouldShowAd(false);
      return;
    }

    const strategy = getAdStrategy();
    const format = getAdFormatByPosition(position, strategy);
    const frequency = calculateAdFrequency(strategy);
    const slot = getAdSlot(format);
    
    setAdFormat(format);
    setAdFrequency(strategy.frequency);
    setAdSlot(slot);
    
    // Determine if ad should show based on frequency
    setShouldShowAd(Math.random() < frequency);
  }, [location.pathname, position, priority, showAds]);

  // Don't show ads if user has premium subscription or ads are disabled
  if (!showAds() || !shouldShowAd || !adSlot) {
    return null;
  }

  // Special styling for header ads to prevent mobile interference
  const getPositionStyles = () => {
    if (position === 'header') {
      return {
        // Ensure header ad doesn't interfere with fixed header on mobile
        marginTop: window.innerWidth < 768 ? '80px' : '16px', // Add top margin on mobile
        marginBottom: '16px',
        position: 'relative',
        zIndex: 10, // Lower than header (z-50)
        display: 'block',
        textAlign: 'center'
      };
    }
    
    return {
      display: 'block',
      textAlign: 'center',
      margin: '16px 0'
    };
  };

  return (
    <div className={`ad-manager ad-position-${position} ${className}`}>
      <GoogleAdSense 
        adSlot={adSlot}
        adFormat={adFormat === 'banner' ? 'auto' : adFormat === 'rectangle' ? 'rectangle' : 'fluid'}
        fullWidthResponsive={true}
        className={`ad-${pageType} ad-${priority}-priority`}
        style={getPositionStyles()}
      />
    </div>
  );
};

// Strategic ad placement components for different page sections
export const HeaderAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="header" 
    pageType={pageType} 
    priority="high"
    className={`mobile-header-safe ${className}`}
  />
);

export const SidebarAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="sidebar" 
    pageType={pageType} 
    priority="medium"
    className={className}
  />
);

export const ContentTopAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="content-top" 
    pageType={pageType} 
    priority="high"
    className={className}
  />
);

export const ContentMiddleAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="content-middle" 
    pageType={pageType} 
    priority="medium"
    className={className}
  />
);

export const ContentBottomAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="content-bottom" 
    pageType={pageType} 
    priority="low"
    className={className}
  />
);

export const FooterAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="footer" 
    pageType={pageType} 
    priority="low"
    className={className}
  />
);

export const FloatingAd = ({ pageType, className = '' }) => (
  <AdManager 
    position="floating" 
    pageType={pageType} 
    priority="medium"
    className={className}
  />
);

export default AdManager;
