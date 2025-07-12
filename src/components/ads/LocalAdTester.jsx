import React, { useState, useEffect } from 'react';

const LocalAdTester = ({ format = 'banner', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adConfig, setAdConfig] = useState({
    showTopBanner: true,
    showSidebarAd: true,
    showBottomBanner: true,
    showNativeAd: false, // Reduced frequency
    adFrequency: 'low' // New setting for production simulation
  });

  // Simulate production ad frequency - only show ads at natural break points
  const shouldShowAd = () => {
    if (adConfig.adFrequency === 'low') {
      // Only show ads 30% of the time to simulate real production
      return Math.random() < 0.3;
    }
    return true;
  };

  useEffect(() => {
    // Simulate ad loading delay
    const timer = setTimeout(() => {
      setIsVisible(shouldShowAd());
    }, 1000);

    return () => clearTimeout(timer);
  }, [format]);

  const getAdDimensions = () => {
    switch (format) {
      case 'banner':
        return { width: '728px', height: '90px' };
      case 'rectangle':
        return { width: '300px', height: '250px' };
      case 'skyscraper':
        return { width: '160px', height: '600px' };
      case 'native-feed':
        return { width: '100%', height: '120px' };
      case 'native-article':
        return { width: '100%', height: '200px' };
      default:
        return { width: '320px', height: '50px' };
    }
  };

  const getAdContent = () => {
    const educationalAds = [
      {
        title: "Khan Academy Kids",
        description: "Free educational games and activities for children",
        cta: "Learn More",
        color: "#4CAF50"
      },
      {
        title: "Educational Resources",
        description: "Discover premium learning materials for your child",
        cta: "Explore",
        color: "#2196F3"
      },
      {
        title: "STEM Learning Kit",
        description: "Hands-on science experiments for young minds",
        cta: "Shop Now",
        color: "#FF9800"
      }
    ];

    const randomAd = educationalAds[Math.floor(Math.random() * educationalAds.length)];
    return randomAd;
  };

  const handleAdClick = () => {
    console.log(`Production Ad Clicked: ${format}`);
    // In production, this would track real ad clicks
  };

  if (!isVisible) {
    return null; // Don't show ad if frequency check fails
  }

  const dimensions = getAdDimensions();
  const adContent = getAdContent();

  // Production-style ad with educational content
  return (
    <div 
      className={`production-ad-container ${className}`}
      style={{
        width: dimensions.width,
        maxWidth: '100%',
        margin: '20px auto',
        position: 'relative',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Production mode indicator - smaller and less intrusive */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          fontSize: '10px',
          borderRadius: '3px',
          zIndex: 10
        }}
      >
        PROD SIM
      </div>

      <div
        onClick={handleAdClick}
        style={{
          width: '100%',
          height: dimensions.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${adContent.color}20, ${adContent.color}10)`,
          cursor: 'pointer',
          padding: '16px',
          transition: 'transform 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: adContent.color,
            fontSize: format === 'banner' ? '14px' : '16px',
            fontWeight: '600'
          }}>
            {adContent.title}
          </h4>
          <p style={{ 
            margin: '0 0 12px 0', 
            color: '#666',
            fontSize: format === 'banner' ? '12px' : '14px',
            lineHeight: '1.4'
          }}>
            {adContent.description}
          </p>
          <button
            style={{
              backgroundColor: adContent.color,
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}
          >
            {adContent.cta}
          </button>
        </div>
      </div>

      {/* Sponsored label - required for production ads */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '2px 6px',
          fontSize: '10px',
          borderRadius: '3px'
        }}
      >
        Sponsored
      </div>
    </div>
  );
};

// Production Ad Control Panel - only show in development
const ProductionAdControls = ({ onConfigChange }) => {
  const [config, setConfig] = useState({
    showTopBanner: true,
    showSidebarAd: false, // Reduced default
    showBottomBanner: true,
    showNativeAd: false,
    adFrequency: 'low'
  });

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
        Production Ad Simulator
      </h4>
      
      <div style={{ marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Ad Frequency:
        </label>
        <select
          value={config.adFrequency}
          onChange={(e) => handleConfigChange('adFrequency', e.target.value)}
          style={{ width: '100%', padding: '4px', fontSize: '12px' }}
        >
          <option value="low">Low (30% - Production)</option>
          <option value="medium">Medium (60% - Testing)</option>
          <option value="high">High (90% - Development)</option>
        </select>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <div>✓ Educational content focus</div>
        <div>✓ Natural break points</div>
        <div>✓ Reduced frequency</div>
        <div>✓ Better user experience</div>
      </div>
    </div>
  );
};

export default LocalAdTester;
export { ProductionAdControls }; 