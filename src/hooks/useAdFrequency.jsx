import { useState, useCallback, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

const useAdFrequency = (pageType) => {
  const { showAds } = useSubscription();
  const [adCount, setAdCount] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [sessionStart] = useState(Date.now());

  // Reset counters when page changes
  useEffect(() => {
    setAdCount(0);
    setLastAdTime(0);
  }, [pageType]);

  const shouldShowAd = useCallback(() => {
    // Don't show ads if disabled by subscription
    if (!showAds()) return false;

    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;
    const sessionDuration = now - sessionStart;

    // Define rules per page type with more generous limits
    const rules = {
      dashboard: { 
        maxPerSession: 3, 
        minInterval: 45000, // 45 seconds
        minSessionTime: 10000 // 10 seconds after page load
      },
      content: { 
        maxPerSession: 4, 
        minInterval: 30000, // 30 seconds
        minSessionTime: 5000 // 5 seconds after page load
      },
      list: { 
        maxPerSession: 2, 
        minInterval: 60000, // 60 seconds
        minSessionTime: 15000 // 15 seconds after page load
      },
      homework: {
        maxPerSession: 3,
        minInterval: 40000, // 40 seconds
        minSessionTime: 8000 // 8 seconds after page load
      }
    };

    const rule = rules[pageType] || rules.content;

    // Check all conditions
    const hasNotExceededLimit = adCount < rule.maxPerSession;
    const hasWaitedEnough = timeSinceLastAd > rule.minInterval;
    const hasBeenOnPageLongEnough = sessionDuration > rule.minSessionTime;
    const isFirstAd = adCount === 0;

    // Always allow first ad after minimum session time
    if (isFirstAd) {
      return hasBeenOnPageLongEnough;
    }

    // For subsequent ads, check all conditions
    return hasNotExceededLimit && hasWaitedEnough && hasBeenOnPageLongEnough;
  }, [adCount, lastAdTime, pageType, sessionStart, showAds]);

  const recordAdShown = useCallback(() => {
    setAdCount((prev) => prev + 1);
    setLastAdTime(Date.now());
  }, []);

  const resetAdCount = useCallback(() => {
    setAdCount(0);
    setLastAdTime(0);
  }, []);

  return { 
    shouldShowAd, 
    recordAdShown, 
    resetAdCount,
    adCount,
    canShowMoreAds: () => {
      const rule = {
        dashboard: { maxPerSession: 3 },
        content: { maxPerSession: 4 },
        list: { maxPerSession: 2 },
        homework: { maxPerSession: 3 }
      }[pageType] || { maxPerSession: 4 };
      
      return adCount < rule.maxPerSession;
    }
  };
};

export default useAdFrequency;

