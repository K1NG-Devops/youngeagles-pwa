import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import GoogleAdSense from './GoogleAdSense';

const ResponsiveAdUnit = ({ 
  size = 'auto',
  className = '',
  priority = 'medium'
}) => {
  const { isDark } = useTheme();
  const [screenSize, setScreenSize] = useState('desktop');

  // Detect screen size
  useEffect(() => {
    const detectScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    detectScreenSize();
    window.addEventListener('resize', detectScreenSize);
    return () => window.removeEventListener('resize', detectScreenSize);
  }, []);

  // Get responsive ad configuration
  const getAdConfig = () => {
    const configs = {
      mobile: {
        width: '320px',
        height: '50px',
        slot: import.meta.env.VITE_ADSENSE_MOBILE_BANNER,
        format: 'auto'
      },
      tablet: {
        width: '728px',
        height: '90px',
        slot: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
        format: 'auto'
      },
      desktop: {
        width: '970px',
        height: '250px',
        slot: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
        format: 'rectangle'
      }
    };

    // Size-specific overrides
    const sizeConfigs = {
      square: { width: '300px', height: '250px', format: 'rectangle' },
      native: { width: '100%', height: 'auto', format: 'fluid' },
      banner: { width: '100%', height: '90px', format: 'auto' }
    };

    const baseConfig = configs[screenSize];
    const sizeOverride = sizeConfigs[size] || {};

    return { ...baseConfig, ...sizeOverride };
  };

  const config = getAdConfig();

  // Container styles
  const getContainerStyles = () => {
    return {
      maxWidth: config.width,
      minHeight: config.height,
      margin: '0 auto',
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.1)' : 'rgba(249, 250, 251, 0.1)',
      border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.3)'}`,
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div 
      className={`responsive-ad-unit ${className}`}
      style={getContainerStyles()}
    >
      {/* Ad label */}
      <div className={`text-xs text-center mb-2 ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        Advertisement
      </div>

      <GoogleAdSense 
        adSlot={config.slot}
        adFormat={config.format}
        fullWidthResponsive={true}
        className="responsive-ad-content"
        style={{
          display: 'block',
          width: '100%',
          height: config.height === 'auto' ? 'auto' : config.height
        }}
      />

      {/* Performance indicator for priority ads */}
      {priority === 'high' && (
        <div className={`text-xs text-center mt-1 ${
          isDark ? 'text-gray-600' : 'text-gray-500'
        }`}>
          Sponsored
        </div>
      )}
    </div>
  );
};

export default ResponsiveAdUnit;
