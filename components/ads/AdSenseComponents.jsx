"use client"

import { useEffect } from "react"
import { useAdFrequency } from "../../hooks/useAdFrequency"
import { useMobileDetection } from "../../hooks/useMobileDetection"

// AdSense Script Component
export const AdSenseScript = ({ publisherId }) => {
  useEffect(() => {
    if (window) {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    }
  }, [])

  return null // This component doesn't render anything visible
}

// Generic Responsive Ad Component
const ResponsiveAd = ({ slotId, format = "auto", responsive = "true" }) => {
  const { incrementAdCount, canShowAd } = useAdFrequency()
  const isMobile = useMobileDetection()

  const adUnitId =
    import.meta.env.VITE_ADSENSE_TEST_MODE === "true"
      ? `ca-pub-5506438806314781` // Test publisher ID
      : import.meta.env.VITE_ADSENSE_PUBLISHER_ID

  const fullSlotId =
    import.meta.env.VITE_ADSENSE_TEST_MODE === "true"
      ? `2894237519` // Test ad unit ID
      : slotId

  useEffect(() => {
    if (canShowAd(slotId) && window && window.adsbygoogle) {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        incrementAdCount(slotId)
      } catch (e) {
        console.error("AdSense push error:", e)
      }
    }
  }, [slotId, canShowAd, incrementAdCount, isMobile])

  if (import.meta.env.VITE_ADSENSE_ENABLED !== "true" || !canShowAd(slotId)) {
    return null
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={adUnitId}
      data-ad-slot={fullSlotId}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    ></ins>
  )
}

// Specific Ad Components using ResponsiveAd
export const HeaderBannerAd = () => <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_HEADER_BANNER} format="auto" />

export const ContentRectangleAd = () => (
  <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE} format="rectangle" />
)

export const MobileBannerAd = () => <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_MOBILE_BANNER} format="auto" />

export const SidebarSkyscraperAd = () => (
  <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER} format="auto" />
)

export const FooterBannerAd = () => <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_FOOTER_BANNER} format="auto" />

export const InFeedNativeAd = () => (
  <ResponsiveAd
    slotId={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
    format="fluid"
    data-ad-layout-key="-gw-3+1f-38+52"
  />
)

export const InArticleNativeAd = () => (
  <ResponsiveAd
    slotId={import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE}
    format="fluid"
    data-ad-layout-key="-ha-1+5n-4t-6t"
  />
)

export const BannerAdUnit = () => <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_BANNER_AD_UNIT} format="auto" />

export const MainDisplayAd = () => (
  <ResponsiveAd slotId={import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT} format="auto" />
)
