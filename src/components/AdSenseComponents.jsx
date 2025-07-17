import React from 'react';
import GoogleAd from './GoogleAd';
import useMobileDetection from '../hooks/useMobileDetection';

// Pre-configured ad components for different placements
export const HeaderBannerAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
    style={{ 
      display: 'block', 
      margin: '8px auto',
      clear: 'both',
      maxWidth: '728px',
      height: '90px',
      width: '100%',
      overflow: 'hidden'
    }}
    format="auto"
    responsive={false}
    hideWhenEmpty={true}
    className={`mobile-header-safe ${className}`}
  />
);

export const MobileBannerAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_MOBILE_BANNER}
    style={{ 
      display: 'block', 
      margin: '8px auto',
      clear: 'both',
      maxWidth: '320px',
      height: '50px',
      width: '100%',
      overflow: 'hidden'
    }}
    format="auto"
    responsive={false}
    hideWhenEmpty={true}
    className={`mobile-optimized ${className}`}
  />
);

export const ContentRectangleAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
    style={{ display: 'block', margin: '8px 0' }}  // Small margin for content ads
    format="rectangle"
    responsive={true}
    hideWhenEmpty={true}  // Hide when no ads
    className={className}
  />
);

export const SidebarSkyscraperAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER}
    style={{ display: 'block', margin: '8px 0' }}  // Small margin
    format="auto"
    responsive={true}
    hideWhenEmpty={true}  // Hide when no ads
    className={className}
  />
);

export const FooterBannerAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_FOOTER_BANNER}
    style={{ display: 'block', margin: '4px 0' }}  // Minimal margin
    format="auto"
    responsive={true}
    hideWhenEmpty={true}  // Hide when no ads
    className={className}
  />
);

export const InFeedNativeAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
    style={{ display: 'block', margin: '12px 0' }}  // Medium margin for in-feed
    format="fluid"
    responsive={true}
    hideWhenEmpty={true}  // Hide when no ads
    className={className}
  />
);

export const InArticleNativeAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE}
    style={{ display: 'block' }}
    format="fluid"
    responsive={true}
    className={className}
  />
);

// Mobile-optimized responsive ad component
export const ResponsiveAd = ({ placement = 'content', className = '' }) => {
  const { isMobile, isTablet } = useMobileDetection();
  
  // Mobile-first ad slot selection
  const getMobileOptimizedSlot = () => {
    if (isMobile) {
      // On mobile, prefer mobile banner for header/footer, in-feed for content
      switch (placement) {
        case 'header':
        case 'footer':
          return import.meta.env.VITE_ADSENSE_MOBILE_BANNER;
        case 'content':
        case 'sidebar':
          return import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE;
        case 'infeed':
        case 'article':
          return import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE;
        default:
          return import.meta.env.VITE_ADSENSE_MOBILE_BANNER;
      }
    } else {
      // Desktop/tablet - use original mapping
      return slotMap[placement];
    }
  };

  const slotMap = {
    header: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
    mobile: import.meta.env.VITE_ADSENSE_MOBILE_BANNER,
    content: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
    sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
    footer: import.meta.env.VITE_ADSENSE_FOOTER_BANNER,
    infeed: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
    article: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE
  };

  const getFormat = () => {
    if (isMobile) {
      // Mobile-optimized formats
      switch (placement) {
        case 'header':
        case 'footer':
          return 'auto'; // Banner style
        case 'content':
        case 'sidebar':
        case 'infeed':
        case 'article':
          return 'fluid'; // Native/responsive
        default:
          return 'fluid';
      }
    } else {
      // Desktop formats
      const formatMap = {
        header: 'auto',
        mobile: 'auto',
        content: 'rectangle',
        sidebar: 'auto',
        footer: 'auto',
        infeed: 'fluid',
        article: 'fluid'
      };
      return formatMap[placement] || 'auto';
    }
  };

  const getMobileClass = () => {
    let baseClass = className;
    
    if (isMobile) {
      baseClass += ' mobile-optimized';
      
      if (placement === 'header') {
        baseClass += ' mobile-header-safe';
      }
    }
    
    return baseClass;
  };

  return (
    <GoogleAd
      slot={getMobileOptimizedSlot()}
      style={{ display: 'block' }}
      format={getFormat()}
      responsive={true}
      className={getMobileClass()}
    />
  );
};

export default {
  GoogleAd,
  HeaderBannerAd,
  MobileBannerAd,
  ContentRectangleAd,
  SidebarSkyscraperAd,
  FooterBannerAd,
  InFeedNativeAd,
  InArticleNativeAd,
  ResponsiveAd
};
