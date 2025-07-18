"use client"

import { useState, useEffect, useCallback } from "react"

interface AdFrequencyConfig {
  maxAdsPerSession: number
  maxAdsPerPage: number
  minTimeBetweenAds: number // in milliseconds
  resetInterval: number // in milliseconds
}

const DEFAULT_CONFIG: AdFrequencyConfig = {
  maxAdsPerSession: 10,
  maxAdsPerPage: 3,
  minTimeBetweenAds: 30000, // 30 seconds
  resetInterval: 3600000, // 1 hour
}

interface AdFrequencyState {
  sessionAdsShown: number
  pageAdsShown: number
  lastAdTime: number
  lastResetTime: number
}

const useAdFrequency = (pageId: string, adType: string, config: Partial<AdFrequencyConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storageKey = `adFrequency_${pageId}_${adType}`

  const [state, setState] = useState<AdFrequencyState>(() => {
    if (typeof window === "undefined") {
      return {
        sessionAdsShown: 0,
        pageAdsShown: 0,
        lastAdTime: 0,
        lastResetTime: Date.now(),
      }
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()

        // Reset if interval has passed
        if (now - parsed.lastResetTime > finalConfig.resetInterval) {
          return {
            sessionAdsShown: 0,
            pageAdsShown: 0,
            lastAdTime: 0,
            lastResetTime: now,
          }
        }

        return parsed
      }
    } catch (error) {
      console.error("Error loading ad frequency state:", error)
    }

    return {
      sessionAdsShown: 0,
      pageAdsShown: 0,
      lastAdTime: 0,
      lastResetTime: Date.now(),
    }
  })

  // Save state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.error("Error saving ad frequency state:", error)
    }
  }, [state, storageKey])

  // Reset page ads when component mounts
  useEffect(() => {
    setState((prev) => ({ ...prev, pageAdsShown: 0 }))
  }, [pageId])

  const shouldShowAd = useCallback(() => {
    const now = Date.now()

    // Check session limit
    if (state.sessionAdsShown >= finalConfig.maxAdsPerSession) {
      return false
    }

    // Check page limit
    if (state.pageAdsShown >= finalConfig.maxAdsPerPage) {
      return false
    }

    // Check time between ads
    if (now - state.lastAdTime < finalConfig.minTimeBetweenAds) {
      return false
    }

    return true
  }, [state])

  const recordAdShown = useCallback(() => {
    const now = Date.now()
    setState((prev) => ({
      ...prev,
      sessionAdsShown: prev.sessionAdsShown + 1,
      pageAdsShown: prev.pageAdsShown + 1,
      lastAdTime: now,
    }))
  }, [])

  const canShowMoreAds = useCallback(() => {
    return state.pageAdsShown < finalConfig.maxAdsPerPage && state.sessionAdsShown < finalConfig.maxAdsPerSession
  }, [state])

  const getAdStats = useCallback(() => {
    return {
      sessionAdsShown: state.sessionAdsShown,
      pageAdsShown: state.pageAdsShown,
      canShowMore: canShowMoreAds(),
      timeUntilNextAd: Math.max(0, finalConfig.minTimeBetweenAds - (Date.now() - state.lastAdTime)),
    }
  }, [state, canShowMoreAds])

  return {
    shouldShowAd: shouldShowAd(),
    recordAdShown,
    canShowMoreAds: canShowMoreAds(),
    getAdStats,
    adsShownThisPage: state.pageAdsShown,
    adsShownThisSession: state.sessionAdsShown,
  }
}

export default useAdFrequency
