import React from 'react';
import GoogleAd from './GoogleAd';

// Pre-configured ad components for different placements
export const HeaderBannerAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
    style={{ display: 'block' }}
    format="auto"
    responsive={true}
    className={className}
  />
);

export const MobileBannerAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_MOBILE_BANNER}
    style={{ display: 'block' }}
    format="auto"
    responsive={true}
    className={className}
  />
);

export const ContentRectangleAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
    style={{ display: 'block' }}
    format="rectangle"
    responsive={true}
    className={className}
  />
);

export const SidebarSkyscraperAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER}
    style={{ display: 'block' }}
    format="auto"
    responsive={true}
    className={className}
  />
);

export const FooterBannerAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_FOOTER_BANNER}
    style={{ display: 'block' }}
    format="auto"
    responsive={true}
    className={className}
  />
);

export const InFeedNativeAd = ({ className = '' }) => (
  <GoogleAd
    slot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
    style={{ display: 'block' }}
    format="fluid"
    responsive={true}
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

// Responsive ad component that automatically selects the best format
export const ResponsiveAd = ({ placement = 'content', className = '' }) => {
  const slotMap = {
    header: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
    mobile: import.meta.env.VITE_ADSENSE_MOBILE_BANNER,
    content: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
    sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
    footer: import.meta.env.VITE_ADSENSE_FOOTER_BANNER,
    infeed: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
    article: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE
  };

  const formatMap = {
    header: 'auto',
    mobile: 'auto',
    content: 'rectangle',
    sidebar: 'auto',
    footer: 'auto',
    infeed: 'fluid',
    article: 'fluid'
  };

  return (
    <GoogleAd
      slot={slotMap[placement]}
      style={{ display: 'block' }}
      format={formatMap[placement] || 'auto'}
      responsive={true}
      className={className}
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
