"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useGoogleAds } from "./GoogleAdsProvider"

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
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
  className = "",
  adTest,
}) => {
  const { isAdsLoaded, isAdBlockerDetected } = useGoogleAds()
  const adRef = useRef<HTMLDivElement>(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdsLoaded && !isAdBlockerDetected && adRef.current && !adLoaded) {
      try {
        // Push ad to adsbygoogle array
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        setAdLoaded(true)
      } catch (error) {
        console.error("Error loading ad:", error)
        setAdError("Failed to load ad")
      }
    }
  }, [isAdsLoaded, isAdBlockerDetected, adLoaded])

  if (isAdBlockerDetected) {
    return (
      <div className={`ad-placeholder ${className}`} style={style}>
        <div className="text-center p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Please consider disabling your ad blocker to support our content</p>
        </div>
      </div>
    )
  }

  if (adError) {
    return (
      <div className={`ad-error ${className}`} style={style}>
        <div className="text-center p-4 bg-red-50 rounded">
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
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
        data-ad-test={adTest}
      />
    </div>
  )
}

// Mobile Banner Ad (320x50)
export const MobileBannerAd: React.FC<{ className?: string }> = ({ className = "" }) => (
  <AdSenseAd
    adSlot="YOUR_MOBILE_BANNER_SLOT"
    adFormat="banner"
    style={{ width: "320px", height: "50px" }}
    className={`mobile-banner-ad ${className}`}
    fullWidthResponsive={false}
  />
)

// Header Banner Ad (728x90 desktop, 320x50 mobile)
export const HeaderBannerAd: React.FC<{ className?: string }> = ({ className = "" }) => (
  <AdSenseAd
    adSlot="YOUR_HEADER_BANNER_SLOT"
    adFormat="banner"
    className={`header-banner-ad ${className}`}
    style={{ minWidth: "320px", minHeight: "50px" }}
  />
)

// Responsive Ad
export const ResponsiveAd: React.FC<{
  placement: "header" | "content" | "sidebar" | "infeed"
  className?: string
}> = ({ placement, className = "" }) => {
  const getAdSlot = () => {
    switch (placement) {
      case "header":
        return "YOUR_HEADER_RESPONSIVE_SLOT"
      case "content":
        return "YOUR_CONTENT_RESPONSIVE_SLOT"
      case "sidebar":
        return "YOUR_SIDEBAR_RESPONSIVE_SLOT"
      case "infeed":
        return "YOUR_INFEED_RESPONSIVE_SLOT"
      default:
        return "YOUR_DEFAULT_RESPONSIVE_SLOT"
    }
  }

  return (
    <AdSenseAd
      adSlot={getAdSlot()}
      adFormat="auto"
      className={`responsive-ad responsive-ad-${placement} ${className}`}
      style={{ minHeight: "50px" }}
    />
  )
}
