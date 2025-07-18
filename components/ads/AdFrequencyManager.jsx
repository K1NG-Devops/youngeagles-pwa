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
  const [adCounts, setAdCounts] = useState({})
  const [lastAdTime, setLastAdTime] = useState({})

  // Ad frequency limits
  const AD_LIMITS = {
    mobile_banner: { max: 3, cooldown: 30000 }, // 3 ads per 30 seconds
    header_banner: { max: 2, cooldown: 60000 }, // 2 ads per minute
    content_rectangle: { max: 4, cooldown: 45000 }, // 4 ads per 45 seconds
    responsive_display: { max: 5, cooldown: 30000 }, // 5 ads per 30 seconds
  }

  const canShowAd = (adType) => {
    const now = Date.now()
    const limit = AD_LIMITS[adType]

    if (!limit) return true

    const lastTime = lastAdTime[adType] || 0
    const count = adCounts[adType] || 0

    // Reset count if cooldown period has passed
    if (now - lastTime > limit.cooldown) {
      setAdCounts((prev) => ({ ...prev, [adType]: 0 }))
      return true
    }

    // Check if we're under the limit
    return count < limit.max
  }

  const recordAdShown = (adType) => {
    const now = Date.now()
    setAdCounts((prev) => ({
      ...prev,
      [adType]: (prev[adType] || 0) + 1,
    }))
    setLastAdTime((prev) => ({
      ...prev,
      [adType]: now,
    }))
  }

  const value = {
    canShowAd,
    recordAdShown,
    adCounts,
    lastAdTime,
  }

  return <AdFrequencyContext.Provider value={value}>{children}</AdFrequencyContext.Provider>
}

// HOC to wrap ads with frequency control
export const withAdFrequency = (WrappedComponent, adType) => {
  return function AdWithFrequency(props) {
    const { canShowAd, recordAdShown } = useAdFrequency()
    const [shouldShow, setShouldShow] = useState(false)

    useEffect(() => {
      if (canShowAd(adType)) {
        setShouldShow(true)
        recordAdShown(adType)
      }
    }, [canShowAd, recordAdShown, adType])

    if (!shouldShow) {
      return (
        <div
          className="ad-frequency-limited"
          style={{
            padding: "10px",
            textAlign: "center",
            color: "#666",
            fontSize: "12px",
          }}
        >
          Ad frequency limit reached
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}
