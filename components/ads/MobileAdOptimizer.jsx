"use client"

import { useState, useEffect } from "react"
import { MobileBannerAd, ContentRectangleAd, InFeedNativeAd } from "./AdSenseComponents"

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setScreenSize({ width, height })
      setIsMobile(width <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return { isMobile, screenSize }
}

export const MobileOptimizedAd = ({
  desktopComponent: DesktopComponent,
  mobileComponent: MobileComponent,
  ...props
}) => {
  const { isMobile } = useMobileDetection()

  if (isMobile) {
    return MobileComponent ? <MobileComponent {...props} /> : <MobileBannerAd {...props} />
  }

  return DesktopComponent ? <DesktopComponent {...props} /> : <ContentRectangleAd {...props} />
}

export const StickyMobileAd = ({ className = "", style = {} }) => {
  const { isMobile } = useMobileDetection()
  const [isVisible, setIsVisible] = useState(true)

  if (!isMobile) return null

  return (
    <div
      className={`sticky-mobile-ad ${className}`}
      style={{
        position: "fixed",
        bottom: isVisible ? "0" : "-60px",
        left: "0",
        right: "0",
        zIndex: 1000,
        backgroundColor: "white",
        borderTop: "1px solid #ddd",
        transition: "bottom 0.3s ease",
        ...style,
      }}
    >
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 1001,
        }}
      >
        ×
      </button>
      <MobileBannerAd />
    </div>
  )
}

export const InContentMobileAd = ({ contentLength = 0, className = "", style = {} }) => {
  const { isMobile } = useMobileDetection()

  // Show in-content ads for longer content on mobile
  if (!isMobile || contentLength < 500) return null

  return (
    <div
      className={`in-content-mobile-ad ${className}`}
      style={{
        margin: "20px 0",
        padding: "10px",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
        ...style,
      }}
    >
      <small style={{ color: "#666", fontSize: "12px" }}>Advertisement</small>
      <InFeedNativeAd />
    </div>
  )
}
