"use client"

import { useEffect } from "react"
import useAdFrequency from "../../hooks/useAdFrequency" // Changed to default import
import { useSubscription } from "../../contexts/SubscriptionContext"
import useMobileDetection from "../../hooks/useMobileDetection" // Changed to default import

// Assuming these environment variables are correctly set in your .env file
const ADSENSE_PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID
const ADSENSE_TEST_MODE = import.meta.env.VITE_ADSENSE_TEST_MODE === "true"
const ADSENSE_ENABLED = import.meta.env.VITE_ADSENSE_ENABLED === "true"

// Ad unit IDs from your environment variables
const HEADER_BANNER_AD_UNIT = import.meta.env.VITE_ADSENSE_HEADER_BANNER
const CONTENT_RECTANGLE_AD_UNIT = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE
const MOBILE_BANNER_AD_UNIT = import.meta.env.VITE_ADSENSE_MOBILE_BANNER
const SIDEBAR_SKYSCRAPER_AD_UNIT = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
const FOOTER_BANNER_AD_UNIT = import.meta.env.VITE_ADSENSE_FOOTER_BANNER
const IN_FEED_NATIVE_AD_UNIT = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
const IN_ARTICLE_NATIVE_AD_UNIT = import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE
const BANNER_AD_UNIT = import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT
const MAIN_DISPLAY_AD_UNIT = import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT

// Helper to push ad units to the global adsbygoogle array
const pushAd = (slot, format = "auto", responsive = "true") => {
  if (window.adsbygoogle && ADSENSE_ENABLED) {
    try {
      window.adsbygoogle.push({
        google_ad_client: ADSENSE_PUBLISHER_ID,
        enable_page_level_ads: true,
        ad_slot: slot,
        ad_format: format,
        full_width_responsive: responsive,
        test_mode: ADSENSE_TEST_MODE ? "on" : "off", // Enable test ads if in test mode
      })
    } catch (e) {
      console.error("AdSense push error:", e)
    }
  }
}

// Generic Ad Component
const AdComponent = ({ slot, format = "auto", responsive = "true", className = "" }) => {
  const { showAds } = useSubscription()
  const { shouldShowAd, recordAdShown } = useAdFrequency(slot) // Use the hook

  useEffect(() => {
    if (ADSENSE_ENABLED && showAds && shouldShowAd()) {
      pushAd(slot, format, responsive)
      recordAdShown() // Record that an ad was shown
    }
  }, [slot, format, responsive, showAds, ADSENSE_ENABLED, shouldShowAd, recordAdShown])

  if (!ADSENSE_ENABLED || !showAds || !shouldShowAd()) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex items-center justify-center text-center p-4 rounded-lg ${className}`}
        style={{ minHeight: "100px" }}
      >
        Ad Blocked or Disabled (Slot: {slot})
      </div>
    )
  }

  return (
    <div className={`my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        data-adtest={ADSENSE_TEST_MODE ? "on" : undefined} // Use data-adtest for test mode
      ></ins>
    </div>
  )
}

// Specific Ad Components
export const HeaderBannerAd = () => {
  const isMobile = useMobileDetection() // Use the hook
  const slot = isMobile ? MOBILE_BANNER_AD_UNIT : HEADER_BANNER_AD_UNIT
  if (!slot) return null
  return <AdComponent slot={slot} className="w-full h-[50px] sm:h-[90px]" />
}

export const ContentRectangleAd = () => {
  if (!CONTENT_RECTANGLE_AD_UNIT) return null
  return <AdComponent slot={CONTENT_RECTANGLE_AD_UNIT} format="rectangle" className="w-full h-[250px] sm:h-[280px]" />
}

export const InFeedNativeAd = () => {
  if (!IN_FEED_NATIVE_AD_UNIT) return null
  return (
    <AdComponent
      slot={IN_FEED_NATIVE_AD_UNIT}
      format="fluid"
      data-ad-layout-key="-gw-1+2a-49+5f"
      className="w-full h-[250px] sm:h-[280px]"
    />
  )
}

export const MobileBannerAd = () => {
  if (!MOBILE_BANNER_AD_UNIT) return null
  return <AdComponent slot={MOBILE_BANNER_AD_UNIT} format="auto" className="w-full h-[50px]" />
}

export const ResponsiveAd = ({ placement }) => {
  let slot
  let format = "auto"
  let className = ""

  switch (placement) {
    case "header":
      slot = HEADER_BANNER_AD_UNIT
      className = "w-full h-[50px] sm:h-[90px]"
      break
    case "content":
      slot = CONTENT_RECTANGLE_AD_UNIT
      format = "rectangle"
      className = "w-full h-[250px] sm:h-[280px]"
      break
    case "infeed":
      slot = IN_FEED_NATIVE_AD_UNIT
      format = "fluid"
      className = "w-full h-[250px] sm:h-[280px]"
      break
    case "sidebar":
      slot = SIDEBAR_SKYSCRAPER_AD_UNIT
      format = "vertical"
      className = "w-full h-[600px]" // Skyscraper ads are typically tall
      break
    case "footer":
      slot = FOOTER_BANNER_AD_UNIT
      className = "w-full h-[50px] sm:h-[90px]"
      break
    case "banner":
      slot = BANNER_AD_UNIT
      className = "w-full h-[50px] sm:h-[90px]"
      break
    case "main-display":
      slot = MAIN_DISPLAY_AD_UNIT
      className = "w-full h-[250px] sm:h-[280px]"
      break
    default:
      console.warn("Unknown ad placement:", placement)
      return null
  }

  if (!slot) return null
  return <AdComponent slot={slot} format={format} className={className} />
}

export const SidebarSkyscraperAd = () => {
  if (!SIDEBAR_SKYSCRAPER_AD_UNIT) return null
  return <AdComponent slot={SIDEBAR_SKYSCRAPER_AD_UNIT} format="vertical" className="w-full h-[600px]" />
}

export const FooterBannerAd = () => {
  if (!FOOTER_BANNER_AD_UNIT) return null
  return <AdComponent slot={FOOTER_BANNER_AD_UNIT} className="w-full h-[50px] sm:h-[90px]" />
}
