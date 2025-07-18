"use client"

import { useState, useEffect, useCallback } from "react"

// This hook manages ad display frequency based on a simple counter
export function useAdFrequency(adSlotId, frequency = 3) {
  const [adCount, setAdCount] = useState(0)

  useEffect(() => {
    // Load count from session storage or local storage
    const storedCount = sessionStorage.getItem(`adCount_${adSlotId}`)
    if (storedCount) {
      setAdCount(Number.parseInt(storedCount, 10))
    }
  }, [adSlotId])

  const shouldShowAd = useCallback(() => {
    // In test mode, always show ads
    if (import.meta.env.VITE_ADSENSE_TEST_MODE === "true") {
      return true
    }
    // Show ad if count is a multiple of frequency (e.g., every 3rd time)
    return adCount % frequency === 0
  }, [adCount, frequency])

  const recordAdShown = useCallback(() => {
    // Increment count and store it
    const newCount = adCount + 1
    setAdCount(newCount)
    sessionStorage.setItem(`adCount_${adSlotId}`, newCount.toString())
  }, [adCount, adSlotId])

  const canShowMoreAds = useCallback(() => {
    // This can be expanded to check daily limits, etc.
    return true // For now, always allow more ads
  }, [])

  return { shouldShowAd, recordAdShown, canShowMoreAds }
}
