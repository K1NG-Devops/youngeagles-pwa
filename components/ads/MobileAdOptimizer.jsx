"use client"

import { useState, useEffect } from "react"
import { MobileBannerAd, ContentRectangleAd, InFeedNativeAd } from "./AdSenseComponents"

export const MobileAdOptimizer = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    screenWidth: 0,
    orientation: "portrait",
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setDeviceInfo({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        screenWidth: width,
        orientation: width > height ? "landscape" : "portrait",
      })
    }

    updateDeviceInfo()
    window.addEventListener("resize", updateDeviceInfo)
    window.addEventListener("orientationchange", updateDeviceInfo)

    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
      window.removeEventListener("orientationchange", updateDeviceInfo)
    }
  }, [])

  // Mobile-specific ad placement
  if (deviceInfo.isMobile) {
    return (
      <div className="mobile-ad-container">
        {/* Top banner for mobile */}
        <div
          className="mobile-top-ad"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            backgroundColor: "white",
            padding: "5px",
            textAlign: "center",
            borderBottom: "1px solid #eee",
          }}
        >
          <MobileBannerAd />
        </div>

        {/* In-content ad for mobile */}
        <div
          className="mobile-content-ad"
          style={{
            margin: "20px 0",
            textAlign: "center",
          }}
        >
          <ContentRectangleAd
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>

        {/* Native in-feed ad */}
        <div
          className="mobile-native-ad"
          style={{
            margin: "15px 0",
          }}
        >
          <InFeedNativeAd />
        </div>
      </div>
    )
  }

  return null
}

// Hook for mobile ad optimization
export const useMobileAdOptimization = () => {
  const [adConfig, setAdConfig] = useState({
    showStickyAd: false,
    adDensity: "normal",
    preferredFormats: ["banner"],
  })

  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    const isSlowConnection = navigator.connection && navigator.connection.effectiveType === "slow-2g"

    setAdConfig({
      showStickyAd: isMobile && !isSlowConnection,
      adDensity: isSlowConnection ? "low" : "normal",
      preferredFormats: isMobile ? ["banner", "native"] : ["banner", "rectangle", "skyscraper"],
    })
  }, [])

  return adConfig
}
