"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useGoogleAds } from "./GoogleAdsProvider"
import useAdFrequency from "@/hooks/useAdFrequency"

// Declare global adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdSenseAdProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
  adTest?: string
  pageId?: string
  adType?: string
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
  className = "",
  adTest,
  pageId = "default",
  adType = "generic",
}) => {
  const { isAdsLoaded, isAdBlockerDetected } = useGoogleAds()
  const adRef = useRef<HTMLDivElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState<string | null>(null)

  const { shouldShowAd, recordAdShown } = useAdFrequency(pageId, adType)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  const testMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true"

  useEffect(() => {
    if (isAdsLoaded && !isAdBlockerDetected && adRef.current && !adLoaded && shouldShowAd) {
      try {
        // Push ad to adsbygoogle array
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        setAdLoaded(true)
        recordAdShown()
      } catch (error) {
        console.error("Error loading ad:", error)
        setAdError("Failed to load ad")
      }
    }
  }, [isAdsLoaded, isAdBlockerDetected, adLoaded, shouldShowAd, recordAdShown])

  if (!shouldShowAd) {
    return null
  }

  if (isAdBlockerDetected) {
    return (
      <div className={`ad-placeholder ${className}`} style={style}>
        <div className="text-center p-4 bg-gray-100 rounded border border-gray-200">
          <p className="text-sm text-gray-600">Please consider disabling your ad blocker to support our content</p>
        </div>
      </div>
    )
  }

  if (adError) {
    return (
      <div className={`ad-error ${className}`} style={style}>
        <div className="text-center p-4 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-red-600">Ad failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-ad-test={testMode ? "on" : undefined}
      />
    </div>
  )
}

// Mobile Banner Ad (320x50)
export const MobileBannerAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "mobile",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_MOBILE_BANNER || "5122452205"}
    adFormat="banner"
    style={{ width: "320px", height: "50px" }}
    className={`mobile-banner-ad ${className}`}
    fullWidthResponsive={false}
    pageId={pageId}
    adType="mobile-banner"
  />
)

// Header Banner Ad (728x90 desktop, 320x50 mobile)
export const HeaderBannerAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "header",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_HEADER_BANNER || "9586077878"}
    adFormat="banner"
    className={`header-banner-ad ${className}`}
    style={{ minWidth: "320px", minHeight: "50px" }}
    pageId={pageId}
    adType="header-banner"
  />
)

// Footer Banner Ad
export const FooterBannerAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "footer",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_FOOTER_BANNER || "3546766216"}
    adFormat="banner"
    className={`footer-banner-ad ${className}`}
    style={{ minWidth: "320px", minHeight: "50px" }}
    pageId={pageId}
    adType="footer-banner"
  />
)

// Content Rectangle Ad (300x250)
export const ContentRectangleAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "content",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_CONTENT_RECTANGLE || "1707587859"}
    adFormat="rectangle"
    style={{ width: "300px", height: "250px" }}
    className={`content-rectangle-ad ${className}`}
    fullWidthResponsive={false}
    pageId={pageId}
    adType="content-rectangle"
  />
)

// Sidebar Skyscraper Ad (160x600)
export const SidebarSkyscraperAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "sidebar",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SKYSCRAPER || "8151940224"}
    adFormat="vertical"
    style={{ width: "160px", height: "600px" }}
    className={`sidebar-skyscraper-ad ${className}`}
    fullWidthResponsive={false}
    pageId={pageId}
    adType="sidebar-skyscraper"
  />
)

// Responsive Ad
export const ResponsiveAd: React.FC<{
  placement: "header" | "content" | "sidebar" | "infeed" | "footer"
  className?: string
  pageId?: string
}> = ({ placement, className = "", pageId = "responsive" }) => {
  const getAdSlot = () => {
    switch (placement) {
      case "header":
        return process.env.NEXT_PUBLIC_ADSENSE_HEADER_BANNER || "9586077878"
      case "content":
        return process.env.NEXT_PUBLIC_ADSENSE_CONTENT_RECTANGLE || "1707587859"
      case "sidebar":
        return process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SKYSCRAPER || "8151940224"
      case "infeed":
        return process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_NATIVE || "6408733271"
      case "footer":
        return process.env.NEXT_PUBLIC_ADSENSE_FOOTER_BANNER || "3546766216"
      default:
        return process.env.NEXT_PUBLIC_ADSENSE_MAIN_DISPLAY || "2894237519"
    }
  }

  return (
    <AdSenseAd
      adSlot={getAdSlot()}
      adFormat="auto"
      className={`responsive-ad responsive-ad-${placement} ${className}`}
      style={{ minHeight: "50px" }}
      pageId={pageId}
      adType={`responsive-${placement}`}
    />
  )
}

// In-Feed Native Ad
export const InFeedNativeAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "infeed",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_NATIVE || "6408733271"}
    adFormat="fluid"
    className={`infeed-native-ad ${className}`}
    style={{ minHeight: "100px" }}
    pageId={pageId}
    adType="infeed-native"
  />
)

// In-Article Native Ad
export const InArticleNativeAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "article",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_IN_ARTICLE_NATIVE || "4668276193"}
    adFormat="fluid"
    className={`inarticle-native-ad ${className}`}
    style={{ minHeight: "100px" }}
    pageId={pageId}
    adType="inarticle-native"
  />
)

// Main Display Ad
export const MainDisplayAd: React.FC<{ className?: string; pageId?: string }> = ({
  className = "",
  pageId = "main",
}) => (
  <AdSenseAd
    adSlot={process.env.NEXT_PUBLIC_ADSENSE_MAIN_DISPLAY || "2894237519"}
    adFormat="auto"
    className={`main-display-ad ${className}`}
    style={{ minHeight: "250px" }}
    pageId={pageId}
    adType="main-display"
  />
)
