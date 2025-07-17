import React, { useEffect, useRef, useState } from 'react';

const GoogleAd = ({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  responsive = true,
  className = '',
  hideWhenEmpty = true  // New prop to control visibility when no ads
}) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const isProduction = import.meta.env.PROD;
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
  const adSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  // Mobile detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    // Hide empty ad containers if requested
    if (!adSenseEnabled || !publisherId || !slot) {
      if (hideWhenEmpty) {
        setAdFailed(true);
      }
      console.warn('AdSense disabled or missing publisher ID/slot');
      return;
    }

    // In production with test mode disabled, try to load real ads
    if (isProduction && !testMode) {
      try {
        if (window.adsbygoogle && adRef.current) {
          // Check if ad is already loaded
          const existingAd = adRef.current.querySelector('.adsbygoogle');
          if (existingAd && existingAd.dataset.adStatus) {
            console.log('Ad already loaded for slot:', slot);
            setAdLoaded(true);
            return;
          }

          // Push to AdSense queue
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log('AdSense ad loading for slot:', slot);

          // Monitor ad loading success/failure
          setTimeout(() => {
            const ins = adRef.current?.querySelector('.adsbygoogle');
            if (ins) {
              const adStatus = ins.dataset.adStatus;
              const hasContent = ins.offsetHeight > 0 && ins.offsetWidth > 0;
              
              if (adStatus === 'filled' || hasContent) {
                console.log('Ad loaded successfully:', { slot, width: ins.offsetWidth, height: ins.offsetHeight });
                setAdLoaded(true);
                setAdFailed(false);
              } else {
                console.log('Ad failed to load or no content:', { slot, status: adStatus });
                setAdFailed(hideWhenEmpty);
              }
            } else {
              console.log('Ad element not found, assuming failed');
              setAdFailed(hideWhenEmpty);
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Error loading AdSense ad:', error);
        setAdFailed(hideWhenEmpty);
      }
    } else {
      // Development or test mode
      console.log('AdSense in test/dev mode - slot:', slot);
      setAdLoaded(false);
      setAdFailed(false);
    }
  }, [publisherId, slot, adSenseEnabled, isProduction, testMode, hideWhenEmpty]);

  // Don't render anything if ads are disabled or failed to load (when hideWhenEmpty is true)
  if (!adSenseEnabled || (adFailed && hideWhenEmpty)) {
    return null;
  }

  // Show placeholder in development OR when test mode is enabled
  if (!isProduction || testMode) {
    // In production with test mode false, don't show placeholder
    if (isProduction && !testMode) {
      return null;
    }
    
    return (
      <div className={`adsense-placeholder ${className}`} style={{ 
        ...style, 
        backgroundColor: '#f3f4f6',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '12px',  // Reduced padding
        margin: '8px 0',  // Minimal margin
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '12px',  // Smaller text
        fontFamily: 'monospace'
      }}>
        <div>🔧 AdSense Dev Mode</div>
        <div>Slot: {slot?.slice(-6) || 'N/A'}</div>
        <div>Format: {format}</div>
        <div>Test Mode: {testMode ? 'ON' : 'OFF'}</div>
        <div className="text-xs mt-1">
          {testMode ? 'Test ads enabled' : 'Ads hidden in production'}
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

export default GoogleAd;
