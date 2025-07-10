import React from 'react';
import FlexibleAdSense from './FlexibleAdSense';
import BannerAd from './BannerAd';
import SidebarAd from './SidebarAd';

/**
 * SmartAdManager - Intelligent ad placement component
 * Selects the appropriate ad component based on position, page context, and user segment
 */
const SmartAdManager = ({ 
  position = 'banner', 
  page = 'default',
  userSegment = 'casual',
  className = '',
  style = {},
  disabled = false 
}) => {
  
  // Determine ad format based on position
  const getAdFormat = () => {
    switch (position) {
      case 'sidebar':
        return 'vertical';
      case 'footer':
        return 'horizontal';
      case 'banner':
      case 'header':
        return 'auto';
      default:
        return 'auto';
    }
  };

  // Determine if ads should be shown based on user segment and page
  const shouldShowAd = () => {
    // Always show ads unless explicitly disabled
    if (disabled) return false;
    
    // You can add logic here to disable ads for premium users
    // if (userSegment === 'premium') return false;
    
    return true;
  };

  // Get responsive container classes based on position
  const getContainerClasses = () => {
    const baseClasses = 'w-full overflow-hidden'; // Prevent all overflow issues
    
    switch (position) {
      case 'sidebar':
        return `${baseClasses} max-w-sm mx-auto`;
      case 'footer':
        return `${baseClasses} max-w-full`;
      case 'banner':
      case 'header':
        return `${baseClasses} max-w-4xl mx-auto`;
      case 'content':
      case 'native-feed':
        return `${baseClasses} max-w-3xl mx-auto`;
      default:
        return `${baseClasses} max-w-full`;
    }
  };

  // Choose the appropriate ad component based on position
  const renderAdComponent = () => {
    if (!shouldShowAd()) return null;

    const format = getAdFormat();
    
    switch (position) {
      case 'sidebar':
        return (
          <SidebarAd 
            className={`w-full ${className}`}
            style={style}
            disabled={disabled}
          />
        );
      
      case 'banner':
      case 'header':
        return (
          <BannerAd 
            className={`w-full ${className}`}
            style={style}
            disabled={disabled}
          />
        );
      
      case 'footer':
      case 'content':
      case 'native-feed':
      default:
        return (
          <FlexibleAdSense 
            adType={position}
            format={format}
            className={`w-full ${className}`}
            style={style}
            disabled={disabled}
            responsive={true}
            showPlaceholder={true}
          />
        );
    }
  };

  const containerClasses = getContainerClasses();

  return (
    <div 
      className={`smart-ad-manager ${containerClasses} ${className}`} 
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        ...style
      }}
    >
      <div className="w-full overflow-hidden">
        {renderAdComponent()}
      </div>
    </div>
  );
};

export default SmartAdManager; 