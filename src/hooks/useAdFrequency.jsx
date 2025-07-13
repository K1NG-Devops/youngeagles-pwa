import { useState, useCallback } from 'react';

const useAdFrequency = (pageType) => {
  const [adCount, setAdCount] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(0);

  const shouldShowAd = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;

    // Define limits and intervals per page type
    const rules = {
      dashboard: { maxPerSession: 2, minInterval: 60000 }, // max 2 ads, 60 seconds apart
      content: { maxPerSession: 3, minInterval: 30000 },
      list: { maxPerSession: 1, minInterval: 45000 }
    };

    const rule = rules[pageType] || rules.content;

    return adCount < rule.maxPerSession && timeSinceLastAd > rule.minInterval;
  }, [adCount, lastAdTime, pageType]);

  const recordAdShown = useCallback(() => {
    setAdCount((prev) => prev + 1);
    setLastAdTime(Date.now());
  }, []);

  return { shouldShowAd, recordAdShown };
};

export default useAdFrequency;

