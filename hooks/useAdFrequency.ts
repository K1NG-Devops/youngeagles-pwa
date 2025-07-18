"use client"

import { useState, useEffect, useCallback } from "react"

// Define a type for ad frequency settings
interface AdFrequencySettings {
  [key: string]: {
    lastShown: number | null
    count: number
  }
}

// Default settings for ad frequency (can be customized)
const DEFAULT_AD_INTERVAL_MS = 30 * 1000 // 30 seconds
const MAX_ADS_PER_SESSION = 5 // Max ads to show per page load/session for a given placement

/**
 * Custom hook to manage ad display frequency and capping.
 * Prevents ads from showing too frequently or exceeding a maximum count.
 *
 * @param placementId A unique identifier for the ad placement (e.g., 'header-banner', 'content-ad-1')
 * @returns An object containing `shouldShowAd` (boolean) and `recordAdShown` (function)
 */
const useAdFrequency = (placementId: string) => {
  const [adState, setAdState] = useState<AdFrequencySettings>(() => {
    // Initialize from session storage or default
    try {
      const stored = sessionStorage.getItem("adFrequencyState")
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Failed to parse adFrequencyState from session storage:", error)
      return {}
    }
  })

  const currentPlacementState = adState[placementId] || { lastShown: null, count: 0 }

  // Determine if the ad should be shown based on frequency and cap
  const shouldShowAd = useCallback(() => {
    const now = Date.now()
    const lastShown = currentPlacementState.lastShown
    const count = currentPlacementState.count

    // Check if AdSense is enabled globally (from environment variable)
    const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"
    if (!isAdSenseEnabled) {
      return false // Do not show ad if AdSense is disabled
    }

    // Check if max ads for this placement have been reached
    if (MAX_ADS_PER_SESSION !== -1 && count >= MAX_ADS_PER_SESSION) {
      return false
    }

    // Check if enough time has passed since the last ad for this placement
    if (lastShown && now - lastShown < DEFAULT_AD_INTERVAL_MS) {
      return false
    }

    return true
  }, [currentPlacementState])

  // Function to call when an ad is successfully shown
  const recordAdShown = useCallback(() => {
    setAdState((prev) => {
      const newState = {
        ...prev,
        [placementId]: {
          lastShown: Date.now(),
          count: (prev[placementId]?.count || 0) + 1,
        },
      }
      try {
        sessionStorage.setItem("adFrequencyState", JSON.stringify(newState))
      } catch (error) {
        console.error("Failed to save adFrequencyState to session storage:", error)
      }
      return newState
    })
  }, [placementId])

  // Reset ad counts for all placements when the component mounts (new session/page load)
  // This ensures MAX_ADS_PER_SESSION applies per session, not across browser restarts
  useEffect(() => {
    setAdState((prev) => {
      const resetState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = { lastShown: null, count: 0 }
        return acc
      }, {} as AdFrequencySettings)
      try {
        sessionStorage.setItem("adFrequencyState", JSON.stringify(resetState))
      } catch (error) {
        console.error("Failed to reset adFrequencyState in session storage:", error)
      }
      return resetState
    })
  }, []) // Empty dependency array ensures this runs only once on mount

  return { shouldShowAd: shouldShowAd(), recordAdShown }
}

export default useAdFrequency
