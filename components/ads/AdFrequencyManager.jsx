"use client"

import { useEffect, useState, useCallback } from "react"

const AD_IMPRESSION_KEY = "adImpressions"
const AD_RESET_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_ADS_PER_INTERVAL = 5 // Max ads to show per interval

export const useAdFrequency = () => {
  const [impressions, setImpressions] = useState([])
  const [shouldShowAd, setShouldShowAd] = useState(true)

  useEffect(() => {
    const storedImpressions = JSON.parse(localStorage.getItem(AD_IMPRESSION_KEY) || "[]")
    setImpressions(storedImpressions)
  }, [])

  useEffect(() => {
    const now = Date.now()
    const recentImpressions = impressions.filter((timestamp) => now - timestamp < AD_RESET_INTERVAL)

    if (recentImpressions.length >= MAX_ADS_PER_INTERVAL) {
      setShouldShowAd(false)
    } else {
      setShouldShowAd(true)
    }
    localStorage.setItem(AD_IMPRESSION_KEY, JSON.stringify(recentImpressions))
  }, [impressions])

  const recordAdImpression = useCallback(() => {
    setImpressions((prev) => {
      const newImpressions = [...prev, Date.now()]
      localStorage.setItem(AD_IMPRESSION_KEY, JSON.stringify(newImpressions))
      return newImpressions
    })
  }, [])

  return { shouldShowAd, recordAdImpression }
}
