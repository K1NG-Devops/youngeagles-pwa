"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface GoogleAdsContextType {
  isAdBlockerDetected: boolean
  isAdsLoaded: boolean
  adError: string | null
  refreshAds: () => void
}

const GoogleAdsContext = createContext<GoogleAdsContextType | undefined>(undefined)

export const useGoogleAds = () => {
  const context = useContext(GoogleAdsContext)
  if (!context) {
    throw new Error("useGoogleAds must be used within GoogleAdsProvider")
  }
  return context
}

interface GoogleAdsProviderProps {
  children: React.ReactNode
  publisherId: string
  testMode?: boolean
}

export const GoogleAdsProvider: React.FC<GoogleAdsProviderProps> = ({ children, publisherId, testMode = false }) => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false)
  const [isAdsLoaded, setIsAdsLoaded] = useState(false)
  const [adError, setAdError] = useState<string | null>(null)

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
        setIsAdBlockerDetected(isBlocked)
        document.body.removeChild(testAd)

        if (isBlocked) {
          console.warn("Ad blocker detected")
          setAdError("Ad blocker detected")
        }
      }, 100)
    }

    detectAdBlocker()
  }, [])

  // Load Google AdSense script
  useEffect(() => {
    const loadGoogleAds = async () => {
      try {
        // Check if script already exists
        if (document.querySelector('script[src*="adsbygoogle.js"]')) {
          setIsAdsLoaded(true)
          return
        }

        const script = document.createElement("script")
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${publisherId}`
        script.async = true
        script.crossOrigin = "anonymous"

        script.onload = () => {
          setIsAdsLoaded(true)
          console.log("Google Ads loaded successfully")
        }

        script.onerror = () => {
          setAdError("Failed to load Google Ads script")
          console.error("Failed to load Google Ads script")
        }

        document.head.appendChild(script)
      } catch (error) {
        setAdError("Error loading Google Ads")
        console.error("Error loading Google Ads:", error)
      }
    }

    if (!isAdBlockerDetected) {
      loadGoogleAds()
    }
  }, [publisherId, isAdBlockerDetected])

  const refreshAds = () => {
    if (window.adsbygoogle && !isAdBlockerDetected) {
      try {
        // Refresh all ads on the page
        const ads = document.querySelectorAll(".adsbygoogle")
        ads.forEach((ad) => {
          if (ad.getAttribute("data-adsbygoogle-status") !== "done") {
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          }
        })
      } catch (error) {
        console.error("Error refreshing ads:", error)
      }
    }
  }

  const value = {
    isAdBlockerDetected,
    isAdsLoaded,
    adError,
    refreshAds,
  }

  return <GoogleAdsContext.Provider value={value}>{children}</GoogleAdsContext.Provider>
}
