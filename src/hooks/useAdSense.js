import { useEffect, useState } from 'react';
import { ADSENSE_CONFIG } from '../config/adsense-config';

/**
 * Custom hook for managing Google AdSense
 * Handles ad loading, error states, and provides utility functions
 */
export const useAdSense = () => {
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);
  const [adSenseError, setAdSenseError] = useState(null);

  useEffect(() => {
    // In test mode, simulate loaded state
    if (ADSENSE_CONFIG.TEST_MODE) {
      setIsAdSenseLoaded(true);
      return;
    }

    // Check if AdSense is already loaded
    if (window.adsbygoogle) {
      setIsAdSenseLoaded(true);
      return;
    }

    // Wait for AdSense script to load
    const checkAdSenseLoaded = () => {
      if (window.adsbygoogle) {
        setIsAdSenseLoaded(true);
      } else {
        // Check again after a short delay
        setTimeout(checkAdSenseLoaded, 100);
      }
    };

    // Start checking
    checkAdSenseLoaded();

    // Set a timeout to handle cases where AdSense fails to load
    const timeout = setTimeout(() => {
      if (!window.adsbygoogle) {
        setAdSenseError('AdSense failed to load');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  /**
   * Push an ad to AdSense
   * @param {HTMLElement} element - The ad element
   */
  const pushAd = (element) => {
    if (!isAdSenseLoaded || !element) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error pushing ad:', error);
      setAdSenseError(error.message);
    }
  };

  /**
   * Check if we're in test mode
   */
  const isTestMode = () => {
    return ADSENSE_CONFIG.TEST_MODE;
  };

  /**
   * Get publisher ID
   */
  const getPublisherId = () => {
    return ADSENSE_CONFIG.PUBLISHER_ID;
  };

  /**
   * Check if ads should be displayed
   * (You can add additional logic here, like user preferences, ad blockers, etc.)
   */
  const shouldDisplayAds = () => {
    // Don't show ads if AdSense failed to load
    if (adSenseError) return false;
    
    // Don't show ads if user has opted out (you can implement this)
    // if (userHasOptedOut) return false;
    
    return true;
  };

  return {
    isAdSenseLoaded,
    adSenseError,
    pushAd,
    isTestMode,
    getPublisherId,
    shouldDisplayAds
  };
};
