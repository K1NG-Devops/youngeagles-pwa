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
    <div ref={adRef} className={className} style={style}>
      {!isVisible && placeholder ? (
        placeholder
      ) : isVisible ? (
        <GoogleAdSense 
          adSlot={adSlot}
          adFormat={adFormat}
          {...props}
        />
      ) : (
        // Default placeholder
        <div 
          style={{
            minHeight: style.minHeight || '90px',
            backgroundColor: 'transparent',
            display: 'block'
          }}
        />
      )}
    </div>
  );
};

export default LazyAd;
