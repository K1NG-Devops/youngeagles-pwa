"use client"

import { useState, useEffect, useCallback } from "react"

const AD_FREQUENCY_KEY = "ad_display_counts"
const AD_RESET_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function useAdFrequency() {
  const [adCounts, setAdCounts] = useState({})

  useEffect(() => {
    const storedCounts = localStorage.getItem(AD_FREQUENCY_KEY)
    if (storedCounts) {
      setAdCounts(JSON.parse(storedCounts))
    }

    // Set up interval to reset ad counts periodically
    const interval = setInterval(() => {
      setAdCounts({})
      localStorage.removeItem(AD_FREQUENCY_KEY)
    }, AD_RESET_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const incrementAdCount = useCallback((slotId) => {
    setAdCounts((prevCounts) => {
      const newCounts = {
        ...prevCounts,
        [slotId]: (prevCounts[slotId] || 0) + 1,
      }
      localStorage.setItem(AD_FREQUENCY_KEY, JSON.stringify(newCounts))
      return newCounts
    })
  }, [])

  const canShowAd = useCallback(
    (slotId, maxDisplays = 3) => {
      return (adCounts[slotId] || 0) < maxDisplays
    },
    [adCounts],
  )

  return { incrementAdCount, canShowAd }
}
