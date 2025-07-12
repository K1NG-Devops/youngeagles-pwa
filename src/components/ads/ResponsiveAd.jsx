import React from 'react';
import GoogleAdSense from './GoogleAdSense';

const ResponsiveAd = ({ 
  adType = 'banner', // 'banner', 'rectangle', 'skyscraper', 'native-feed', 'native-article'
  adSlot = null, // Custom ad slot override
  className = '',
  style = {},
  minHeight = '50px',
  maxHeight = '400px',
  showLabel = true
}) => {
  // Get the appropriate ad slot based on type
  const getAdSlot = () => {
    if (adSlot) return adSlot; // Use custom slot if provided
    
    switch (adType) {
      case 'header-banner':
        return import.meta.env.VITE_ADSENSE_HEADER_BANNER;
      case 'footer-banner':
        return import.meta.env.VITE_ADSENSE_FOOTER_BANNER;
      case 'mobile-banner':
        return import.meta.env.VITE_ADSENSE_MOBILE_BANNER;
      case 'sidebar-skyscraper':
        return import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER;
      case 'content-rectangle':
        return import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE;
      case 'native-feed':
        return import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE;
      case 'native-article':
        return import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE;
      default:
        return import.meta.env.VITE_ADSENSE_MOBILE_BANNER; // Default to mobile banner
    }
  };

  // Get ad format based on type
  const getAdFormat = () => {
    switch (adType) {
      case 'native-feed':
        return 'fluid';
      case 'native-article':
        return 'fluid';
      case 'sidebar-skyscraper':
        return 'rectangle';
      case 'content-rectangle':
        return 'rectangle';
      default:
        return 'auto';
    }
  };

  // Get responsive styles based on ad type
  const getResponsiveStyle = () => {
    const baseStyle = {
      minHeight,
      maxHeight,
      width: '100%',
      display: 'block',
      margin: '10px 0',
      ...style
    };

    switch (adType) {
      case 'header-banner':
        return {
          ...baseStyle,
          minHeight: '50px',
          maxHeight: '90px'
        };
      case 'footer-banner':
        return {
          ...baseStyle,
          minHeight: '50px',
          maxHeight: '90px'
        };
      case 'mobile-banner':
        return {
          ...baseStyle,
          minHeight: '50px',
          maxHeight: '100px'
        };
      case 'sidebar-skyscraper':
        return {
          ...baseStyle,
          minHeight: '250px',
          maxHeight: '600px',
          width: '160px'
        };
      case 'content-rectangle':
        return {
          ...baseStyle,
          minHeight: '250px',
          maxHeight: '250px',
          width: '300px'
        };
      case 'native-feed':
      case 'native-article':
        return {
          ...baseStyle,
          minHeight: '100px',
          maxHeight: '300px'
        };
      default:
        return baseStyle;
    }
  };

  const currentAdSlot = getAdSlot();
  const adFormat = getAdFormat();
  const responsiveStyle = getResponsiveStyle();

  // Don't render if no ad slot is available
  if (!currentAdSlot) {
    if (import.meta.env.VITE_ADSENSE_TEST_MODE === 'true') {
      return (
        <div className={`ad-placeholder ${className}`} style={responsiveStyle}>
          <div style={{
            background: '#f0f0f0',
            border: '1px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666',
            fontSize: '14px'
          }}>
            Ad Placeholder - {adType}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`responsive-ad-container ${className}`} style={{ textAlign: 'center', padding: '10px 0' }}>
      {showLabel && (
        <div style={{ 
          fontSize: '10px', 
          color: '#666', 
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Advertisement
        </div>
      )}
      <GoogleAdSense
        adSlot={currentAdSlot}
        adFormat={adFormat}
        fullWidthResponsive={true}
        style={responsiveStyle}
        className={`responsive-ad responsive-ad-${adType}`}
      />
    </div>
  );
};

export default ResponsiveAd; 