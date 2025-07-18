"use client"

import { useEffect, useRef, useState } from "react"

// AdSense Script Loader
export const AdSenseScript = () => {
  useEffect(() => {
    // Only load if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement("script")
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5506438806314781"
      script.async = true
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
  const adRef = useRef(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)

  useEffect(() => {
    if (import.meta.env.VITE_ADSENSE_ENABLED !== "true") {
      return
    }

    try {
      // Initialize adsbygoogle if not already done
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({})
        setAdLoaded(true)
      }
    } catch (error) {
      console.error("AdSense error:", error)
      setAdError(true)
    }
  }, [])

  if (import.meta.env.VITE_ADSENSE_ENABLED !== "true") {
    return (
      <div className={`ad-placeholder ${className}`} style={style}>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f0f0f0",
            textAlign: "center",
            border: "1px dashed #ccc",
          }}
        >
          AdSense Disabled
        </div>
      </div>
    )
  }

  if (adError) {
    return (
      <div className={`ad-error ${className}`} style={style}>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#ffe6e6",
            textAlign: "center",
            border: "1px solid #ffcccc",
          }}
        >
          Ad could not be loaded
        </div>
      </div>
    )
  }

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-5506438806314781"
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
    fullWidthResponsive={true}
    className={`mobile-banner-ad ${className}`}
    style={{ minHeight: "50px", ...style }}
  />
)

// Header Banner Ad (728x90)
export const HeaderBannerAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
    adFormat="banner"
    fullWidthResponsive={true}
    className={`header-banner-ad ${className}`}
    style={{ minHeight: "90px", ...style }}
  />
)

// Footer Banner Ad
export const FooterBannerAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_FOOTER_BANNER}
    adFormat="banner"
    fullWidthResponsive={true}
    className={`footer-banner-ad ${className}`}
    style={{ minHeight: "90px", ...style }}
  />
)

// Sidebar Skyscraper Ad (160x600)
export const SidebarSkyscraperAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER}
    adFormat="vertical"
    fullWidthResponsive={false}
    className={`sidebar-skyscraper-ad ${className}`}
    style={{ width: "160px", minHeight: "600px", ...style }}
  />
)

// Content Rectangle Ad (300x250)
export const ContentRectangleAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
    adFormat="rectangle"
    fullWidthResponsive={true}
    className={`content-rectangle-ad ${className}`}
    style={{ minHeight: "250px", ...style }}
  />
)

// In-Feed Native Ad
export const InFeedNativeAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
    adFormat="fluid"
    fullWidthResponsive={true}
    className={`in-feed-native-ad ${className}`}
    style={{ minHeight: "200px", ...style }}
  />
)

// In-Article Native Ad
export const InArticleNativeAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE}
    adFormat="fluid"
    fullWidthResponsive={true}
    className={`in-article-native-ad ${className}`}
    style={{ minHeight: "200px", ...style }}
  />
)

// Main Display Ad
export const MainDisplayAd = ({ className = "", style = {} }) => (
  <AdSenseAd
    adSlot={import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT}
    adFormat="auto"
    fullWidthResponsive={true}
    className={`main-display-ad ${className}`}
    style={{ minHeight: "280px", ...style }}
  />
)

// Responsive Ad Component
export const ResponsiveAd = ({ adSlot, className = "", style = {}, minHeight = "200px" }) => (
  <AdSenseAd
    adSlot={adSlot}
    adFormat="auto"
    fullWidthResponsive={true}
    className={`responsive-ad ${className}`}
    style={{ minHeight, ...style }}
  />
)
