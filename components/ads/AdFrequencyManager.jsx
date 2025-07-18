"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AdFrequencyContext = createContext()

export const useAdFrequency = () => {
  const context = useContext(AdFrequencyContext)
  if (!context) {
    throw new Error("useAdFrequency must be used within AdFrequencyProvider")
  }
  return context
}

export const AdFrequencyProvider = ({ children }) => {
  const [adViews, setAdViews] = useState({})
  const [lastAdView, setLastAdView] = useState({})

  // Load from localStorage on mount
  useEffect(() => {
    const savedAdViews = localStorage.getItem("adViews")
    const savedLastAdView = localStorage.getItem("lastAdView")

    if (savedAdViews) {
      setAdViews(JSON.parse(savedAdViews))
    }
    if (savedLastAdView) {
      setLastAdView(JSON.parse(savedLastAdView))
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("adViews", JSON.stringify(adViews))
  }, [adViews])

  useEffect(() => {
    localStorage.setItem("lastAdView", JSON.stringify(lastAdView))
  }, [lastAdView])

  const recordAdView = (adSlot) => {
    const now = Date.now()
    setAdViews((prev) => ({
      ...prev,
      [adSlot]: (prev[adSlot] || 0) + 1,
    }))
    setLastAdView((prev) => ({
      ...prev,
      [adSlot]: now,
    }))
  }

  const shouldShowAd = (adSlot, maxViewsPerHour = 10, minIntervalMinutes = 5) => {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const minInterval = minIntervalMinutes * 60 * 1000

    // Check if enough time has passed since last view
    const lastView = lastAdView[adSlot]
    if (lastView && now - lastView < minInterval) {
      return false
    }

    // Check hourly limit
    const viewsInLastHour = adViews[adSlot] || 0
    if (viewsInLastHour >= maxViewsPerHour) {
      return false
    }

    return true
  }

  const resetHourlyCounters = () => {
    setAdViews({})
  }

  // Reset counters every hour
  useEffect(() => {
    const interval = setInterval(resetHourlyCounters, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AdFrequencyContext.Provider
      value={{
        recordAdView,
        shouldShowAd,
        adViews,
        lastAdView,
      }}
    >
      {children}
    </AdFrequencyContext.Provider>
  )
}

// HOC for ads with frequency control
export const withAdFrequency = (WrappedComponent) => {
  return function AdWithFrequency(props) {
    const { shouldShowAd, recordAdView } = useAdFrequency()
    const { adSlot, maxViewsPerHour = 10, minIntervalMinutes = 5 } = props

    useEffect(() => {
      if (shouldShowAd(adSlot, maxViewsPerHour, minIntervalMinutes)) {
        recordAdView(adSlot)
      }
    }, [adSlot, maxViewsPerHour, minIntervalMinutes])

    if (!shouldShowAd(adSlot, maxViewsPerHour, minIntervalMinutes)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
