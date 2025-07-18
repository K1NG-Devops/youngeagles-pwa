"use client"

import { useState, useEffect } from "react"
import { MobileBannerAd, ContentRectangleAd, InFeedNativeAd } from "./AdSenseComponents"

export const useMobileAdOptimizer = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Simple check for common mobile user agents or screen width
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex =
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|rim)|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
      const tabletRegex = /android|ipad|playbook|silk/i

      const isMobileDevice = mobileRegex.test(userAgent) || tabletRegex.test(userAgent) || window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return { isMobile }
}

export const MobileOptimizedAd = ({
  desktopComponent: DesktopComponent,
  mobileComponent: MobileComponent,
  ...props
}) => {
  const { isMobile } = useMobileAdOptimizer()

  if (isMobile) {
    return MobileComponent ? <MobileComponent {...props} /> : <MobileBannerAd {...props} />
  }

  return DesktopComponent ? <DesktopComponent {...props} /> : <ContentRectangleAd {...props} />
}

export const StickyMobileAd = ({ className = "", style = {} }) => {
  const { isMobile } = useMobileAdOptimizer()
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
  const { isMobile } = useMobileAdOptimizer()

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
