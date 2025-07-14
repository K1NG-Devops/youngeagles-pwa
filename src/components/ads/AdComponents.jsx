import React from 'react';
import SimpleAd from './SimpleAd';

// Predefined ad components for easy use across the app
// These use the configured ad slots from environment variables

export const HeaderAd = ({ className = '' }) => (
  <SimpleAd
    adSlot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
    adFormat="auto"
    label="Advertisement"
    className={`header-ad ${className}`}
  />
);

export const FooterAd = ({ className = '' }) => (
  <SimpleAd
    adSlot={import.meta.env.VITE_ADSENSE_FOOTER_BANNER}
    adFormat="auto"
    label="Advertisement"
    className={`footer-ad ${className}`}
  />
);

export const SidebarAd = ({ className = '' }) => (
  <SimpleAd
    adSlot={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER}
    adFormat="auto"
    label="Advertisement"
    className={`sidebar-ad ${className}`}
  />
);

export const ContentAd = ({ className = '' }) => (
  <SimpleAd
    adSlot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
    adFormat="auto"
    label="Advertisement"
    className={`content-ad ${className}`}
  />
);

export const NativeAd = ({ className = '' }) => (
  <SimpleAd
    adSlot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
    adFormat="auto"
    label="Advertisement"
    className={`native-ad ${className}`}
  />
);

export const MobileAd = ({ className = '' }) => (
  <SimpleAd
    adSlot={import.meta.env.VITE_ADSENSE_MOBILE_BANNER}
    adFormat="auto"
    label="Advertisement"
    className={`mobile-ad ${className}`}
  />
);
