import React, { useEffect, useRef } from 'react';

const BannerAd = ({ 
  className = '', 
  style = {},
  format = 'horizontal',
  responsive = true,
  showOnDesktop = true,
  showOnMobile = true,
  disabled = false 
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      try {
        // Push ad when script is ready
        const pushAd = () => {
          if (window.adsbygoogle && adRef.current) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        };

        // Wait for script to load then push ad
        if (window.adsbygoogle) {
          pushAd();
        } else {
          const checkScript = setInterval(() => {
            if (window.adsbygoogle) {
              clearInterval(checkScript);
              pushAd();
            }
          }, 100);
        }
      } catch (error) {
        console.error('AdSense loading error:', error);
      }
    }
  }, [disabled]);
  
  if (disabled) {
    return null;
  }

  // Clean production-style container
  const containerStyle = {
    width: '100%',
    minHeight: '50px', // Much smaller header ad
    height: '50px',
    maxHeight: '50px',
    maxWidth: '100%',
    overflow: 'hidden',
    ...style
  };

  return (
    <div className={`banner-ad ${className} mb-4`} style={containerStyle}>
      <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            borderRadius: '12px'
          }}
          data-ad-client="ca-pub-5506438806314781"
          data-ad-slot="5965347315"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default BannerAd;
