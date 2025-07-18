"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSubscription } from "../../contexts/SubscriptionContext"

const AdSenseContext = createContext()

export const useAdSense = () => {
  const context = useContext(AdSenseContext)
  if (!context) {
    throw new Error("useAdSense must be used within AdSenseProvider")
  }
  return context
}

export const AdSenseProvider = ({ children }) => {
  const { subscription, getCurrentPlan } = useSubscription()
  const [adSenseLoaded, setAdSenseLoaded] = useState(false)
  const [adBlockerDetected, setAdBlockerDetected] = useState(false)
  const [adsEnabled, setAdsEnabled] = useState(false)

  // Check if ads should be shown based on subscription
  useEffect(() => {
    const currentPlan = getCurrentPlan()
    const shouldShowAds = currentPlan?.features?.ads_enabled === true
    setAdsEnabled(shouldShowAds)
  }, [subscription, getCurrentPlan])

  // Load AdSense script
  useEffect(() => {
    if (!adsEnabled) return

    const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID
    if (!publisherId) {
      console.warn("AdSense Publisher ID not configured")
      return
    }

    const loadAdSense = async () => {
      try {
        // Check if already loaded
        if (window.adsbygoogle) {
          setAdSenseLoaded(true)
          return
        }

        const script = document.createElement("script")
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
        script.async = true
        script.crossOrigin = "anonymous"

        script.onload = () => {
          setAdSenseLoaded(true)
          console.log("AdSense loaded successfully")
        }

        script.onerror = () => {
          console.error("Failed to load AdSense")
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading AdSense:", error)
      }
    }

    loadAdSense()
  }, [adsEnabled])

  // Detect ad blocker
  useEffect(() => {
    const detectAdBlocker = () => {
      const testAd = document.createElement("div")
      testAd.innerHTML = "&nbsp;"
      testAd.className = "adsbox"
      testAd.style.position = "absolute"
      testAd.style.left = "-10000px"
      document.body.appendChild(testAd)

      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0
        setAdBlockerDetected(isBlocked)
        document.body.removeChild(testAd)
      }, 100)
    }

    if (adsEnabled) {
      detectAdBlocker()
    }
  }, [adsEnabled])

  const value = {
    adSenseLoaded,
    adBlockerDetected,
    adsEnabled,
    canShowAds: adsEnabled && !adBlockerDetected && adSenseLoaded,
  }

  return <AdSenseContext.Provider value={value}>{children}</AdSenseContext.Provider>
}
