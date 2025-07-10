import React from 'react';
import FlexibleAdSense from './FlexibleAdSense';
import BannerAd from './BannerAd';
import SidebarAd from './SidebarAd';

/**
 * SmartAdManager - Intelligent ad placement component with full responsive scaling
 * Selects the appropriate ad component based on position, page context, and user segment
 */
const SmartAdManager = ({ position, page, className = '', style = {} }) => {
  const renderAd = () => {
    // Enhanced container style for proper sizing
    const containerStyle = {
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      ...style
    };

    switch (position) {
    case 'sidebar':
      return (
        <div className="w-full" style={containerStyle}>
          <SidebarAd 
            className={className}
            showOnDesktop={true}
            showOnMobile={false}
            responsive={true}
          />
        </div>
      );
      
    case 'banner':
    case 'header':
      return (
        <div className="w-full" style={containerStyle}>
          <BannerAd 
            className={className}
            showOnDesktop={true}
            showOnMobile={true}
            responsive={true}
          />
        </div>
      );
      
    case 'footer':
      return (
        <div className="w-full" style={containerStyle}>
          <FlexibleAdSense 
            adType="footer"
            format="horizontal"
            className={className}
            style={containerStyle}
            responsive={true}
            showPlaceholder={false}
          />
        </div>
      );
       
    case 'content':
      return (
        <div className="w-full" style={containerStyle}>
          <FlexibleAdSense 
            adType="content"
            format="rectangle"
            className={className}
            style={containerStyle}
            responsive={true}
            showPlaceholder={false}
          />
        </div>
      );
       
    case 'native-feed':
      return (
        <div className="w-full" style={containerStyle}>
          <FlexibleAdSense 
            adType="native-feed"
            format="fluid"
            className={className}
            style={containerStyle}
            responsive={true}
            showPlaceholder={false}
          />
        </div>
      );
       
    default:
      return (
        <div className="w-full" style={containerStyle}>
          <FlexibleAdSense 
            adType="banner"
            format="auto"
            className={className}
            style={containerStyle}
            responsive={true}
            showPlaceholder={false}
          />
        </div>
      );
    }
  };

  return (
    <div className={`smart-ad-manager w-full ${className}`} style={style}>
      {renderAd()}
    </div>
  );
};

export default SmartAdManager; 