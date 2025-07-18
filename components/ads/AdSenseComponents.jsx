"use client"

import { useEffect, useState } from "react"

// AdSense Script Loader
export const AdSenseScript = () => {
  useEffect(() => {
    // Only load if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement("script")
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADSENSE_PUBLISHER_ID}`
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)
    }
  }, [])

  return null
}

// Base AdSense Component
const AdSenseAd = ({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
  className = "",
  adTest = import.meta.env.VITE_ADSENSE_TEST_MODE === "true" ? "on" : "off",
}) => {
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (import.meta.env.VITE_ADSENSE_ENABLED !== "true") {
      return
    }

    try {
      // Push ad to AdSense
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
        setAdLoaded(true)
      }
    } catch (error) {
      console.error("AdSense error:", error)
      setAdError(true)
    }
  }, [])

  // Don't render if ads are disabled
  if (import.meta.env.VITE_ADSENSE_ENABLED !== "true") {
    return (
      <div className={`ad-placeholder ${className}`} style={style}>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            border: "1px dashed #ccc",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, color: "#666" }}>Ad Space</p>
        </div>
      </div>
    )
  }

  // Show error fallback
  if (adError) {
    return (
      <div className={`ad-error ${className}`} style={style}>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, color: "#856404" }}>Unable to load ad</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-adtest={adTest}
      />
    </div>
  )
}

// Mobile Banner Ad (320x50)
export const MobileBannerAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_MOBILE_BANNER}
    adFormat="banner"
    style={{ width: "320px", height: "50px", ...style }}
    className={`mobile-banner-ad ${className}`}
    fullWidthResponsive={false}
  />
)

// Header Banner Ad (728x90)
export const HeaderBannerAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
    adFormat="banner"
    style={{ width: "728px", height: "90px", ...style }}
    className={`header-banner-ad ${className}`}
    fullWidthResponsive={false}
  />
)

// Footer Banner Ad
export const FooterBannerAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_FOOTER_BANNER}
    adFormat="banner"
    style={{ width: "728px", height: "90px", ...style }}
    className={`footer-banner-ad ${className}`}
    fullWidthResponsive={false}
  />
)

// Sidebar Skyscraper Ad (160x600)
export const SidebarSkyscraperAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER}
    adFormat="vertical"
    style={{ width: "160px", height: "600px", ...style }}
    className={`sidebar-skyscraper-ad ${className}`}
    fullWidthResponsive={false}
  />
)

// Content Rectangle Ad (300x250)
export const ContentRectangleAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
    adFormat="rectangle"
    style={{ width: "300px", height: "250px", ...style }}
    className={`content-rectangle-ad ${className}`}
    fullWidthResponsive={false}
  />
)

// Responsive Display Ad
export const ResponsiveDisplayAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT}
    adFormat="auto"
    style={{ display: "block", ...style }}
    className={`responsive-display-ad ${className}`}
    fullWidthResponsive={true}
  />
)

// In-Feed Native Ad
export const InFeedNativeAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
    adFormat="fluid"
    style={{ display: "block", ...style }}
    className={`in-feed-native-ad ${className}`}
    fullWidthResponsive={true}
  />
)

// In-Article Native Ad
export const InArticleNativeAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE}
    adFormat="fluid"
    style={{ display: "block", ...style }}
    className={`in-article-native-ad ${className}`}
    fullWidthResponsive={true}
  />
)

// Smart Ad Component (chooses best ad based on screen size)
export const SmartAd = ({ className = "", style = {} }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    return <MobileBannerAd className={className} style={style} />
  }

  return <ResponsiveDisplayAd className={className} style={style} />
}
