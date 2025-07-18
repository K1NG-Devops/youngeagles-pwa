"use client"

import { useEffect, useState } from "react"
import { useAdFrequency } from "../../hooks/useAdFrequency"
import { useAdBlockDetector } from "../../hooks/useAdBlockDetector"
import { useMobileAdOptimizer } from "../../hooks/useMobileAdOptimizer"

const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"
const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true"
const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID

const adUnitSlots = {
  mobileBanner: import.meta.env.VITE_ADSENSE_MOBILE_BANNER,
  footerBanner: import.meta.env.VITE_ADSENSE_FOOTER_BANNER,
  headerBanner: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
  sidebarSkyscraper: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER,
  contentRectangle: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
  inFeedNative: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE,
  inArticleNative: import.meta.env.env.VITE_ADSENSE_IN_ARTICLE_NATIVE,
  mainDisplay: import.meta.env.VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT, // Using the new variable name
}

const AdSenseScript = () => {
  useEffect(() => {
    if (isAdSenseEnabled && typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      script.async = true
      script.crossOrigin = "anonymous"
      document.head.appendChild(script)

      script.onload = () => {
        console.log("AdSense script loaded.")
        if (isTestMode) {
          console.log("AdSense is in test mode. Ads will not generate revenue.")
        }
      }
      script.onerror = (e) => {
        console.error("Failed to load AdSense script:", e)
      }
    }
  }, [])
  return null
}

const AdSenseAd = ({ slotId, format = "auto", responsive = "true", className = "" }) => {
  const { shouldShowAd, recordAdImpression } = useAdFrequency()
  const { adBlocked } = useAdBlockDetector()
  const { isMobile } = useMobileAdOptimizer()
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    if (isAdSenseEnabled && !adBlocked && shouldShowAd && typeof window !== "undefined" && window.adsbygoogle) {
      try {
        const pushAd = () => {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          setAdLoaded(true)
          recordAdImpression()
        }

        // Ensure the ad container is visible before pushing the ad
        const adContainer = document.getElementById(`ad-container-${slotId}`)
        if (adContainer && adContainer.offsetParent !== null) {
          // Check if element is visible
          pushAd()
        } else {
          // If not visible, wait for it to become visible or try again
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                pushAd()
                observer.disconnect()
              }
            },
            { threshold: 0.1 },
          )
          if (adContainer) observer.observe(adContainer)
        }
      } catch (e) {
        console.error("Error pushing AdSense ad:", e)
      }
    }
  }, [slotId, isAdSenseEnabled, adBlocked, shouldShowAd, recordAdImpression])

  if (!isAdSenseEnabled) {
    return <div className={`ad-placeholder ${className}`}>AdSense is disabled.</div>
  }

  if (adBlocked) {
    return <div className={`ad-placeholder ${className}`}>Ad Blocker Detected. Please disable to see ads.</div>
  }

  if (!shouldShowAd) {
    return <div className={`ad-placeholder ${className}`}>Ad frequency limit reached.</div>
  }

  return (
    <div id={`ad-container-${slotId}`} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        data-adtest={isTestMode ? "on" : undefined}
      ></ins>
      {!adLoaded && <div className="ad-loading-spinner">Loading Ad...</div>}
    </div>
  )
}

export const MobileBannerAd = ({ className }) => {
  const { isMobile } = useMobileAdOptimizer()
  if (!isMobile) return null
  return <AdSenseAd slotId={adUnitSlots.mobileBanner} format="auto" responsive="true" className={className} />
}

export const HeaderBannerAd = ({ className }) => {
  const { isMobile } = useMobileAdOptimizer()
  if (isMobile) return null // Only show on desktop
  return <AdSenseAd slotId={adUnitSlots.headerBanner} format="auto" responsive="true" className={className} />
}

export const FooterBannerAd = ({ className }) => {
  return <AdSenseAd slotId={adUnitSlots.footerBanner} format="auto" responsive="true" className={className} />
}

export const SidebarSkyscraperAd = ({ className }) => {
  const { isMobile } = useMobileAdOptimizer()
  if (isMobile) return null // Only show on desktop
  return <AdSenseAd slotId={adUnitSlots.sidebarSkyscraper} format="auto" responsive="true" className={className} />
}

export const ContentRectangleAd = ({ className }) => {
  return <AdSenseAd slotId={adUnitSlots.contentRectangle} format="rectangle" responsive="true" className={className} />
}

export const InFeedNativeAd = ({ className }) => {
  return <AdSenseAd slotId={adUnitSlots.inFeedNative} format="fluid" responsive="true" className={className} />
}

export const InArticleNativeAd = ({ className }) => {
  return <AdSenseAd slotId={adUnitSlots.inArticleNative} format="fluid" responsive="true" className={className} />
}

export const MainDisplayAd = ({ className }) => {
  return <AdSenseAd slotId={adUnitSlots.mainDisplay} format="auto" responsive="true" className={className} />
}

export default AdSenseScript
