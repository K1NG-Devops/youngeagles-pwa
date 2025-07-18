"use client"

import { useEffect } from "react"
import { useAdFrequency } from "../../hooks/useAdFrequency" // Corrected to named import
import { useMobileDetection } from "../../hooks/useMobileDetection" // Corrected to named import

// Helper to get AdSense client ID from environment variables
const getAdClient = () => import.meta.env.VITE_ADSENSE_PUBLISHER_ID
const isAdSenseEnabled = () => import.meta.env.VITE_ADSENSE_ENABLED === "true"
const isAdSenseTestMode = () => import.meta.env.VITE_ADSENSE_TEST_MODE === "true"

// Fallback Ad Component
const FallbackAd = ({ slot, type = "banner" }) => {
  const adStyle = {
    background: "#f0f0f0",
    border: "1px dashed #ccc",
    color: "#666",
    textAlign: "center",
    padding: "10px",
    margin: "10px 0",
    fontSize: "14px",
    minHeight: type === "banner" ? "50px" : "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: type === "banner" ? "728px" : "336px",
    aspectRatio: type === "banner" ? "728 / 90" : "336 / 280",
  }

  return (
    <div style={adStyle}>
      <p>Advertisement (Fallback) - Slot: {slot}</p>
      {isAdSenseTestMode() && <p>Test Mode: ON</p>}
    </div>
  )
}

// Main Google AdSense component
const GoogleAd = ({ slot, format = "auto", responsive = "true", className = "", style = {} }) => {
  const { shouldShowAd, recordAdShown } = useAdFrequency(slot)

  useEffect(() => {
    if (isAdSenseEnabled() && shouldShowAd()) {
      try {
        // Push ad to array only if window.adsbygoogle exists
        if (window.adsbygoogle && window.adsbygoogle.push) {
          window.adsbygoogle.push({})
          recordAdShown()
        } else {
          console.warn("AdSense script not loaded or window.adsbygoogle not available.")
        }
      } catch (e) {
        console.error("Error pushing AdSense ad:", e)
      }
    }
  }, [slot, shouldShowAd, recordAdShown])

  if (!isAdSenseEnabled() || !shouldShowAd()) {
    return <FallbackAd slot={slot} />
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block", ...style }}
      data-ad-client={getAdClient()}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    ></ins>
  )
}

// Specific AdSense Components
export const AdSenseScript = () => {
  useEffect(() => {
    if (isAdSenseEnabled() && !document.querySelector(`script[src*="${getAdClient()}"]`)) {
      const script = document.createElement("script")
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${getAdClient()}`
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)
    }
  }, [])
  return null
}

export const HeaderBannerAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_HEADER_BANNER
  return <GoogleAd slot={slot} format="horizontal" style={{ textAlign: "center" }} />
}

export const ContentRectangleAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE
  return <GoogleAd slot={slot} format="rectangle" style={{ margin: "auto" }} />
}

export const MobileBannerAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_MOBILE_BANNER
  const { isMobile } = useMobileDetection()
  if (!isMobile) return null // Only show on mobile
  return (
    <GoogleAd
      slot={slot}
      format="auto"
      responsive="true"
      style={{ textAlign: "center", width: "100%", height: "50px" }}
    />
  )
}

export const ResponsiveAd = ({ placement = "general" }) => {
  let slot
  switch (placement) {
    case "header":
      slot = import.meta.env.VITE_ADSENSE_HEADER_BANNER
      break
    case "content":
      slot = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE
      break
    case "infeed":
      slot = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
      break
    case "sidebar":
      slot = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
      break
    case "footer":
      slot = import.meta.env.VITE_ADSENSE_FOOTER_BANNER
      break
    default:
      slot = import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT
  }
  return <GoogleAd slot={slot} format="auto" responsive="true" />
}

export const InFeedNativeAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
  return <GoogleAd slot={slot} format="fluid" data-ad-layout-key="-gw-1+2a-49+5f" />
}

export const InArticleNativeAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE
  return <GoogleAd slot={slot} format="fluid" data-ad-layout-key="-ha-1+1e-3e+5f" />
}

export const MainDisplayAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT
  return <GoogleAd slot={slot} format="auto" responsive="true" />
}

export const BannerAdUnit = () => {
  const slot = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT
  return <GoogleAd slot={slot} format="auto" responsive="true" />
}

export const SidebarSkyscraperAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
  return <GoogleAd slot={slot} format="auto" responsive="true" style={{ minHeight: "600px" }} />
}

export const FooterBannerAd = () => {
  const slot = import.meta.env.VITE_ADSENSE_FOOTER_BANNER
  return <GoogleAd slot={slot} format="horizontal" style={{ textAlign: "center" }} />
}
