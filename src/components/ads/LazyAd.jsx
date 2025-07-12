import React, { useState, useEffect, useRef } from 'react';
import GoogleAdSense from './GoogleAdSense';

const LazyAd = ({ 
  adSlot,
  adFormat = 'auto',
  className = '',
  style = {},
  threshold = 0.1,
  rootMargin = '50px',
  placeholder = null,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold,
        rootMargin // Start loading when ad is 50px away from viewport
      }
    );

    observer.observe(adRef.current);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={adRef} className={className} style={{ margin: 0, padding: 0, ...style }}>
      {!isVisible && placeholder ? (
        placeholder
      ) : isVisible ? (
        <GoogleAdSense 
          adSlot={adSlot}
          adFormat={adFormat}
          style={{ margin: 0, padding: 0 }}
          {...props}
        />
      ) : (
        // Default placeholder - minimal height on mobile
        <div 
          style={{
            minHeight: window.innerWidth < 768 ? '50px' : (style.minHeight || '90px'),
            backgroundColor: 'transparent',
            display: 'block',
            margin: 0,
            padding: 0
          }}
        />
      )}
    </div>
  );
};

export default LazyAd;
