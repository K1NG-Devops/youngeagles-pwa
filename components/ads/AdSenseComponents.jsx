"use client"

import { useEffect } from "react"
import useAdFrequency from "../../hooks/useAdFrequency" // Assuming default export
import useMobileDetection from "../../hooks/useMobileDetection" // Assuming default export

// Fallback Ad Components (assuming these exist and are correctly imported/defined)
import { HeaderAd, ContentAd, NativeAd, FooterAd } from "./AdComponents"

// Helper to check if AdSense is enabled and in test mode
const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"
const isAdSenseTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true"
const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID

// Component to load the AdSense script dynamically if not already in index.html
export const AdSenseScript = () => {
  useEffect(() => {
    if (isAdSenseEnabled && !document.querySelector(`script[src*="adsbygoogle.js?client=${publisherId}"]`)) {
      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      script.async = true
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)
    }
  }, [])
  return null
}

// Generic Google AdSense component
const GoogleAd = ({ slot, format = "auto", responsive = "true", className = "", style = {} }) => {
  const { shouldShowAd, recordAdShown } = useAdFrequency("ad-slot-" + slot)
  const isMobile = useMobileDetection() // Use the hook

  useEffect(() => {
    if (isAdSenseEnabled && shouldShowAd && window.adsbygoogle && window.adsbygoogle.push) {
      try {
        // Push an empty object to the adsbygoogle array to trigger ad loading
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        recordAdShown()
      } catch (e) {
        console.error("AdSense push error:", e)
      }
    }
  }, [slot, shouldShowAd, isMobile]) // Re-run if slot changes or ad should show

  if (!isAdSenseEnabled) {
    return <div className={`bg-gray-200 text-gray-600 p-4 text-center ${className}`}>AdSense Disabled (Fallback)</div>
  }

  if (isAdSenseTestMode) {
    return (
      <div className={`bg-yellow-100 text-yellow-800 p-4 text-center ${className}`}>
        AdSense Test Mode (Slot: {slot})
      </div>
    )
  }

  if (!shouldShowAd) {
    return <div className={`bg-gray-100 text-gray-500 p-4 text-center ${className}`}>Ad hidden by frequency cap</div>
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      ></ins>
    </div>
  )
}

// Specific Ad Components
export const HeaderBannerAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_HEADER_BANNER
  if (!slot) return <HeaderAd /> // Fallback
  return <GoogleAd slot={slot} format="auto" responsive="true" className={className} />
}

export const ContentRectangleAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE
  if (!slot) return <ContentAd /> // Fallback
  return <GoogleAd slot={slot} format="rectangle" responsive="true" className={className} />
}

export const InFeedNativeAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
  if (!slot) return <NativeAd /> // Fallback
  return <GoogleAd slot={slot} format="fluid" data-ad-layout-key="-gw-1+2a-3a+4a" className={className} />
}

export const MobileBannerAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_MOBILE_BANNER
  if (!slot) return <HeaderAd /> // Fallback
  return <GoogleAd slot={slot} format="auto" responsive="true" className={className} />
}

export const ResponsiveAd = ({ placement = "general", className = "" }) => {
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
    case "mobile":
      slot = import.meta.env.VITE_ADSENSE_MOBILE_BANNER
      break
    default:
      slot = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT // A general banner unit
  }
  if (!slot) return <ContentAd /> // Fallback
  return <GoogleAd slot={slot} format="auto" responsive="true" className={className} />
}

export const SidebarSkyscraperAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
  if (!slot) return <ContentAd /> // Fallback
  return <GoogleAd slot={slot} format="auto" responsive="true" className={className} />
}

export const FooterBannerAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_FOOTER_BANNER
  if (!slot) return <FooterAd /> // Assuming FooterAd exists in AdComponents
  return <GoogleAd slot={slot} format="auto" responsive="true" className={className} />
}

export const MainDisplayAd = ({ className = "" }) => {
  const slot = import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT
  if (!slot) return <ContentAd /> // Fallback
  return <GoogleAd slot={slot} format="auto" responsive="true" className={className} />
}
