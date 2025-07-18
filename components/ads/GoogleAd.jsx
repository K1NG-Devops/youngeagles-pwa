"use client"

import { useEffect, useRef, useState } from "react"

const GoogleAd = ({
  slot,
  style = {},
  format = "auto",
  responsive = true,
  hideWhenEmpty = true,
  className = "",
  onAdLoad = null,
  onAdError = null,
}) => {
  const adRef = useRef(null)
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Check if AdSense is enabled
  const adSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true"

  useEffect(() => {
    // Don't load ads if disabled or missing config
    if (!adSenseEnabled || !publisherId || !slot) {
      return
    }

    const loadAd = async () => {
      try {
        // Wait for AdSense script to be available
        if (typeof window.adsbygoogle === "undefined") {
          // Load AdSense script if not already loaded
          await loadAdSenseScript()
        }

        // Initialize ad
        if (adRef.current && !adLoaded) {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          setAdLoaded(true)
          setIsVisible(true)

          if (onAdLoad) {
            onAdLoad()
          }
        }
      } catch (error) {
        console.error("Error loading ad:", error)
        setAdError(error.message)

        if (onAdError) {
          onAdError(error)
        }
      }
    }

    // Use intersection observer to load ads when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !adLoaded) {
            loadAd()
          }
        })
      },
      { threshold: 0.1 },
    )

    if (adRef.current) {
      observer.observe(adRef.current)
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current)
      }
    }
  }, [slot, adSenseEnabled, publisherId, adLoaded, onAdLoad, onAdError])

  const loadAdSenseScript = () => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="adsbygoogle.js"]`)) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      script.async = true
      script.crossOrigin = "anonymous"

      script.onload = resolve
      script.onerror = reject

      document.head.appendChild(script)
    })
  }

  // Don't render if ads are disabled or missing config
  if (!adSenseEnabled || !publisherId || !slot) {
    return null
  }

  // Hide empty ads if configured
  if (hideWhenEmpty && adError) {
    return null
  }

  return (
    <div className={`google-ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
        data-ad-test={testMode ? "on" : undefined}
      />

      {/* Error fallback */}
      {adError && !hideWhenEmpty && (
        <div className="ad-error-fallback bg-gray-100 p-4 text-center text-sm text-gray-600 rounded">
          Ad failed to load
        </div>
      )}
    </div>
  )
}

export default GoogleAd
