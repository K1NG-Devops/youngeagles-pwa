import React, { useEffect, useRef } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';

const UnrestrictedAd = ({ 
  adSlot,
  adFormat = 'auto',
  className = '',
  showLabel = false
}) => {
  const { showAds } = useSubscription();
  const adRef = useRef(null);

  // Don't render if ads are disabled or no ad slot
  if (!showAds() || !adSlot) {
    return null;
  }

  useEffect(() => {
    if (!adRef.current) return;

    // Initialize AdSense
    window.adsbygoogle = window.adsbygoogle || [];
    
    const timer = setTimeout(() => {
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [adSlot]);

  return (
    <div className={`unrestricted-ad ${className}`} style={{ 
      width: '100%', 
      margin: '0',
      padding: '0',
      overflow: 'visible',
      position: 'relative'
    }}>
      {/* Optional label */}
      {showLabel && (
        <div style={{ 
          fontSize: '10px', 
          color: '#9CA3AF', 
          textAlign: 'center', 
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Advertisement
        </div>
      )}
      
      {/* AdSense Ad Unit - Completely unrestricted */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          border: 'none',
          margin: '0',
          padding: '0',
          overflow: 'visible',
          position: 'relative'
        }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-ad-test={import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? 'on' : 'off'}
      />
    </div>
  );
};

export default UnrestrictedAd;
