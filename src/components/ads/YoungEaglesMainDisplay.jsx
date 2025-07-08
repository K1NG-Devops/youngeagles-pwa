import React, { useEffect, useRef } from 'react';

const YoungEaglesMainDisplay = ({ 
  className = "",
  style = {},
  disabled = false 
}) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Only load ads if not disabled and window.adsbygoogle exists
    if (!disabled && window.adsbygoogle && adRef.current) {
      try {
        // Push the ad to adsbygoogle queue
        window.adsbygoogle.push({});
      } catch (error) {
        console.warn('AdSense error:', error);
      }
    }
  }, [disabled]);

  // Don't render if ads are disabled
  if (disabled) {
    return null;
  }

  return (
    <div className={`youngeagles-ad-container ${className}`} style={style}>
      {/* YoungEagles-Main-Display */}
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5506438806314781"
        data-ad-slot="2894237519"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default YoungEaglesMainDisplay;
