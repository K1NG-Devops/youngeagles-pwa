"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useGoogleAds } from "./ads/GoogleAdsProvider"

const MobileAdDebugger: React.FC = () => {
  const { isAdBlockerDetected, isAdsLoaded, adError } = useGoogleAds()
  const [isVisible, setIsVisible] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV !== "development") {
      return
    }

    const collectDebugInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        adsbygoogle: typeof window.adsbygoogle !== "undefined",
        adElements: document.querySelectorAll(".adsbygoogle").length,
        adBlockerDetected: isAdBlockerDetected,
        adsLoaded: isAdsLoaded,
        adError: adError,
        timestamp: new Date().toISOString(),
      }
      setDebugInfo(info)
    }

    collectDebugInfo()
    const interval = setInterval(collectDebugInfo, 5000)

    return () => clearInterval(interval)
  }, [isAdBlockerDetected, isAdsLoaded, adError])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Ad Debugger"
      >
        🐛
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Ad Debug Info</h3>
            <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Ad Blocker:</span>
              <span className={isAdBlockerDetected ? "text-red-600" : "text-green-600"}>
                {isAdBlockerDetected ? "Detected" : "Not Detected"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Ads Loaded:</span>
              <span className={isAdsLoaded ? "text-green-600" : "text-red-600"}>{isAdsLoaded ? "Yes" : "No"}</span>
            </div>

            {adError && (
              <div className="flex justify-between">
                <span className="font-medium">Error:</span>
                <span className="text-red-600 text-xs">{adError}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="font-medium">Viewport:</span>
              <span>
                {debugInfo.viewport?.width}x{debugInfo.viewport?.height}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Ad Elements:</span>
              <span>{debugInfo.adElements}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">AdsByGoogle:</span>
              <span className={debugInfo.adsbygoogle ? "text-green-600" : "text-red-600"}>
                {debugInfo.adsbygoogle ? "Available" : "Not Available"}
              </span>
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileAdDebugger
