import React, { useEffect, useRef } from 'react';

const FlexibleAdSense = ({ 
  adType = 'banner',
  format = 'auto',
  className = '',
  style = {},
  responsive = true,
  disabled = false,
  showPlaceholder = false // Default to false to show real ads
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!disabled && !showPlaceholder) {
      try {
        // Load AdSense script if not already loaded
        if (!window.adsbygoogle) {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5506438806314781';
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

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
  }, [disabled, showPlaceholder]);

  // Smaller sizing for ad types as requested
  const getAdDimensions = () => {
    switch (adType) {
    case 'content':
      return {
        minHeight: '80px', // Much smaller
        height: '80px',
        maxHeight: '80px'
      };
    case 'native-feed':
      return {
        minHeight: '100px', // Smaller for in-feed
        height: '80px',
        maxHeight: '100px'
      };
    case 'header':
      return {
        minHeight: '60px', // Very small header ad
        height: '60px',
        maxHeight: '60px'
      };
          case 'footer':
        return {
          minHeight: '60px', // Much smaller for footer
          height: '60px',
          maxHeight: '60px'
        };
    default:
      return {
        minHeight: '80px',
        height: '80px',
        maxHeight: '80px'
      };
    }
  };

  const dimensions = getAdDimensions();
  
  const containerStyle = {
    width: '100%',
    ...dimensions,
    maxWidth: '100%',
    overflow: 'hidden',
    ...style
  };

  if (disabled) {
    return null;
  }

  return (
    <div className={`flexible-adsense ${className} mb-4`} style={containerStyle}>
      <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
        {showPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="absolute top-8 right-6 w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="absolute bottom-6 left-8 w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-blue-300 rounded-full"></div>
            </div>
            
            <div className="text-center p-2 sm:p-3 relative z-10">
              <div className="mb-1 sm:mb-2">
                <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg mb-1">
                  <span className="text-white text-xs sm:text-sm">🎯</span>
                </div>
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold mb-1">
                Ad Space
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {adType === 'header' ? 'Header Ad' :
                  adType === 'content' ? 'Content Ad' : 
                    adType === 'native-feed' ? 'Feed Ad' : 
                      `${adType.charAt(0).toUpperCase() + adType.slice(1)}`}
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default FlexibleAdSense;
