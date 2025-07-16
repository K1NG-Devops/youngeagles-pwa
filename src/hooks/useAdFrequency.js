import { useState, useEffect, useCallback } from 'react';

// Ad frequency configuration
const AD_CONFIG = {
  // Maximum ads per page
  maxAdsPerPage: 3,
  // Minimum time between ads (in milliseconds)
  minTimeBetweenAds: 30000, // 30 seconds
  // Maximum ads per session
  maxAdsPerSession: 10,
  // Session duration (in milliseconds)
  sessionDuration: 3600000, // 1 hour
  // Ad types and their frequency limits
  adTypes: {
    banner: { maxPerPage: 2, maxPerSession: 5 },
    native: { maxPerPage: 2, maxPerSession: 5 },
    interstitial: { maxPerPage: 1, maxPerSession: 2 },
    video: { maxPerPage: 1, maxPerSession: 3 }
  }
};

// Storage keys
const STORAGE_KEYS = {
  adSession: 'young_eagles_ad_session',
  adFrequency: 'young_eagles_ad_frequency',
  lastAdShown: 'young_eagles_last_ad_shown'
};

/**
 * Custom hook for managing ad frequency and display logic
 * @param {string} pageId - Unique identifier for the current page
 * @param {string} adType - Type of ad (banner, native, interstitial, video)
 * @returns {object} Ad frequency management functions and state
 */
const useAdFrequency = (pageId, adType = 'banner') => {
  const [adSession, setAdSession] = useState(null);
  const [canShowAd, setCanShowAd] = useState(false);
  const [adsShownThisPage, setAdsShownThisPage] = useState(0);
  const [adsShownThisSession, setAdsShownThisSession] = useState(0);

  // Initialize ad session
  useEffect(() => {
    const initializeSession = () => {
      const existingSession = localStorage.getItem(STORAGE_KEYS.adSession);
      const now = Date.now();

      if (existingSession) {
        const session = JSON.parse(existingSession);
        
        // Check if session is still valid
        if (now - session.startTime < AD_CONFIG.sessionDuration) {
          setAdSession(session);
          setAdsShownThisSession(session.adsShown || 0);
          return;
        }
      }

      // Create new session
      const newSession = {
        id: `session_${now}`,
        startTime: now,
        adsShown: 0,
        pages: {}
      };

      localStorage.setItem(STORAGE_KEYS.adSession, JSON.stringify(newSession));
      setAdSession(newSession);
      setAdsShownThisSession(0);
    };

    initializeSession();
  }, []);

  // Initialize page ad count
  useEffect(() => {
    if (!adSession || !pageId) return;

    const pageAdsShown = adSession.pages[pageId] || 0;
    setAdsShownThisPage(pageAdsShown);
  }, [adSession, pageId]);

  // Check if we can show more ads
  useEffect(() => {
    const checkAdEligibility = () => {
      if (!adSession) {
        setCanShowAd(false);
        return;
      }

      const adTypeConfig = AD_CONFIG.adTypes[adType] || AD_CONFIG.adTypes.banner;
      const lastAdShown = localStorage.getItem(STORAGE_KEYS.lastAdShown);
      const now = Date.now();

      // Check time-based restrictions
      if (lastAdShown && (now - parseInt(lastAdShown)) < AD_CONFIG.minTimeBetweenAds) {
        setCanShowAd(false);
        return;
      }

      // Check page-level restrictions
      if (adsShownThisPage >= adTypeConfig.maxPerPage) {
        setCanShowAd(false);
        return;
      }

      // Check session-level restrictions
      if (adsShownThisSession >= adTypeConfig.maxPerSession) {
        setCanShowAd(false);
        return;
      }

      // Check global session restrictions
      if (adsShownThisSession >= AD_CONFIG.maxAdsPerSession) {
        setCanShowAd(false);
        return;
      }

      setCanShowAd(true);
    };

    checkAdEligibility();
  }, [adSession, adType, adsShownThisPage, adsShownThisSession]);

  // Function to record when an ad is shown
  const recordAdShown = useCallback((adId = null) => {
    if (!adSession || !pageId) return false;

    const now = Date.now();
    
    // Update session data
    const updatedSession = {
      ...adSession,
      adsShown: adsShownThisSession + 1,
      pages: {
        ...adSession.pages,
        [pageId]: adsShownThisPage + 1
      },
      lastAdShown: now
    };

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.adSession, JSON.stringify(updatedSession));
    localStorage.setItem(STORAGE_KEYS.lastAdShown, now.toString());

    // Update frequency tracking
    const frequencyData = JSON.parse(localStorage.getItem(STORAGE_KEYS.adFrequency) || '{}');
    frequencyData[adType] = (frequencyData[adType] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.adFrequency, JSON.stringify(frequencyData));

    // Update state
    setAdSession(updatedSession);
    setAdsShownThisPage(prev => prev + 1);
    setAdsShownThisSession(prev => prev + 1);

    return true;
  }, [adSession, pageId, adType, adsShownThisPage, adsShownThisSession]);

  // Function to check if we should show an ad (with automatic recording)
  const shouldShowAd = useCallback((autoRecord = true) => {
    if (!canShowAd) return false;

    if (autoRecord) {
      return recordAdShown();
    }

    return true;
  }, [canShowAd, recordAdShown]);

  // Function to get remaining ad slots
  const getRemainingAdSlots = useCallback(() => {
    if (!adSession) return 0;

    const adTypeConfig = AD_CONFIG.adTypes[adType] || AD_CONFIG.adTypes.banner;
    const remainingForPage = Math.max(0, adTypeConfig.maxPerPage - adsShownThisPage);
    const remainingForSession = Math.max(0, adTypeConfig.maxPerSession - adsShownThisSession);
    const remainingGlobal = Math.max(0, AD_CONFIG.maxAdsPerSession - adsShownThisSession);

    return Math.min(remainingForPage, remainingForSession, remainingGlobal);
  }, [adSession, adType, adsShownThisPage, adsShownThisSession]);

  // Function to reset page ad count (useful for page navigation)
  const resetPageAdCount = useCallback(() => {
    setAdsShownThisPage(0);
  }, []);

  // Function to get ad frequency statistics
  const getAdStats = useCallback(() => {
    const frequencyData = JSON.parse(localStorage.getItem(STORAGE_KEYS.adFrequency) || '{}');
    
    return {
      session: {
        id: adSession?.id,
        startTime: adSession?.startTime,
        totalAdsShown: adsShownThisSession,
        duration: adSession ? Date.now() - adSession.startTime : 0
      },
      page: {
        id: pageId,
        adsShown: adsShownThisPage
      },
      frequency: frequencyData,
      limits: AD_CONFIG.adTypes[adType],
      remaining: getRemainingAdSlots()
    };
  }, [adSession, pageId, adType, adsShownThisPage, adsShownThisSession, getRemainingAdSlots]);

  // Function to check if more ads can be shown
  const canShowMoreAds = useCallback(() => {
    return getRemainingAdSlots() > 0;
  }, [getRemainingAdSlots]);

  return {
    // State
    canShowAd,
    adsShownThisPage,
    adsShownThisSession,
    
    // Functions
    shouldShowAd,
    recordAdShown,
    getRemainingAdSlots,
    resetPageAdCount,
    getAdStats,
    canShowMoreAds,
    
    // Aliases for backward compatibility
    recordAdShown: recordAdShown, // Alias
    canShowMoreAds: canShowMoreAds, // Alias
  };
};

export default useAdFrequency;
