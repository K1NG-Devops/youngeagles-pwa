"use client"

import { useState, useEffect, useCallback } from "react"

const AD_IMPRESSION_KEY = "adImpressions"
const AD_RESET_INTERVAL_MS = 60 * 60 * 1000 // 1 hour
const MAX_ADS_PER_INTERVAL = 5 // Max ads to show per interval

export const useAdFrequency = (adSlotId) => {
  const [shouldShowAd, setShouldShowAd] = useState(true)

  const recordImpression = useCallback(() => {
    if (typeof window === "undefined") return

    const now = Date.now()
    let impressions = JSON.parse(localStorage.getItem(AD_IMPRESSION_KEY) || "[]")

    // Filter out old impressions
    impressions = impressions.filter((imp) => now - imp.timestamp < AD_RESET_INTERVAL_MS)

    if (impressions.length < MAX_ADS_PER_INTERVAL) {
      impressions.push({ slotId: adSlotId, timestamp: now })
      localStorage.setItem(AD_IMPRESSION_KEY, JSON.stringify(impressions))
      setShouldShowAd(true)
    } else {
      setShouldShowAd(false)
    }
  }, [adSlotId])

  useEffect(() => {
    if (typeof window === "undefined") return

    const now = Date.now()
    let impressions = JSON.parse(localStorage.getItem(AD_IMPRESSION_KEY) || "[]")

    // Filter out old impressions
    impressions = impressions.filter((imp) => now - imp.timestamp < AD_RESET_INTERVAL_MS)

    if (impressions.length >= MAX_ADS_PER_INTERVAL) {
      setShouldShowAd(false)
    } else {
      setShouldShowAd(true)
      // Record impression immediately if it's a new ad load and within limits
      // This prevents multiple ads from loading on a single page refresh if not managed carefully
      recordImpression()
    }

    // Set up a timer to re-evaluate ad visibility after an interval
    const timer = setInterval(() => {
      recordImpression() // Re-check and record
    }, AD_RESET_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [adSlotId, recordImpression])

  return { shouldShowAd, recordImpression }
}
