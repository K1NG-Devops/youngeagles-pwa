import React, { useEffect, useRef } from 'react';

const GoogleAdSense = ({ 
  slot = '5965347315',
  client = 'ca-pub-5506438806314781',
  size = 'responsive',
  format = 'auto',
  className = '',
  style = {},
  responsive = true,
  disabled = false 
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      try {
        // Load AdSense script if not already loaded
        if (!window.adsbygoogle) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
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
  }, [disabled, client, slot]);

  if (disabled) {
    return null;
  }

  const adStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
    ...style
  };

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={adStyle}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
};

export default GoogleAdSense;
