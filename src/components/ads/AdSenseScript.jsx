import React, { useEffect } from 'react';

const AdSenseScript = () => {
  useEffect(() => {
    // Initialize AdSense when component mounts
    const initializeAdSense = () => {
      try {
        // Check if AdSense script is loaded
        if (window.adsbygoogle) {
          // Initialize any existing ads that haven't been initialized yet
          const ads = document.querySelectorAll('.adsbygoogle');
          ads.forEach((ad) => {
            if (!ad.getAttribute('data-adsbygoogle-status')) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          });
        }
      } catch (error) {
        console.error('AdSense initialization error:', error);
      }
    };

    // Run initialization
    initializeAdSense();

    // Set up a periodic check to initialize any new ads
    const interval = setInterval(() => {
      initializeAdSense();
    }, 2000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

export default AdSenseScript; 