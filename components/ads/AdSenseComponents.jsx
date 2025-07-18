"use client"

import { useEffect, useState, useRef } from "react"
import { useAdFrequency } from "../../hooks/useAdFrequency"
import { useAdBlockDetector } from "../../hooks/useAdBlockDetector"
import { useMobileDetection } from "../../hooks/useMobileDetection"

// Helper to load Google AdSense script
const AdSenseScript = () => {
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID
  const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"

  useEffect(() => {
    if (isAdSenseEnabled && publisherId && typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      script.async = true
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)

      // Push an empty ad slot to the adsbygoogle array to initialize it
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    }
  }, [publisherId, isAdSenseEnabled])

  return null
}

// Generic AdSense Ad component
const AdSenseAd = ({ slotId, adFormat = "auto", className = "", style = {}, adTest = false }) => {
  const adRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const { shouldShowAd } = useAdFrequency(slotId)
  const { isAdBlocked } = useAdBlockDetector()
  const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true"

  useEffect(() => {
    if (!adRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Stop observing once visible
        }
      },
      { threshold: 0.1 }, // Trigger when 10% of the ad is visible
    )

    observer.observe(adRef.current)

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible && isAdSenseEnabled && shouldShowAd && !isAdBlocked && slotId && typeof window !== "undefined") {
      try {
        // Push the ad to the adsbygoogle array
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        console.error("AdSense push error:", e)
      }
    }
  }, [isVisible, isAdSenseEnabled, shouldShowAd, isAdBlocked, slotId])

  if (!isAdSenseEnabled) {
    return (
      <div
        className={`ad-placeholder bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={style}
      >
        AdSense Disabled
      </div>
    )
  }

  if (isAdBlocked) {
    return (
      <div
        className={`ad-placeholder bg-red-100 flex items-center justify-center text-red-700 ${className}`}
        style={style}
      >
        Ad Blocker Detected
      </div>
    )
  }

  if (!shouldShowAd) {
    return (
      <div
        className={`ad-placeholder bg-yellow-100 flex items-center justify-center text-yellow-700 ${className}`}
        style={style}
      >
        Ad Frequency Limit Reached
      </div>
    )
  }

  if (!slotId) {
    return (
      <div
        className={`ad-placeholder bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={style}
      >
        Ad Slot ID Missing
      </div>
    )
  }

  return (
    <div className={`ad-container ${className}`} style={style} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        data-adtest={isTestMode || adTest ? "on" : undefined} // Use VITE_ADSENSE_TEST_MODE or component prop
      ></ins>
    </div>
  )
}

// Specific AdSense Ad Components
export const HeaderBannerAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_HEADER_BANNER
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const MobileBannerAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_MOBILE_BANNER
  const { isMobile } = useMobileDetection()
  if (!isMobile) return null // Only show on mobile
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const FooterBannerAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_FOOTER_BANNER
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const SidebarSkyscraperAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const ContentRectangleAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const InFeedNativeAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const InArticleNativeAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export const MainDisplayAd = ({ className, style }) => {
  const slotId = import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT
  return <AdSenseAd slotId={slotId} className={className} style={style} />
}

export default AdSenseScript
