"use client"

import { useEffect } from "react"
import useAdFrequency from "../../hooks/useAdFrequency" // Changed to default import
import useMobileDetection from "../../hooks/useMobileDetection" // Changed to default import

// Helper to check if AdSense is enabled and in test mode
const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"
const isAdSenseTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true"
const adsensePublisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID

// Fallback ad component for when AdSense is disabled or in test mode
const FallbackAd = ({ type, className = "" }) => (
  <div className={`bg-gray-200 text-gray-600 text-center p-4 rounded-lg border border-gray-300 ${className}`}>
    <p className="font-semibold">Ad Placeholder ({type})</p>
    <p className="text-sm">AdSense {isAdSenseTestMode ? "Test Mode" : "Disabled"}</p>
  </div>
)

// Base AdSense component
const GoogleAdSense = ({ slot, format = "auto", responsive = "true", className = "", style = {} }) => {
  const { isMobile } = useMobileDetection() // Use the hook
  const { canShowAd } = useAdFrequency() // Use the hook

  useEffect(() => {
    if (isAdSenseEnabled && canShowAd(slot)) {
      try {
        // Push ad to array only if it's not already loaded
        if (window.adsbygoogle && window.adsbygoogle.loaded !== true) {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        }
      } catch (e) {
        console.error("AdSense error:", e)
      }
    }
  }, [slot, isMobile, canShowAd])

  if (!isAdSenseEnabled || !canShowAd(slot)) {
    return <FallbackAd type={`Slot: ${slot}`} className={className} />
  }

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={adsensePublisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      ></ins>
    </div>
  )
}

// Specific AdSense components based on common ad units
export const HeaderBannerAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_HEADER_BANNER
  return <GoogleAdSense slot={slot} format="auto" responsive="true" className={className} />
}

export const ContentRectangleAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE
  return <GoogleAdSense slot={slot} format="rectangle" responsive="true" className={className} />
}

export const MobileBannerAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_MOBILE_BANNER
  return <GoogleAdSense slot={slot} format="auto" responsive="true" className={className} />
}

export const SidebarSkyscraperAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
  return <GoogleAdSense slot={slot} format="auto" responsive="true" className={className} />
}

export const FooterBannerAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_FOOTER_BANNER
  return <GoogleAdSense slot={slot} format="auto" responsive="true" className={className} />
}

export const InFeedNativeAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
  return <GoogleAdSense slot={slot} format="fluid" data-ad-layout-key="-gw-3+1f-38+2z" className={className} />
}

export const InArticleNativeAd = ({ className }) => {
  const slot = import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE
  return <GoogleAdSense slot={slot} format="fluid" data-ad-layout-key="-ha-3+1f-38+2z" className={className} />
}

export const ResponsiveAd = ({ placement, className }) => {
  let slot
  switch (placement) {
    case "header":
      slot = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT
      break
    case "content":
      slot = import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT
      break
    case "infeed":
      slot = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
      break
    default:
      slot = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT // Fallback
  }
  return <GoogleAdSense slot={slot} format="auto" responsive="true" className={className} />
}
